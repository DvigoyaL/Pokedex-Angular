import { Component, output, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterCriteria } from '../../pages/filters-page/filters-page';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';

interface FilterOption {
  value: string;
  label: string;
  selected: boolean;
}

export type FirstFilterType = 'type' | 'generation' | 'habitat' | null;

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.html',
  styleUrls: ['./filter-panel.css'],
})
export class FilterPanel {
  private pokemonUtils = inject(PokemonUtilsService);

  // Input que recibe el tipo del primer filtro desde el padre
  firstFilterType = input<FirstFilterType>(null);

  filterChange = output<FilterCriteria>();

  // Control de filtros primarios vs secundarios
  get hasPrimaryFilterActive(): boolean {
    return this.typeOptions.some((opt) => opt.selected) ||
           this.generationOptions.some((opt) => opt.selected) ||
           this.habitatOptions.some((opt) => opt.selected);
  }

  get selectedTypesCount(): number {
    return this.typeOptions.filter((opt) => opt.selected).length;
  }

  get selectedGenerationsCount(): number {
    return this.generationOptions.filter((opt) => opt.selected).length;
  }

  get selectedHabitatsCount(): number {
    return this.habitatOptions.filter((opt) => opt.selected).length;
  }

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
    // Limitar a máximo 2 tipos seleccionados
    const selectedTypes = this.typeOptions.filter(opt => opt.selected);

    if (!type.selected && selectedTypes.length >= 2) {
      // Ya hay 2 tipos seleccionados, no permitir más
      return;
    }

    type.selected = !type.selected;

    // Si se deseleccionan todos los filtros primarios, limpiar filtros secundarios
    if (!this.hasPrimaryFilterActive) {
      this.clearSecondaryFilters();
    }
    this.emitFilterChange();
  }

  toggleGeneration(gen: FilterOption): void {
    // Si el primer filtro es una GENERACIÓN, solo permitir 1 generación
    // (porque la API ya cargó esa generación específica)
    if (this.firstFilterType() === 'generation') {
      const selectedGens = this.generationOptions.filter(opt => opt.selected);

      if (!gen.selected && selectedGens.length >= 1) {
        // Ya hay 1 generación seleccionada como primer filtro, no permitir más
        return;
      }

      // Si se va a seleccionar esta generación, deseleccionar las demás
      if (!gen.selected) {
        this.generationOptions.forEach((opt) => (opt.selected = false));
      }
    }

    gen.selected = !gen.selected;

    // Si se deseleccionan todos los filtros primarios, limpiar filtros secundarios
    if (!this.hasPrimaryFilterActive) {
      this.clearSecondaryFilters();
    }
    this.emitFilterChange();
  }

  toggleHabitat(habitat: FilterOption): void {
    // Si el primer filtro es un HÁBITAT, solo permitir 1 hábitat
    // (porque la API ya cargó ese hábitat específico)
    if (this.firstFilterType() === 'habitat') {
      const selectedHabitats = this.habitatOptions.filter(opt => opt.selected);

      if (!habitat.selected && selectedHabitats.length >= 1) {
        // Ya hay 1 hábitat seleccionado como primer filtro, no permitir más
        return;
      }

      // Si se va a seleccionar este hábitat, deseleccionar los demás
      if (!habitat.selected) {
        this.habitatOptions.forEach((opt) => (opt.selected = false));
      }
    }

    habitat.selected = !habitat.selected;

    // Si se deseleccionan todos los filtros primarios, limpiar filtros secundarios
    if (!this.hasPrimaryFilterActive) {
      this.clearSecondaryFilters();
    }
    this.emitFilterChange();
  }

  private clearSecondaryFilters(): void {
    this.minHeight = null;
    this.maxHeight = null;
    this.minWeight = null;
    this.maxWeight = null;
  }

  onRangeChange(): void {
    this.emitFilterChange();
  }

  clearAllFilters(): void {
    this.typeOptions.forEach((opt) => (opt.selected = false));
    this.generationOptions.forEach((opt) => (opt.selected = false));
    this.habitatOptions.forEach((opt) => (opt.selected = false));
    this.clearSecondaryFilters();
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
    return this.pokemonUtils.getColorForType(typeName);
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

