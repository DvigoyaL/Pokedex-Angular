import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-error-message.html',
  styleUrls: ['./filter-error-message.css'],
})
export class FilterErrorMessage {
  errorMessage = input.required<string>();
}

