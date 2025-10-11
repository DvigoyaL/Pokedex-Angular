import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PokemonDetails, EvolutionChain, ChainLink } from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';
import { FavoritesService } from '../../services/favorites.service';
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

// Estados de la máquina de filtrado
type FilterState = 'IDLE' | 'LOADING_PRIMARY' | 'PRIMARY_LOADED' | 'ERROR';

interface PrimaryFilterInfo {
  type: 'type' | 'generation' | 'habitat' | null;
  value: string | number | null;
}

interface FilterStateData {
  state: FilterState;
  firstFilter: PrimaryFilterInfo; // El PRIMER filtro aplicado (el que llamó a la API)
  additionalPrimaryFilters: FilterCriteria; // Filtros primarios adicionales aplicados localmente
  apiResults: PokemonDetails[]; // Resultados de la API sin filtros adicionales
  filteredResults: PokemonDetails[]; // Resultados con todos los filtros aplicados
}

@Component({
  selector: 'pokedex-filters-page',
  standalone: true,
  imports: [CommonModule, PokemonBasicCard, PokemonModalCard, FilterPanel, NavigationButtons],
  templateUrl: './filters-page.html',
  styleUrls: ['./filters-page.css'],
})
export default class FiltersPage implements OnInit {
  private pokemonService = inject(Pokemon);
  private pokemonUtils = inject(PokemonUtilsService);
  public favoritesService = inject(FavoritesService);

  // Estado de la máquina de filtrado
  filterStateData: FilterStateData = {
    state: 'IDLE',
    firstFilter: { type: null, value: null },
    additionalPrimaryFilters: { types: [], generations: [], habitats: [], minHeight: undefined, maxHeight: undefined, minWeight: undefined, maxWeight: undefined },
    apiResults: [],
    filteredResults: [],
  };

  displayedPokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 0;
  itemsPerPage: number = 21;
  isFilterPanelOpen: boolean = false;

  // Guardar los criterios actuales para filtros secundarios
  private currentSecondaryCriteria: {
    minHeight?: number;
    maxHeight?: number;
    minWeight?: number;
    maxWeight?: number;
  } = {};

  ngOnInit(): void {
    // Ya no cargamos Pokémon al inicio, esperamos a que el usuario filtre
  }

  // Método principal que se llama cuando cambian los filtros
  onFilterChange(criteria: FilterCriteria): void {
    this.currentPage = 0;

    // Detectar si hay filtros primarios
    const hasPrimaryFilter = criteria.types.length > 0 ||
                            criteria.generations.length > 0 ||
                            criteria.habitats.length > 0;

    // Detectar si hay filtros secundarios (altura/peso)
    const hasSecondaryFilters = criteria.minHeight !== undefined ||
                               criteria.maxHeight !== undefined ||
                               criteria.minWeight !== undefined ||
                               criteria.maxWeight !== undefined;

    // Si no hay filtros, resetear al estado IDLE
    if (!hasPrimaryFilter && !hasSecondaryFilters) {
      this.resetFilters();
      return;
    }

    // Si solo hay filtros secundarios sin primarios, ignorar
    if (!hasPrimaryFilter && hasSecondaryFilters) {
      return;
    }

    // Guardar filtros secundarios (altura/peso)
    this.currentSecondaryCriteria = {
      minHeight: criteria.minHeight,
      maxHeight: criteria.maxHeight,
      minWeight: criteria.minWeight,
      maxWeight: criteria.maxWeight,
    };

    // Determinar el primer filtro que debe llamar a la API
    const firstFilterToApply = this.determineFirstFilter(criteria);

    // Si no hay primer filtro definido aún (estado IDLE), cargar desde API
    if (this.filterStateData.state === 'IDLE' && firstFilterToApply) {
      this.loadFromAPI(firstFilterToApply, criteria);
      return;
    }

    // Si el primer filtro cambió (se desmarcó el original), recargar desde API
    if (this.firstFilterWasRemoved(criteria) && firstFilterToApply) {
      this.loadFromAPI(firstFilterToApply, criteria);
      return;
    }

    // Si el primer filtro sigue activo, aplicar filtros adicionales localmente
    if (this.filterStateData.state === 'PRIMARY_LOADED') {
      this.filterStateData.additionalPrimaryFilters = criteria;
      this.applyAllFiltersLocally(criteria);
    }
  }

