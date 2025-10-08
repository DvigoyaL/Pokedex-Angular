// src/app/pokedex/pages/list-page/list-page.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PokemonDetails, PokemonListResponse, PokemonSpecies, TypeDetails } from '../../interfaces/pokemon.model';
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
          if (listResponse.results.length === 0) {
            return of([]);
          }
          const detailObservables = listResponse.results.map((pokemonListItem) =>
            this.pokemonService.getPokemonDetails(pokemonListItem.url).pipe(
              switchMap((details: PokemonDetails) => {
                const speciesObservable = this.pokemonService.getPokemonSpecies(details.species.url);
                const typeObservables = details.types.map(typeInfo =>
                  this.pokemonService.getTypeDetails(typeInfo.type.url)
                );

                return forkJoin({
                  species: speciesObservable,
                  typeDetails: forkJoin(typeObservables)
                }).pipe(
                  map(({ species, typeDetails }) => {
                    const description = species.flavor_text_entries.find(
                      entry => entry.language.name === 'en'
                    )?.flavor_text || 'No description available.';

                    const weaknesses = new Set<string>();
                    const resistances = new Set<string>();
                    typeDetails.forEach(type => {
                      type.damage_relations.double_damage_from.forEach(t => weaknesses.add(t.name));
                      type.damage_relations.half_damage_from.forEach(t => resistances.add(t.name));
                      type.damage_relations.no_damage_from.forEach(t => resistances.add(t.name));
                    });
                    resistances.forEach(res => weaknesses.delete(res));

                    return {
                      ...details,
                      habitat: species.habitat ? species.habitat.name : 'Desconocido',
                      description: description.replace(/[\n\f]/g, ' '),
                      weaknesses: Array.from(weaknesses),
                    };
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

  closeModal() {
    this.selectedPokemon = null;
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
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