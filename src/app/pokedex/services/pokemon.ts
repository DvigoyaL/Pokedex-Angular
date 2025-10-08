import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonDetails, PokemonListResponse, PokemonSpecies, TypeDetails, EvolutionChain  } from '../interfaces/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  constructor(private http: HttpClient) {}
  
  // Add 'limit' as a parameter with a default value
  getListPokemon(offset: number, limit: number = 20) {
    return this.http.get<PokemonListResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );
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