  // Determina cuál debe ser el primer filtro (prioridad: type > generation > habitat)
  private determineFirstFilter(criteria: FilterCriteria): PrimaryFilterInfo | null {
    if (criteria.types.length > 0) {
      return { type: 'type', value: criteria.types[0] };
    }
    if (criteria.generations.length > 0) {
      return { type: 'generation', value: criteria.generations[0] };
    }
    if (criteria.habitats.length > 0) {
      return { type: 'habitat', value: criteria.habitats[0] };
    }
    return null;
  }

  // Verifica si el primer filtro fue removido
  private firstFilterWasRemoved(criteria: FilterCriteria): boolean {
    const currentFirst = this.filterStateData.firstFilter;

    if (!currentFirst.type) return false;

    // Verificar si el primer filtro actual ya no está en los criterios
    if (currentFirst.type === 'type') {
      return !criteria.types.includes(currentFirst.value as string);
    }
    if (currentFirst.type === 'generation') {
      return !criteria.generations.includes(currentFirst.value as number);
    }
    if (currentFirst.type === 'habitat') {
      return !criteria.habitats.includes(currentFirst.value as string);
    }

    return false;
  }

  // Carga datos desde la API usando el primer filtro
  private loadFromAPI(firstFilter: PrimaryFilterInfo, allCriteria: FilterCriteria): void {
    this.filterStateData.firstFilter = firstFilter;
    this.filterStateData.additionalPrimaryFilters = allCriteria;

    if (firstFilter.type === 'type') {
      this.loadPokemonByType(firstFilter.value as string);
    } else if (firstFilter.type === 'generation') {
      this.loadPokemonByGeneration(firstFilter.value as number);
    } else if (firstFilter.type === 'habitat') {
      this.loadPokemonByHabitat(firstFilter.value as string);
    }
  }

  private resetFilters(): void {
    this.filterStateData = {
      state: 'IDLE',
      firstFilter: { type: null, value: null },
      additionalPrimaryFilters: { types: [], generations: [], habitats: [], minHeight: undefined, maxHeight: undefined, minWeight: undefined, maxWeight: undefined },
      apiResults: [],
      filteredResults: [],
    };
    this.currentSecondaryCriteria = {};
    this.displayedPokemonList = [];
    this.error = null;
  }

