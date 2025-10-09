import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterCriteria } from '../../pages/filters-page/filters-page';

interface FilterOption {
  value: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.html',
  styleUrls: ['./filter-panel.css'],
})
export class FilterPanel {
  filterChange = output<FilterCriteria>();

  // Pokémon types
  typeOptions: FilterOption[] = [
    { value: 'normal', label: 'Normal', selected: false },
    { value: 'fire', label: 'Fire', selected: false },
    { value: 'water', label: 'Water', selected: false },
    { value: 'electric', label: 'Electric', selected: false },
    { value: 'grass', label: 'Grass', selected: false },
    { value: 'ice', label: 'Ice', selected: false },
    { value: 'fighting', label: 'Fighting', selected: false },
    { value: 'poison', label: 'Poison', selected: false },
    { value: 'ground', label: 'Ground', selected: false },
    { value: 'flying', label: 'Flying', selected: false },
    { value: 'psychic', label: 'Psychic', selected: false },
    { value: 'bug', label: 'Bug', selected: false },
    { value: 'rock', label: 'Rock', selected: false },
    { value: 'ghost', label: 'Ghost', selected: false },
    { value: 'dragon', label: 'Dragon', selected: false },
    { value: 'dark', label: 'Dark', selected: false },
    { value: 'steel', label: 'Steel', selected: false },
    { value: 'fairy', label: 'Fairy', selected: false },
  ];

  // Generations
  generationOptions: FilterOption[] = [
    { value: '1', label: 'Gen I', selected: false },
    { value: '2', label: 'Gen II', selected: false },
    { value: '3', label: 'Gen III', selected: false },
    { value: '4', label: 'Gen IV', selected: false },
    { value: '5', label: 'Gen V', selected: false },
    { value: '6', label: 'Gen VI', selected: false },
    { value: '7', label: 'Gen VII', selected: false },
    { value: '8', label: 'Gen VIII', selected: false },
  ];

  // Habitats
  habitatOptions: FilterOption[] = [
    { value: 'cave', label: 'Cave', selected: false },
    { value: 'forest', label: 'Forest', selected: false },
    { value: 'grassland', label: 'Grassland', selected: false },
    { value: 'mountain', label: 'Mountain', selected: false },
    { value: 'rare', label: 'Rare', selected: false },
    { value: 'rough-terrain', label: 'Rough', selected: false },
    { value: 'sea', label: 'Sea', selected: false },
    { value: 'urban', label: 'Urban', selected: false },
    { value: 'waters-edge', label: 'Waters Edge', selected: false },
    { value: 'unknown', label: 'Unknown', selected: false },
  ];

  // Height and weight ranges
  minHeight: number | null = null;
  maxHeight: number | null = null;
  minWeight: number | null = null;
  maxWeight: number | null = null;

  toggleType(type: FilterOption): void {
    type.selected = !type.selected;
    this.emitFilterChange();
  }

  toggleGeneration(gen: FilterOption): void {
    gen.selected = !gen.selected;
    this.emitFilterChange();
  }

  toggleHabitat(habitat: FilterOption): void {
    habitat.selected = !habitat.selected;
    this.emitFilterChange();
  }

  onRangeChange(): void {
    this.emitFilterChange();
  }

  clearAllFilters(): void {
    this.typeOptions.forEach((opt) => (opt.selected = false));
    this.generationOptions.forEach((opt) => (opt.selected = false));
    this.habitatOptions.forEach((opt) => (opt.selected = false));
    this.minHeight = null;
    this.maxHeight = null;
    this.minWeight = null;
    this.maxWeight = null;
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    const criteria: FilterCriteria = {
      types: this.typeOptions.filter((opt) => opt.selected).map((opt) => opt.value),
      generations: this.generationOptions.filter((opt) => opt.selected).map((opt) => parseInt(opt.value)),
      habitats: this.habitatOptions.filter((opt) => opt.selected).map((opt) => opt.value),
      minHeight: this.minHeight ?? undefined,
      maxHeight: this.maxHeight ?? undefined,
      minWeight: this.minWeight ?? undefined,
      maxWeight: this.maxWeight ?? undefined,
    };
    this.filterChange.emit(criteria);
  }

  getTypeColor(typeName: string): string {
    const colors: { [key: string]: string } = {
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
    return colors[typeName.toLowerCase()] || '#C6C6A7';
  }

  get hasActiveFilters(): boolean {
    return (
      this.typeOptions.some((opt) => opt.selected) ||
      this.generationOptions.some((opt) => opt.selected) ||
      this.habitatOptions.some((opt) => opt.selected) ||
      this.minHeight !== null ||
      this.maxHeight !== null ||
      this.minWeight !== null ||
      this.maxWeight !== null
    );
  }
}

