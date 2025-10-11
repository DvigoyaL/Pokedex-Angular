import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import { Pokemon } from '../../services/pokemon';
import { PokemonUtilsService } from '../../services/pokemon-utils.service';
import { switchMap, catchError, of } from 'rxjs';
import { PokemonSilhouette } from '../../components/pokemon-silhouette/pokemon-silhouette';
import { GuessInput } from '../../components/guess-input/guess-input';
import { GuessHints } from '../../components/guess-hints/guess-hints';
import StatsChart from '../../components/stats-chart/stats-chart';

export interface GuessAttempt {
  guess: string;
  isCorrect: boolean;
  timestamp: Date;
}

@Component({
  selector: 'pokedex-guess-page',
  standalone: true,
  imports: [CommonModule, PokemonSilhouette, GuessInput, GuessHints, StatsChart],
  templateUrl: './guess-page.html',
  styleUrls: ['./guess-page.css'],
})
export default class GuessPage implements OnInit {
  private pokemonService = inject(Pokemon);
  private pokemonUtils = inject(PokemonUtilsService);

  currentPokemon: PokemonDetails | null = null;
  attempts: GuessAttempt[] = [];
  isRevealed: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  hasWon: boolean = false;

  // IDs disponibles para adivinar (todas las generaciones - 1,025 Pokémon)
  private readonly AVAILABLE_POKEMON_IDS = Array.from({ length: 1025 }, (_, i) => i + 1);

  ngOnInit(): void {
    this.loadRandomPokemon();
  }

  loadRandomPokemon(): void {
    this.isLoading = true;
    this.error = null;
    this.attempts = [];
    this.isRevealed = false;
    this.hasWon = false;

    const randomId = this.getRandomPokemonId();
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${randomId}/`;

    this.pokemonService
      .getPokemonDetails(pokemonUrl)
      .pipe(
        switchMap((details: PokemonDetails) => {
          return this.pokemonService.getPokemonSpecies(details.species.url).pipe(
            switchMap((species) => {
              const typeObservables = details.types.map((typeInfo) =>
                this.pokemonService.getTypeDetails(typeInfo.type.url)
              );

              // Para este juego no necesitamos evoluciones, solo detalles básicos
              return of({
                ...details,
                habitat: species.habitat?.name || 'unknown',
                description:
                  species.flavor_text_entries
                    .find((e) => e.language.name === 'en')
                    ?.flavor_text.replace(/[\n\f]/g, ' ') || 'No description.',
              });
            })
          );
        }),
        catchError((error) => {
          console.error('Failed to load Pokémon', error);
          this.error = 'Failed to load a Pokémon. Please try again.';
          return of(null);
        })
      )
      .subscribe((pokemon) => {
        this.currentPokemon = pokemon;
        this.isLoading = false;
      });
  }

  private getRandomPokemonId(): number {
    const randomIndex = Math.floor(Math.random() * this.AVAILABLE_POKEMON_IDS.length);
    return this.AVAILABLE_POKEMON_IDS[randomIndex];
  }

  onGuessSubmitted(guess: string): void {
    if (!this.currentPokemon || this.hasWon || this.isRevealed) {
      return;
    }

    const normalizedGuess = guess.toLowerCase().trim();
    const pokemonName = this.currentPokemon.name.toLowerCase();
    const isCorrect = normalizedGuess === pokemonName;

    const attempt: GuessAttempt = {
      guess: guess,
      isCorrect: isCorrect,
      timestamp: new Date(),
    };

    this.attempts.push(attempt);

    if (isCorrect) {
      this.hasWon = true;
    }
  }

  onRevealAnswer(): void {
    this.isRevealed = true;
  }

  onNewPokemon(): void {
    this.loadRandomPokemon();
  }

  get attemptsCount(): number {
    return this.attempts.length;
  }

  get incorrectAttempts(): GuessAttempt[] {
    return this.attempts.filter((a) => !a.isCorrect);
  }
}

