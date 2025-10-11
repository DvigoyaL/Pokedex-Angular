import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter } from '@angular/core';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';
import { FavoritesService } from '../../services/favorites.service';
import { SearchService } from '../../services/search.service';
import { forkJoin, switchMap, catchError, of, map, Observable, Subscription } from 'rxjs';
import { PokemonBasicCard } from '../pokemon-basic-card/pokemon-basic-card';
import { PokemonModalCard } from '../pokemon-modal-card/pokemon-modal-card';

export interface SearchResultsData {
  pokemon: PokemonDetails[];
  isLoading: boolean;
  error: string | null;
  hasResults: boolean;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, PokemonBasicCard, PokemonModalCard],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css'],
})
export class SearchResults implements OnInit, OnDestroy {
  private pokemonService = inject(Pokemon);
  private searchService = inject(SearchService);
  private pokemonUtils = inject(PokemonUtilsService);
  public favoritesService = inject(FavoritesService);

  // Inputs
  @Input() allPokemonList: { name: string; url: string }[] = [];
  @Input() limit: number = 21;

  // Outputs
  @Output() searchResultsChange = new EventEmitter<SearchResultsData>();
  @Output() pokemonSelected = new EventEmitter<PokemonDetails>();

  // Estado interno
  searchResults: PokemonDetails[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  selectedPokemon: PokemonDetails | null = null;
  currentSearchTerm: string = '';

  private searchSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.subscribeToSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private subscribeToSearch(): void {
    this.searchSubscription = this.searchService.searchTerm$.subscribe((term) => {
      this.currentSearchTerm = term;
      this.performSearch(term);
    });
  }

  private performSearch(searchTerm: string): void {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    if (!searchTerm) {
      this.clearResults();
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Filtrar Pokémon que coincidan con el término de búsqueda
    const matched = this.allPokemonList
      .filter((pokemon) => pokemon.name.toLowerCase().includes(lowerCaseSearchTerm))
      .slice(0, this.limit);

    if (matched.length === 0) {
      this.searchResults = [];
      this.isLoading = false;
      this.error = `No Pokémon found matching "${searchTerm}".`;
      this.emitResults();
      return;
    }

    // Cargar detalles completos de los Pokémon encontrados
    const detailObservables = matched.map((pokemon) => this.getFullPokemonDetails(pokemon.url));

    forkJoin(detailObservables).subscribe((detailedPokemons) => {
      this.searchResults = detailedPokemons.filter((p) => p !== null) as PokemonDetails[];
      this.isLoading = false;
      this.error = null;
      this.emitResults();
    });
  }

  private clearResults(): void {
    this.searchResults = [];
    this.isLoading = false;
    this.error = null;
    this.emitResults();
  }

  private emitResults(): void {
    const results: SearchResultsData = {
      pokemon: this.searchResults,
      isLoading: this.isLoading,
      error: this.error,
      hasResults: this.searchResults.length > 0
    };
    this.searchResultsChange.emit(results);
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

                const evoChain = this.flattenEvolutionChain(evolutionChain.chain);

                return {
                  ...details,
                  habitat: species.habitat?.name || 'unknown',
                  description,
                  weaknesses: Array.from(weaknesses),
                  evolutionChain: evoChain,
                };
              })
            );
          })
        );
      }),
      catchError((error) => {
        console.error(`Failed to load details for ${url}`, error);
        return of(null);
      })
    );
  }

  private flattenEvolutionChain(chainLink: any): { name: string; id: string }[] {
    const chain: { name: string; id: string }[] = [];
    let currentLink: any = chainLink;

    while (currentLink) {
      const urlParts = currentLink.species.url.split('/');
      const id = urlParts[urlParts.length - 2];
      chain.push({ name: currentLink.species.name, id });

      if (currentLink.evolves_to.length > 1) {
        currentLink.evolves_to.forEach((evo: any) => {
          const evoUrlParts = evo.species.url.split('/');
          const evoId = evoUrlParts[evoUrlParts.length - 2];
          chain.push({ name: evo.species.name, id: evoId });
        });
        currentLink = undefined;
      } else {
        currentLink = currentLink.evolves_to[0];
      }
    }
    return chain;
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
          this.pokemonSelected.emit(detailedPokemon);
        }
        this.isLoading = false;
      });
  }

  closeModal(): void {
    this.selectedPokemon = null;
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

  // Métodos públicos para control externo
  public clearSearch(): void {
    this.searchService.updateSearchTerm('');
  }

  public isSearching(): boolean {
    return this.currentSearchTerm.length > 0;
  }

  public getSearchTerm(): string {
    return this.currentSearchTerm;
  }
}
