// pokemon-basic-card.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PokemonDetails} from '../../interfaces/pokemon.model';


@Component({
  selector: 'pokedex-pokemon-basic-card',
  imports: [CommonModule],
  templateUrl: './pokemon-basic-card.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonBasicCard {
  pokemon = input.required<PokemonDetails>();
  backgroundColor = input.required<string>();
  cardClicked = output<PokemonDetails>();

  onCardClick() {
    this.cardClicked.emit(this.pokemon());
  }
}
