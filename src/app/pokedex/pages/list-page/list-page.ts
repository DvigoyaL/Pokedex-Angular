// src/app/pokedex/pages/list-page/list-page.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokemonDetails, PokemonListResponse, PokemonSpecies, TypeDetails, EvolutionChain, ChainLink} from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { forkJoin, switchMap, catchError, of, map } from 'rxjs';
import StatsChart from '../../components/stats-chart/stats-chart';

@Component({
  selector: 'pokedex-list-page',
  standalone: true,
  imports: [CommonModule, StatsChart], // Corregido
  templateUrl: './list-page.html',
  styleUrl: './list-page.css', // Asegúrate que este archivo exista o usa styleUrls: []
})
export default class ListPage implements OnInit {
  pokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  offset: number = 0;
  limit: number = 20;

  // Propiedades para la galería de sprites
  spriteUrls: string[] = [];
  currentSpriteIndex: number = 0;
  private spriteInterval: any;

  // Propiedades para UX
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private pokemonService: Pokemon) {}

  ngOnInit() {
    this.loadPokemon();
  }

loadPokemon() {
  this.isLoading = true;
  this.error = null;
  this.pokemonService
    .getListPokemon(this.offset, this.limit)
    .pipe(
      switchMap((listResponse: PokemonListResponse) => {
        if (!listResponse.results || listResponse.results.length === 0) {
          return of([]);
        }
        const detailObservables = listResponse.results.map((pokemonListItem) =>
          this.pokemonService.getPokemonDetails(pokemonListItem.url).pipe(
            switchMap((details: PokemonDetails) => {
              // Prepara las llamadas para obtener especie, tipos y cadena de evolución
              const speciesObservable = this.pokemonService.getPokemonSpecies(details.species.url);
              const typeObservables = details.types.map(typeInfo =>
                this.pokemonService.getTypeDetails(typeInfo.type.url)
              );

              return speciesObservable.pipe(
                switchMap(species => {
                  const evolutionChainObservable = this.pokemonService.getEvolutionChain(species.evolution_chain.url);
                  
                  return forkJoin({
                    species: of(species), // Reutiliza la data de la especie ya obtenida
                    typeDetails: forkJoin(typeObservables),
                    evolutionChain: evolutionChainObservable
                  }).pipe(
                    map(({ species, typeDetails, evolutionChain }) => {
                      // --- Lógica para Descripción ---
                      const description = species.flavor_text_entries.find(
                        entry => entry.language.name === 'en'
                      )?.flavor_text || 'No description available.';

                      // --- Lógica para Debilidades ---
                      const weaknesses = new Set<string>();
                      const resistances = new Set<string>();
                      typeDetails.forEach(type => {
                        type.damage_relations.double_damage_from.forEach(t => weaknesses.add(t.name));
                        type.damage_relations.half_damage_from.forEach(t => resistances.add(t.name));
                        type.damage_relations.no_damage_from.forEach(t => resistances.add(t.name));
                      });
                      resistances.forEach(res => weaknesses.delete(res));

                      // --- Lógica para Cadena de Evolución ---
                      const evoChain: { name: string; id: string }[] = [];
                      let currentLink: ChainLink | undefined = evolutionChain.chain;
                      while (currentLink) {
                        const urlParts = currentLink.species.url.split('/');
                        const id = urlParts[urlParts.length - 2];
                        evoChain.push({ name: currentLink.species.name, id });
                        currentLink = currentLink.evolves_to[0];
                      }

                      // --- Retorna el Objeto Pokémon Completo ---
                      return {
                        ...details,
                        habitat: species.habitat ? species.habitat.name : 'Desconocido',
                        description: description.replace(/[\n\f]/g, ' '),
                        weaknesses: Array.from(weaknesses),
                        evolutionChain: evoChain,
                      };
                    })
                  );
                })
              );
            })
          )
        );
        return forkJoin(detailObservables);
      }),
      catchError(error => {
        console.error('Falló la carga de detalles de Pokémon', error);
        this.error = 'No se pudieron cargar los Pokémon. Intenta de nuevo más tarde.';
        return of([]);
      })
    )
    .subscribe((detailedPokemons: PokemonDetails[]) => {
      this.pokemonList = detailedPokemons;
      this.isLoading = false;
    });
}

  selectPokemon(pokemon: PokemonDetails) {
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
    this.selectedPokemon = pokemon;
    this.spriteUrls = Object.values(pokemon.sprites)
      .filter(value => value && typeof value === 'string')
      .concat(
        Object.values(pokemon.sprites.other || {})
          .flatMap(obj => Object.values(obj))
          .filter(url => url && typeof url === 'string')
      );
    
    this.currentSpriteIndex = 0;

    if (this.spriteUrls.length > 1) {
      this.spriteInterval = setInterval(() => {
        this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteUrls.length;
      }, 1000);
    }
  }

    getColorForType(typeName: string): string {
    const colors: { [key: string]: string } = {
      grass: '#A7DB8D',
      fire: '#F5AC78',
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
    return colors[typeName.toLowerCase()] || '#C6C6A7'; // Devuelve el color 'normal' si no se encuentra
  }

  // **** AÑADE ESTE MÉTODO QUE FALTA ****
  getTextColor(backgroundColor: string): string {
    if (!backgroundColor || backgroundColor.length < 7) {
      return '#000000'; // Negro por defecto
    }
    const r = parseInt(backgroundColor.substr(1, 2), 16);
    const g = parseInt(backgroundColor.substr(3, 2), 16);
    const b = parseInt(backgroundColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Devuelve negro para fondos claros, blanco para fondos oscuros
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  closeModal() {
    this.selectedPokemon = null;
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
  }

  getTypeIcon(typeName: string): string {
    // Asegúrate de que los nombres de los archivos coincidan (ej: fire.svg, water.svg, etc.)
    return `assets/icons/types/${typeName.toLowerCase()}.svg`;
  }

  onPreviousPage() {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.loadPokemon();
    }
  }

  onNextPage() {
    this.offset += this.limit;
    this.loadPokemon();
  }
}