  // Aplica todos los filtros (primarios adicionales + secundarios) sobre los resultados de la API
  private applyAllFiltersLocally(criteria: FilterCriteria): void {
    let results = [...this.filterStateData.apiResults];

    // Aplicar filtros primarios adicionales (los que NO fueron usados para la llamada a la API)

    // Filtrar por tipos adicionales
    if (criteria.types.length > 0) {
      results = results.filter((pokemon) => {
        const pokemonTypes = pokemon.types.map((t) => t.type.name);

        // Caso especial: Si hay 2 tipos, usar lógica AND (debe tener AMBOS)
        if (criteria.types.length === 2 && this.filterStateData.firstFilter.type === 'type') {
          // El primer tipo ya vino de la API, verificar que tenga el segundo tipo
          const secondType = criteria.types.find(t => t !== this.filterStateData.firstFilter.value);
          return secondType ? pokemonTypes.includes(secondType) : true;
        }

        // Para otros casos (generaciones, hábitats), usar lógica OR
        return criteria.types.some((type) => pokemonTypes.includes(type));
      });
    }

    // Filtrar por generaciones adicionales
    if (criteria.generations.length > 0) {
      results = results.filter((pokemon) => {
        const generation = this.pokemonUtils.getGenerationFromId(pokemon.id);
        return criteria.generations.includes(generation);
      });
    }

    // Filtrar por hábitats adicionales
    if (criteria.habitats.length > 0) {
      results = results.filter((pokemon) => {
        return criteria.habitats.includes(pokemon.habitat || 'unknown');
      });
    }

    // Aplicar filtros secundarios (altura/peso)
    if (this.currentSecondaryCriteria.minHeight !== undefined) {
      results = results.filter(p => p.height >= this.currentSecondaryCriteria.minHeight! * 10);
    }
    if (this.currentSecondaryCriteria.maxHeight !== undefined) {
      results = results.filter(p => p.height <= this.currentSecondaryCriteria.maxHeight! * 10);
    }
    if (this.currentSecondaryCriteria.minWeight !== undefined) {
      results = results.filter(p => p.weight >= this.currentSecondaryCriteria.minWeight! * 10);
    }
    if (this.currentSecondaryCriteria.maxWeight !== undefined) {
      results = results.filter(p => p.weight <= this.currentSecondaryCriteria.maxWeight! * 10);
    }

    this.filterStateData.filteredResults = results;
    this.updateDisplayedPokemon();
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

  // Métodos para cargar desde endpoints específicos
  private loadPokemonByType(typeName: string): void {
    this.isLoading = true;
    this.filterStateData.state = 'LOADING_PRIMARY';
    this.error = null;

    this.pokemonService.getPokemonByType(typeName)
      .pipe(
        switchMap((typeResponse) => {
          if (!typeResponse.pokemon || typeResponse.pokemon.length === 0) {
            return of([]);
          }
          const detailObservables = typeResponse.pokemon.map((item) =>
            this.getFullPokemonDetails(item.pokemon.url)
          );
          return forkJoin(detailObservables);
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon by type', error);
          this.error = `No se pudieron cargar Pokémon de tipo ${typeName}`;
          this.filterStateData.state = 'ERROR';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.filterStateData.apiResults = detailedPokemons.filter(p => p !== null) as PokemonDetails[];
        this.filterStateData.state = 'PRIMARY_LOADED';
        // Aplicar todos los filtros adicionales sobre los resultados de la API
        this.applyAllFiltersLocally(this.filterStateData.additionalPrimaryFilters);
        this.isLoading = false;
      });
  }

  private loadPokemonByGeneration(generationId: number): void {
    this.isLoading = true;
    this.filterStateData.state = 'LOADING_PRIMARY';
    this.error = null;

    this.pokemonService.getPokemonByGeneration(generationId)
      .pipe(
        switchMap((genResponse) => {
          if (!genResponse.pokemon_species || genResponse.pokemon_species.length === 0) {
            return of([]);
          }
          // Convertir URLs de species a URLs de pokemon
          const detailObservables = genResponse.pokemon_species.map((species) => {
            const speciesId = species.url.split('/').filter(Boolean).pop();
            return this.getFullPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${speciesId}/`);
          });
          return forkJoin(detailObservables);
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon by generation', error);
          this.error = `No se pudieron cargar Pokémon de generación ${generationId}`;
          this.filterStateData.state = 'ERROR';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.filterStateData.apiResults = detailedPokemons.filter(p => p !== null) as PokemonDetails[];
        this.filterStateData.state = 'PRIMARY_LOADED';
        // Aplicar todos los filtros adicionales sobre los resultados de la API
        this.applyAllFiltersLocally(this.filterStateData.additionalPrimaryFilters);
        this.isLoading = false;
      });
  }

  private loadPokemonByHabitat(habitatName: string): void {
    this.isLoading = true;
    this.filterStateData.state = 'LOADING_PRIMARY';
    this.error = null;

    // Caso especial: 'unknown' no existe como endpoint en la API
    // Necesitamos cargar Pokémon de varias generaciones y filtrar los que no tienen hábitat
    if (habitatName === 'unknown') {
      this.loadPokemonWithoutHabitat();
      return;
    }

    this.pokemonService.getPokemonByHabitat(habitatName)
      .pipe(
        switchMap((habitatResponse) => {
          if (!habitatResponse.pokemon_species || habitatResponse.pokemon_species.length === 0) {
            return of([]);
          }
          // Convertir URLs de species a URLs de pokemon
          const detailObservables = habitatResponse.pokemon_species.map((species) => {
            const speciesId = species.url.split('/').filter(Boolean).pop();
            return this.getFullPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${speciesId}/`);
          });
          return forkJoin(detailObservables);
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon by habitat', error);
          this.error = `No se pudieron cargar Pokémon de hábitat ${habitatName}`;
          this.filterStateData.state = 'ERROR';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.filterStateData.apiResults = detailedPokemons.filter(p => p !== null) as PokemonDetails[];
        this.filterStateData.state = 'PRIMARY_LOADED';
        // Aplicar todos los filtros adicionales sobre los resultados de la API
        this.applyAllFiltersLocally(this.filterStateData.additionalPrimaryFilters);
        this.isLoading = false;
      });
  }

  // Método especial para cargar Pokémon sin hábitat definido (unknown)
  private loadPokemonWithoutHabitat(): void {
    // Cargar Pokémon de las primeras generaciones (donde hay más Pokémon sin hábitat definido)
    // Vamos a cargar Gen 1-8 para tener una buena cobertura
    const generationObservables = [1, 2, 3, 4, 5, 6, 7, 8].map(genId =>
      this.pokemonService.getPokemonByGeneration(genId)
    );

    forkJoin(generationObservables)
      .pipe(
        switchMap((generationResponses) => {
          // Combinar todos los Pokémon de todas las generaciones
          const allSpecies: Array<{name: string, url: string}> = [];
          generationResponses.forEach(genResponse => {
            if (genResponse.pokemon_species) {
              allSpecies.push(...genResponse.pokemon_species);
            }
          });

          // Cargar detalles de todos
          const detailObservables = allSpecies.map((species) => {
            const speciesId = species.url.split('/').filter(Boolean).pop();
            return this.getFullPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${speciesId}/`);
          });

          return forkJoin(detailObservables);
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon without habitat', error);
          this.error = 'No se pudieron cargar Pokémon sin hábitat definido';
          this.filterStateData.state = 'ERROR';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        // Filtrar solo los que tienen habitat 'unknown' o null
        const pokemonWithoutHabitat = detailedPokemons.filter(p =>
          p !== null && (p.habitat === 'unknown' || p.habitat === null)
        ) as PokemonDetails[];

        this.filterStateData.apiResults = pokemonWithoutHabitat;
        this.filterStateData.state = 'PRIMARY_LOADED';
        // Aplicar todos los filtros adicionales sobre los resultados de la API
        this.applyAllFiltersLocally(this.filterStateData.additionalPrimaryFilters);
        this.isLoading = false;
      });
  }


  private updateDisplayedPokemon(): void {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPokemonList = this.filterStateData.filteredResults.slice(startIndex, endIndex);
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
    return this.pokemonUtils.getColorForType(typeName);
  }

  onNextPage(): void {
    if ((this.currentPage + 1) * this.itemsPerPage < this.filterStateData.filteredResults.length) {
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
    return (this.currentPage + 1) * this.itemsPerPage < this.filterStateData.filteredResults.length;
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 0;
  }

  get totalResults(): number {
    return this.filterStateData.filteredResults.length;
  }

  toggleFilterPanel(): void {
    this.isFilterPanelOpen = !this.isFilterPanelOpen;
  }

  closeFilterPanel(): void {
    this.isFilterPanelOpen = false;
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
}

