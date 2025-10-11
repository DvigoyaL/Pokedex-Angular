import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-loading-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-loading-state.html',
  styleUrls: ['./filter-loading-state.css'],
})
export class FilterLoadingState {
  // Inputs para mostrar mensajes específicos
  isLoadingUnknownHabitat = input<boolean>(false);
}

