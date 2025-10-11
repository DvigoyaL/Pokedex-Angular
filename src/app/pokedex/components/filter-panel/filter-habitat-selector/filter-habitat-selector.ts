import { Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterOption } from '../filter-panel';

@Component({
  selector: 'app-filter-habitat-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-habitat-selector.html',
  styleUrl: './filter-habitat-selector.css',
})
export class FilterHabitatSelector {
  habitatOptions = input.required<FilterOption[]>();
  selectedCount = input.required<number>();
  firstFilterType = input.required<string>();

  @Output() habitatToggled = new EventEmitter<FilterOption>();

  onToggle(habitat: FilterOption): void {
    this.habitatToggled.emit(habitat);
  }

  isDisabled(habitat: FilterOption): boolean {
    return !habitat.selected &&
           this.firstFilterType() === 'habitat' &&
           this.selectedCount() >= 1;
  }
}

