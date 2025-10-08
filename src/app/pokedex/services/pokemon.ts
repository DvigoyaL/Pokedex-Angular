import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonDetails, PokemonListResponse, PokemonSpecies, TypeDetails, EvolutionChain  } from '../interfaces/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  constructor(private http: HttpClient) {}
  
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
}