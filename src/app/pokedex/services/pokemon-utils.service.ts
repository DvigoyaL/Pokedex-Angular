import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PokemonUtilsService {
  private readonly TYPE_COLORS: { [key: string]: string } = {
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

  getColorForType(typeName: string): string {
    return this.TYPE_COLORS[typeName.toLowerCase()] || '#C6C6A7';
  }

  getGenerationFromId(id: number): number {
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

  convertHeightToMeters(decimeters: number): string {
    return (decimeters / 10).toFixed(1);
  }

  convertWeightToKg(hectograms: number): string {
    return (hectograms / 10).toFixed(1);
  }
}

