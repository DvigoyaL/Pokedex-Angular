// pokemon-ability-badge.ts

import { Component, input } from '@angular/core';

@Component({
  selector: 'pokemon-ability-badge',
  standalone: true,
  imports: [],
  templateUrl: './pokemon-ability-badge.html',
  styles: ``,
})
export class PokemonAbilityBadge {
  abilityName = input.required<string>();
}

