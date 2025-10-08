// src/app/pokedex/interfaces/pokemon.model.ts

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
  height: number;
  weight: number;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: {
    url: string;
  };
  habitat: string | null;
  description: string;
  weaknesses?: string[];
  evolutionChain?: { name: string, id: string }[];
}

export interface PokemonDetailsSprites {
  front_default: string; // Sprite pixelado
  other?: {
    'official-artwork': {
      front_default: string; // Artwork de alta calidad
    };
  };
}

export interface PokemonType {
  slot: number;
  type: PokemonTypeInfo;
}

export interface PokemonTypeInfo {
  name: string;
  url: string;
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
  };
}

export interface PokemonSpecies {
  habitat: {
    name: string;
    url: string;
  } | null; 
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
}

export interface TypeInfo {
  name: string;
  url: string;
}

export interface TypeRelations {
  double_damage_from: TypeInfo[];
  half_damage_from: TypeInfo[];
  no_damage_from: TypeInfo[];
}

export interface TypeDetails {
  name: string;
  damage_relations: TypeRelations;
}

export interface EvolutionChain {
  chain: ChainLink;
}

export interface ChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: ChainLink[];
}