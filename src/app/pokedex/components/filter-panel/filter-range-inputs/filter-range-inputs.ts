import { Component, EventEmitter, input, Output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-range-inputs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-range-inputs.html',
  styleUrl: './filter-range-inputs.css',
})
export class FilterRangeInputs {
  minHeight = model<number | undefined>(undefined);
  maxHeight = model<number | undefined>(undefined);
  minWeight = model<number | undefined>(undefined);
  maxWeight = model<number | undefined>(undefined);

  @Output() rangeChanged = new EventEmitter<void>();

  onRangeChange(): void {
    this.rangeChanged.emit();
  }
}

