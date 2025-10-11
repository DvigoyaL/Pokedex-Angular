import { Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOption } from '../filter-panel';

@Component({
  selector: 'app-filter-generation-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-generation-selector.html',
  styleUrl: './filter-generation-selector.css',
})
export class FilterGenerationSelector {
  generationOptions = input.required<FilterOption[]>();
  selectedCount = input.required<number>();
  firstFilterType = input.required<string>();

  @Output() generationToggled = new EventEmitter<FilterOption>();

  onToggle(generation: FilterOption): void {
    this.generationToggled.emit(generation);
  }

  isDisabled(gen: FilterOption): boolean {
    return !gen.selected &&
           this.firstFilterType() === 'generation' &&
           this.selectedCount() >= 1;
  }
}

