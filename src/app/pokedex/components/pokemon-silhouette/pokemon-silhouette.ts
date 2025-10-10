import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetails } from '../../interfaces/pokemon.model';

@Component({
  selector: 'app-pokemon-silhouette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-silhouette.html',
  styleUrls: ['./pokemon-silhouette.css'],
})
export class PokemonSilhouette {
  pokemon = input.required<PokemonDetails>();
  isRevealed = input<boolean>(false);

  get imageUrl(): string {
    return (
      this.pokemon().sprites.other?.['official-artwork']?.front_default ||
      this.pokemon().sprites.front_default
    );
  }
}

