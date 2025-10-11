import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterInfo {
  type: 'type' | 'generation' | 'habitat' | null;
  value: string | number | null;
}

export interface AdditionalFilters {
  types: string[];
  generations: number[];
  habitats: string[];
}

@Component({
  selector: 'app-filter-stats-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-stats-bar.html',
  styleUrls: ['./filter-stats-bar.css'],
})
export class FilterStatsBar {
  // Inputs
  currentResults = input.required<number>();
  totalResults = input.required<number>();
  firstFilter = input.required<FilterInfo>();
  additionalFilters = input.required<AdditionalFilters>();
}

