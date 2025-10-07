export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonDetails {
  id: number;
  name: string;
  sprites: PokemonDetailsSprites;
  types: PokemonType[];
}

export interface PokemonDetailsSprites {
    front_default: string;
}

export interface PokemonType {
  slot: number;
  type: PokemonTypeInfo;
}

export interface PokemonTypeInfo {
  name: string;
  url: string;
}