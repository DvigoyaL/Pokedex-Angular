import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  PokemonDetails,
  PokemonListResponse,
  PokemonSpecies,
  TypeDetails,
  EvolutionChain,
} from '../interfaces/pokemon.model';

// Interfaces para endpoints de filtrado
export interface TypeResponse {
  pokemon: Array<{
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

export interface GenerationResponse {
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
}

export interface HabitatResponse {
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  private http = inject(HttpClient);
  constructor() {}

  getListPokemon(offset: number, limit: number = 20) {
    return this.http.get<PokemonListResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
  }

  getPokemonDetailsByNameOrId(nameOrId: string) {
    const url = `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}/`;
    return this.http.get<PokemonDetails>(url);
  }

  getPokemonDetails(url: string) {
    return this.http.get<PokemonDetails>(url);
  }

  getPokemonSpecies(url: string) {
    return this.http.get<PokemonSpecies>(url);
  }

  getTypeDetails(url: string) {
    return this.http.get<TypeDetails>(url);
  }

  getEvolutionChain(url: string) {
    return this.http.get<EvolutionChain>(url);
  }

  // Nuevos métodos para filtrado por endpoints específicos
  getPokemonByType(typeName: string) {
    return this.http.get<TypeResponse>(`https://pokeapi.co/api/v2/type/${typeName}/`);
  }

  getPokemonByGeneration(generationId: number) {
    return this.http.get<GenerationResponse>(`https://pokeapi.co/api/v2/generation/${generationId}/`);
  }

  getPokemonByHabitat(habitatName: string) {
    return this.http.get<HabitatResponse>(`https://pokeapi.co/api/v2/pokemon-habitat/${habitatName}/`);
  }
}
