import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { FavoritesService, FavoritePokemon } from '../../services/favorites.service';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';
import { forkJoin, switchMap, catchError, of } from 'rxjs';
import { PokemonBasicCard } from '../../components/pokemon-basic-card/pokemon-basic-card';
import { PokemonModalCard } from '../../components/pokemon-modal-card/pokemon-modal-card';

@Component({
  selector: 'pokedex-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PokemonBasicCard, PokemonModalCard],
  templateUrl: './favorites-page.html',
  styleUrls: ['./favorites-page.css'],
})
export default class FavoritesPage implements OnInit {
  private pokemonService = inject(Pokemon);
  public favoritesService = inject(FavoritesService);
  private pokemonUtils = inject(PokemonUtilsService);

  favoritePokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadFavorites();

    // Subscribirse a cambios en favoritos
    this.favoritesService.favorites$.subscribe(() => {
      this.loadFavorites();
    });
  }

  private loadFavorites(): void {
    const favorites = this.favoritesService.getFavorites();

    if (favorites.length === 0) {
      this.favoritePokemonList = [];
      return;
    }

    this.isLoading = true;
    this.error = null;

    const detailObservables = favorites.map(fav =>
      this.getFullPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${fav.id}/`)
    );

    forkJoin(detailObservables)
      .pipe(
        catchError(error => {
          console.error('Failed to load favorite Pokémon', error);
          this.error = 'Failed to load some Pokémon. Please try again.';
          return of([]);
        })
      )
      .subscribe(detailedPokemons => {
        this.favoritePokemonList = detailedPokemons.filter(p => p !== null) as PokemonDetails[];
        this.isLoading = false;
      });
  }

  private getFullPokemonDetails(url: string) {
    return this.pokemonService.getPokemonDetails(url).pipe(
      switchMap((details: PokemonDetails) => {
        return this.pokemonService.getPokemonSpecies(details.species.url).pipe(
          switchMap((species) => {
            const typeObservables = details.types.map(typeInfo =>
              this.pokemonService.getTypeDetails(typeInfo.type.url)
            );

            const evolutionChainObservable = this.pokemonService.getEvolutionChain(
              species.evolution_chain.url
            );

            return forkJoin({
              typeDetails: forkJoin(typeObservables),
              evolutionChain: evolutionChainObservable,
            }).pipe(
              switchMap(({ typeDetails, evolutionChain }) => {
                const description =
                  species.flavor_text_entries
                    .find(e => e.language.name === 'en')
                    ?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description.';

                const weaknesses = new Set<string>();
                const resistances = new Set<string>();
                typeDetails.forEach(t => {
                  t.damage_relations.double_damage_from.forEach(d => weaknesses.add(d.name));
                  t.damage_relations.half_damage_from.forEach(d => resistances.add(d.name));
                  t.damage_relations.no_damage_from.forEach(d => resistances.add(d.name));
                });
                resistances.forEach(r => weaknesses.delete(r));

                const evoChain = this.flattenEvolutionChain(evolutionChain.chain);

                return of({
                  ...details,
                  habitat: species.habitat?.name || 'unknown',
                  description,
                  weaknesses: Array.from(weaknesses),
                  evolutionChain: evoChain,
                });
              })
            );
          })
        );
      }),
      catchError(error => {
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
    if ('name' in pokemon) {
      this.selectedPokemon = pokemon;
    }
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

  clearAllFavorites(): void {
    if (confirm('Are you sure you want to remove all favorites?')) {
      this.favoritesService.clearAllFavorites();
    }
  }
}

