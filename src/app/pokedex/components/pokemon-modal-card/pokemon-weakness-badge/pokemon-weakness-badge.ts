// pokemon-weakness-badge.ts

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pokemon-weakness-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-weakness-badge.html',
  styles: ``,
})
export class PokemonWeaknessBadge {
  weakness = input.required<string>();
  backgroundColor = input.required<string>();
  textColor = input.required<string>();
  typeIcon = input.required<string>();
}

