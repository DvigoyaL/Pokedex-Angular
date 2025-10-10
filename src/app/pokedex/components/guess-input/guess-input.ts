import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guess-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guess-input.html',
  styleUrls: ['./guess-input.css'],
})
export class GuessInput {
  guessSubmitted = output<string>();
  disabled = input<boolean>(false);

  guessValue: string = '';

  onSubmit(): void {
    if (this.guessValue.trim() && !this.disabled()) {
      this.guessSubmitted.emit(this.guessValue.trim());
      this.guessValue = '';
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }
}

