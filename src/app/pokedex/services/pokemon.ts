import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PokemonDetails, PokemonListResponse } from '../interfaces/pokemon.model';

@Injectable({
  providedIn: 'root',
})
export class Pokemon {
  constructor(private http: HttpClient) {}
  getListPokemon(offset: number) {
    return this.http.get<PokemonListResponse>(
      `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`
    );
  }
  getPokemonDetails(url: string) {
    return this.http.get<PokemonDetails>(url);
  }
}
