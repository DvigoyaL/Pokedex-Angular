// navigation-buttons.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'pokedex-pokemon-navigationButtons',
  imports: [],
  templateUrl: './navigation-buttons.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationButtons {
  offset = input.required<number>();
  isLoading = input.required<boolean>();

  previousClicked = output<void>();
  nextClicked = output<void>();

  onPreviousClick() {
    this.previousClicked.emit();
  }

  onNextClick() {
    this.nextClicked.emit();
  }
}
