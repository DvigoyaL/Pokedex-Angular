import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  PokemonDetails,
  PokemonListResponse,
  PokemonSpecies,
  TypeDetails,
  EvolutionChain,
  ChainLink,
} from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';
import { FavoritesService } from '../../services/favorites.service';
import { forkJoin, switchMap, catchError, of, map, Observable, Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { PokemonBasicCard } from '../../components/pokemon-basic-card/pokemon-basic-card';
import { NavigationButtons } from '../../components/navigation-buttons/navigation-buttons';
import { PokemonModalCard } from '../../components/pokemon-modal-card/pokemon-modal-card';
import { SearchResults, SearchResultsData } from '../../components/search-results/search-results';

@Component({
  selector: 'pokedex-list-page',
  standalone: true,
  imports: [CommonModule, PokemonBasicCard, NavigationButtons, PokemonModalCard, SearchResults],
  templateUrl: './list-page.html',
  styleUrl: './list-page.css',
})
export default class ListPage implements OnInit, OnDestroy {
  private pokemonService = inject(Pokemon);
  private searchService = inject(SearchService);
  private pokemonUtils = inject(PokemonUtilsService);
  public favoritesService = inject(FavoritesService);

  pokemonList: PokemonDetails[] = [];
  allPokemonList: { name: string; url: string }[] = [];
  selectedPokemon: PokemonDetails | null = null;
  offset: number = 0;
  limit: number = 21;
  isLoading: boolean = false;
  error: string | null = null;
  isSearching: boolean = false;

  ngOnInit(): void {
    this.loadAllPokemonNames();
    this.loadPokemon();
    this.subscribeToSearchState();
  }

  loadPokemon(): void {
    this.isLoading = true;
    this.error = null;
    this.pokemonService
      .getListPokemon(this.offset, this.limit)
      .pipe(
        switchMap((listResponse) => {
          if (!listResponse.results || listResponse.results.length === 0) {
            return of([]);
          }
          const detailObservables = listResponse.results.map((pokemonListItem) =>
            this.getFullPokemonDetails(pokemonListItem.url)
          );
          return forkJoin(detailObservables);
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon list', error);
          this.error = 'Could not load Pokémon. Please try again later.';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.pokemonList = detailedPokemons as PokemonDetails[];
        this.isLoading = false;
      });
  }

  private loadAllPokemonNames(): void {
    // Carga todos los nombres de Pokémon para la búsqueda. Usamos un límite alto.
    this.pokemonService.getListPokemon(0, 1500).subscribe((response) => {
      this.allPokemonList = response.results;
    });
  }

  private subscribeToSearchState(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.isSearching = term.length > 0;
    });
  }

  // Métodos para manejar eventos del componente de búsqueda
  onSearchResultsChange(results: SearchResultsData): void {
    // No sobrescribir isSearching aquí, ya que se maneja en subscribeToSearchState
    // Solo emitir los resultados para que otros componentes puedan reaccionar si es necesario
  }

  onSearchPokemonSelected(pokemon: PokemonDetails): void {
    this.selectedPokemon = pokemon;
  }

  selectPokemon(pokemon: PokemonDetails | { id: string }): void {
    this.isLoading = true;

    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`;

    this.getFullPokemonDetails(pokemonUrl)
      .pipe(
        catchError((error) => {
          console.error('Failed to load selected Pokémon details', error);
          this.error = 'Could not load the details of this Pokémon.';
          this.closeModal();
          return of(null);
        })
      )
      .subscribe((detailedPokemon) => {
        if (detailedPokemon) {
          this.selectedPokemon = detailedPokemon;
        }
        this.isLoading = false;
      });
  }

  private getFullPokemonDetails(url: string): Observable<PokemonDetails | null> {
    return this.pokemonService.getPokemonDetails(url).pipe(
      switchMap((details: PokemonDetails) => {
        const speciesObservable = this.pokemonService.getPokemonSpecies(details.species.url);
        const typeObservables = details.types.map((typeInfo) =>
          this.pokemonService.getTypeDetails(typeInfo.type.url)
        );

        return speciesObservable.pipe(
          switchMap((species) => {
            const evolutionChainObservable = this.pokemonService.getEvolutionChain(
              species.evolution_chain.url
            );
            return forkJoin({
              species: of(species),
              typeDetails: forkJoin(typeObservables),
              evolutionChain: evolutionChainObservable,
            }).pipe(
              map(({ species, typeDetails, evolutionChain }) => {
                const description =
                  species.flavor_text_entries
                    .find((e) => e.language.name === 'en')
                    ?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description.';

                const weaknesses = new Set<string>();
                const resistances = new Set<string>();
                typeDetails.forEach((t) => {
                  t.damage_relations.double_damage_from.forEach((d) => weaknesses.add(d.name));
                  t.damage_relations.half_damage_from.forEach((d) => resistances.add(d.name));
                  t.damage_relations.no_damage_from.forEach((d) => resistances.add(d.name));
                });
                resistances.forEach((r) => weaknesses.delete(r));

                // Aplanamos toda la cadena evolutiva, incluyendo ramificaciones.
                const evoChain = this.flattenEvolutionChain(evolutionChain.chain);

                return {
                  ...details,
                  habitat: species.habitat?.name || 'Desconocido',
                  description,
                  weaknesses: Array.from(weaknesses),
                  evolutionChain: evoChain, // Ahora contiene la cadena completa
                };
              })
            );
          })
        );
      })
    );
  }

  private flattenEvolutionChain(chainLink: ChainLink): { name: string; id: string }[] {
    const chain: { name: string; id: string }[] = [];
    let currentLink: ChainLink | undefined = chainLink;

    while (currentLink) {
      const urlParts = currentLink.species.url.split('/');
      const id = urlParts[urlParts.length - 2];
      chain.push({ name: currentLink.species.name, id });

      // Si hay múltiples evoluciones (como Eevee), las procesamos todas.
      if (currentLink.evolves_to.length > 1) {
        currentLink.evolves_to.forEach((evo) => {
          const evoUrlParts = evo.species.url.split('/');
          const evoId = evoUrlParts[evoUrlParts.length - 2];
          chain.push({ name: evo.species.name, id: evoId });
        });
        // Detenemos el bucle principal porque ya hemos añadido todas las ramas.
        currentLink = undefined;
      } else {
        // Si es una evolución lineal, simplemente avanzamos.
        currentLink = currentLink.evolves_to[0];
      }
    }
    return chain;
  }

  closeModal(): void {
    this.selectedPokemon = null;
  }

  onPreviousPage(): void {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.loadPokemon();
    }
  }

  onNextPage(): void {
    this.offset += this.limit;
    this.loadPokemon();
  }

  getColorForType(typeName: string): string {
    return this.pokemonUtils.getColorForType(typeName);
  }

  onFavoriteToggled(pokemon: PokemonDetails): void {
    const favoritePokemon = {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default,
    };
    this.favoritesService.toggleFavorite(favoritePokemon);
  }

  isFavorite(pokemonId: number): boolean {
    return this.favoritesService.isFavorite(pokemonId);
  }

  ngOnDestroy(): void {
    // No hay subscriptions que limpiar ya que el componente de búsqueda maneja su propia suscripción
  }
}
