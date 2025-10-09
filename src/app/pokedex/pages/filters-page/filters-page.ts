import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokemonDetails, EvolutionChain, ChainLink } from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { forkJoin, switchMap, catchError, of, map, Observable } from 'rxjs';
import { PokemonBasicCard } from '../../components/pokemon-basic-card/pokemon-basic-card';
import { PokemonModalCard } from '../../components/pokemon-modal-card/pokemon-modal-card';
import { FilterPanel } from '../../components/filter-panel/filter-panel';
import { NavigationButtons } from '../../components/navigation-buttons/navigation-buttons';

export interface FilterCriteria {
  types: string[];
  generations: number[];
  minHeight?: number;
  maxHeight?: number;
  minWeight?: number;
  maxWeight?: number;
  habitats: string[];
}

@Component({
  selector: 'pokedex-filters-page',
  standalone: true,
  imports: [CommonModule, PokemonBasicCard, PokemonModalCard, FilterPanel, NavigationButtons],
  templateUrl: './filters-page.html',
  styleUrls: ['./filters-page.css'],
})
export default class FiltersPage implements OnInit {
  allPokemonList: PokemonDetails[] = [];
  filteredPokemonList: PokemonDetails[] = [];
  displayedPokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  isLoading: boolean = false;
  isInitialLoad: boolean = true;
  error: string | null = null;
  currentPage: number = 0;
  itemsPerPage: number = 21;

  constructor(private pokemonService: Pokemon) {}

  ngOnInit(): void {
    this.loadInitialPokemon();
  }

  private loadInitialPokemon(): void {
    this.isLoading = true;
    this.isInitialLoad = true;
    // Cargar los primeros 300 Pokémon para tener una buena base de datos
    this.pokemonService
      .getListPokemon(0, 300)
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
          this.error = 'No se pudieron cargar los Pokémon. Intenta de nuevo más tarde.';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.allPokemonList = detailedPokemons.filter(p => p !== null) as PokemonDetails[];
        this.filteredPokemonList = this.allPokemonList;
        this.updateDisplayedPokemon();
        this.isLoading = false;
        this.isInitialLoad = false;
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
                  habitat: species.habitat?.name || 'unknown',
                  description,
                  weaknesses: Array.from(weaknesses),
                  evolutionChain: evoChain, // Ahora contiene la cadena completa
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

  onFilterChange(criteria: FilterCriteria): void {
    this.currentPage = 0;
    this.applyFilters(criteria);
  }

  private applyFilters(criteria: FilterCriteria): void {
    this.filteredPokemonList = this.allPokemonList.filter((pokemon) => {
      // Filtrar por tipos (AND logic - el Pokémon debe tener TODOS los tipos seleccionados)
      if (criteria.types.length > 0) {
        const pokemonTypes = pokemon.types.map((t) => t.type.name);
        const hasAllTypes = criteria.types.every((type) => pokemonTypes.includes(type));
        if (!hasAllTypes) return false;
      }

      // Filtrar por generación (basado en ID)
      if (criteria.generations.length > 0) {
        const generation = this.getGenerationFromId(pokemon.id);
        if (!criteria.generations.includes(generation)) return false;
      }

      // Filtrar por altura
      if (criteria.minHeight !== undefined && pokemon.height < criteria.minHeight) return false;
      if (criteria.maxHeight !== undefined && pokemon.height > criteria.maxHeight) return false;

      // Filtrar por peso
      if (criteria.minWeight !== undefined && pokemon.weight < criteria.minWeight) return false;
      if (criteria.maxWeight !== undefined && pokemon.weight > criteria.maxWeight) return false;

      // Filtrar por hábitat
      if (criteria.habitats.length > 0) {
        if (!criteria.habitats.includes(pokemon.habitat || 'unknown')) return false;
      }

      return true;
    });

    this.updateDisplayedPokemon();
  }

  private getGenerationFromId(id: number): number {
    if (id <= 151) return 1;
    if (id <= 251) return 2;
    if (id <= 386) return 3;
    if (id <= 493) return 4;
    if (id <= 649) return 5;
    if (id <= 721) return 6;
    if (id <= 809) return 7;
    if (id <= 905) return 8;
    return 9;
  }

  private updateDisplayedPokemon(): void {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPokemonList = this.filteredPokemonList.slice(startIndex, endIndex);
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

  closeModal(): void {
    this.selectedPokemon = null;
  }

  getColorForType(typeName: string): string {
    const colors: { [key: string]: string } = {
      grass: '#A7DB8D',
      fire: '#f3bb94ff',
      water: '#9DB7F5',
      bug: '#C6D16E',
      normal: '#C6C6A7',
      poison: '#C183C1',
      electric: '#FAE078',
      ground: '#EBD69D',
      fairy: '#F4BDC9',
      fighting: '#D67873',
      psychic: '#FA92B2',
      rock: '#D1C17D',
      ghost: '#A292BC',
      ice: '#BCE6E6',
      dragon: '#A27DFA',
      dark: '#A29288',
      steel: '#D1D1E0',
      flying: '#C6B7F5',
    };
    return colors[typeName.toLowerCase()] || '#C6C6A7';
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.itemsPerPage < this.filteredPokemonList.length) {
      this.currentPage++;
      this.updateDisplayedPokemon();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateDisplayedPokemon();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get hasNextPage(): boolean {
    return (this.currentPage + 1) * this.itemsPerPage < this.filteredPokemonList.length;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  get totalResults(): number {
    return this.filteredPokemonList.length;
  }
}

