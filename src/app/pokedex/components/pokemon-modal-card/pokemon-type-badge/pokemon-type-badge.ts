// pokemon-type-badge.ts

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pokemon-type-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-type-badge.html',
  styles: ``,
})
export class PokemonTypeBadge {
  typeName = input.required<string>();
  backgroundColor = input.required<string>();
  textColor = input.required<string>();
  typeIcon = input.required<string>();
}

