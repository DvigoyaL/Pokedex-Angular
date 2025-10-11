import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import { PokemonBasicCard } from '../pokemon-basic-card/pokemon-basic-card';
import { NavigationButtons } from '../navigation-buttons/navigation-buttons';
import { FilterStatsBar, FilterInfo, AdditionalFilters } from '../filter-stats-bar/filter-stats-bar';

@Component({
  selector: 'app-filter-results',
  standalone: true,
  imports: [CommonModule, PokemonBasicCard, NavigationButtons, FilterStatsBar],
  templateUrl: './filter-results.html',
  styleUrls: ['./filter-results.css'],
})
export class FilterResults {
  // Inputs
  displayedPokemon = input.required<PokemonDetails[]>();
  totalResults = input.required<number>();
  firstFilter = input.required<FilterInfo>();
  additionalFilters = input.required<AdditionalFilters>();
  currentPage = input.required<number>();
  itemsPerPage = input.required<number>();
  isLoading = input<boolean>(false);
  favoriteIds = input.required<number[]>(); // IDs de Pokémon favoritos

  // Outputs
  pokemonSelected = output<PokemonDetails | { id: string }>();
  favoriteToggled = output<PokemonDetails>();
  previousPageClicked = output<void>();
  nextPageClicked = output<void>();

  // Método helper para obtener el color del tipo
  getColorForType(typeName: string): string {
    const TYPE_COLORS: { [key: string]: string } = {
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
    return TYPE_COLORS[typeName.toLowerCase()] || '#C6C6A7';
  }

  // Método helper para verificar si es favorito
  isFavorite(pokemonId: number): boolean {
    return this.favoriteIds().includes(pokemonId);
  }
}

