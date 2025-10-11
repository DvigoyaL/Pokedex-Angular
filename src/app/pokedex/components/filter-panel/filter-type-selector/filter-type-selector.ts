import { Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOption } from '../filter-panel';

@Component({
  selector: 'app-filter-type-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-type-selector.html',
  styleUrl: './filter-type-selector.css',
})
export class FilterTypeSelector {
  typeOptions = input.required<FilterOption[]>();
  selectedCount = input.required<number>();

  @Output() typeToggled = new EventEmitter<FilterOption>();

  onToggle(type: FilterOption): void {
    this.typeToggled.emit(type);
  }

  getTypeColor(typeName: string): string {
    const TYPE_COLORS: Record<string, string> = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD',
    };
    return TYPE_COLORS[typeName.toLowerCase()] || '#C6C6A7';
  }
}

