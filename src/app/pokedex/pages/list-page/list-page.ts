import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  PokemonDetails,
  ChainLink,
} from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { forkJoin, switchMap, catchError, of, map, Observable } from 'rxjs';
import StatsChart from '../../components/stats-chart/stats-chart';
import {PokemonBasicCard} from '../../components/pokemon-basic-card/pokemon-basic-card';

@Component({
  selector: 'pokedex-list-page',
  standalone: true,
  imports: [CommonModule, StatsChart, PokemonBasicCard],
  templateUrl: './list-page.html',
  styleUrl: './list-page.css',
})
export default class ListPage implements OnInit {
  pokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  offset: number = 0;
  limit: number = 20;
  spriteUrls: string[] = [];
  currentSpriteIndex: number = 0;
  private spriteInterval: any;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private pokemonService: Pokemon) {}

  ngOnInit(): void {
    this.loadPokemon();
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
          console.error('Falló la carga de la lista de Pokémon', error);
          this.error = 'No se pudieron cargar los Pokémon. Intenta de nuevo más tarde.';
          return of([]);
        })
      )
      .subscribe((detailedPokemons) => {
        this.pokemonList = detailedPokemons as PokemonDetails[];
        this.isLoading = false;
      });
  }

  selectPokemon(pokemon: PokemonDetails | { id: string }): void {
    this.isLoading = true; // Muestra carga mientras se actualiza el modal
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }

    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`;

    this.getFullPokemonDetails(pokemonUrl)
      .pipe(
        catchError((error) => {
          console.error('Falló la carga de detalles del Pokémon seleccionado', error);
          this.error = 'No se pudieron cargar los detalles de este Pokémon.';
          this.closeModal();
          return of(null);
        })
      )
      .subscribe((detailedPokemon) => {
        if (detailedPokemon) {
          this.selectedPokemon = detailedPokemon;
          this.setupSpriteGallery(detailedPokemon);
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

                const evoChain: { name: string; id: string }[] = [];
                let currentLink: ChainLink | undefined = evolutionChain.chain;
                while (currentLink) {
                  const urlParts = currentLink.species.url.split('/');
                  const id = urlParts[urlParts.length - 2];
                  evoChain.push({ name: currentLink.species.name, id });
                  currentLink = currentLink.evolves_to[0];
                }

                return {
                  ...details,
                  habitat: species.habitat?.name || 'Desconocido',
                  description,
                  weaknesses: Array.from(weaknesses),
                  evolutionChain: evoChain,
                };
              })
            );
          })
        );
      })
    );
  }

  private setupSpriteGallery(pokemon: PokemonDetails): void {
    this.spriteUrls = Object.values(pokemon.sprites).filter((val) => typeof val === 'string');
    const otherSprites = Object.values(pokemon.sprites.other || {})
      .flatMap((obj) => Object.values(obj))
      .filter((url) => url);
    this.spriteUrls = [...this.spriteUrls, ...otherSprites];
    this.currentSpriteIndex = 0;

    if (this.spriteUrls.length > 1) {
      this.spriteInterval = setInterval(() => {
        this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteUrls.length;
      }, 1000);
    }
  }

  closeModal(): void {
    this.selectedPokemon = null;
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
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

  getTextColor(backgroundColor: string): string {
    if (!backgroundColor || backgroundColor.length < 7) return '#000000';
    const r = parseInt(backgroundColor.substr(1, 2), 16);
    const g = parseInt(backgroundColor.substr(3, 2), 16);
    const b = parseInt(backgroundColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  getTypeIcon(typeName: string): string {
    return `assets/icons/types/${typeName.toLowerCase()}.svg`;
  }
}
