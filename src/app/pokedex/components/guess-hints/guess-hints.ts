import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';

@Component({
  selector: 'app-guess-hints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guess-hints.html',
  styleUrls: ['./guess-hints.css'],
})
export class GuessHints {
  private pokemonUtils = inject(PokemonUtilsService);

  pokemon = input.required<PokemonDetails>();
  attemptsCount = input<number>(0);
  isRevealed = input<boolean>(false);

  getTypeColor(typeName: string): string {
    return this.pokemonUtils.getColorForType(typeName);
  }

  getGeneration(): number {
    return this.pokemonUtils.getGenerationFromId(this.pokemon().id);
  }

  get heightInMeters(): string {
    return this.pokemonUtils.convertHeightToMeters(this.pokemon().height);
  }

  get weightInKg(): string {
    return this.pokemonUtils.convertWeightToKg(this.pokemon().weight);
  }

  shouldShowHint(requiredAttempts: number): boolean {
    return this.attemptsCount() >= requiredAttempts || this.isRevealed();
  }

  get revealedLetters(): string {
    const attempts = this.attemptsCount();
    const pokemonName = this.pokemon().name;

    if (attempts < 5) {
      return '';
    }

    // Después del intento 5, revelamos progresivamente más letras
    // Intento 5 = 1 letra, Intento 6 = 2 letras, etc.
    const lettersToReveal = attempts - 4;

    if (lettersToReveal >= pokemonName.length) {
      // Si ya revelamos todo el nombre, mostramos todo
      return pokemonName;
    }

    return pokemonName.substring(0, lettersToReveal);
  }

  get remainingLetters(): number {
    const pokemonName = this.pokemon().name;
    const revealed = this.revealedLetters.length;
    return pokemonName.length - revealed;
  }

  get hiddenLettersPlaceholder(): string {
    return '_'.repeat(this.remainingLetters);
  }
}

