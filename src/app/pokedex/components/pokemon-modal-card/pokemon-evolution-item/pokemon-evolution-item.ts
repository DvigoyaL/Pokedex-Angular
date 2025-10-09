// pokemon-evolution-item.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pokemon-evolution-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-evolution-item.html',
  styles: ``,
})
export class PokemonEvolutionItem {
  evolutionName = input.required<string>();
  evolutionId = input.required<string>();
  spriteUrl = input.required<string>();
  totalEvolutions = input.required<number>();

  evolutionClicked = output<{ name: string; id: string }>();

  onEvolutionClick(): void {
    this.evolutionClicked.emit({
      name: this.evolutionName(),
      id: this.evolutionId()
    });
  }
}

