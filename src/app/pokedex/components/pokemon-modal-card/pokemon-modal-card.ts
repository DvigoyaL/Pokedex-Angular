// pokemon-modal-card.ts

import { Component, input, output, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDetails } from '../../interfaces/pokemon.model';
import StatsChart from '../stats-chart/stats-chart';
import { PokemonTypeBadge } from './pokemon-type-badge/pokemon-type-badge';
import { PokemonWeaknessBadge } from './pokemon-weakness-badge/pokemon-weakness-badge';
import { PokemonAbilityBadge } from './pokemon-ability-badge/pokemon-ability-badge';
import { PokemonEvolutionItem } from './pokemon-evolution-item/pokemon-evolution-item';

@Component({
  selector: 'pokedex-pokemon-modal-card',
  standalone: true,
  imports: [
    CommonModule,
    StatsChart,
    PokemonTypeBadge,
    PokemonWeaknessBadge,
    PokemonAbilityBadge,
    PokemonEvolutionItem
  ],
  templateUrl: './pokemon-modal-card.html',
  styles: ``,
})
export class PokemonModalCard implements OnInit, OnDestroy {
  pokemon = input.required<PokemonDetails | null>();
  pokemonList = input.required<PokemonDetails[]>();

  modalClosed = output<void>();
  pokemonSelected = output<PokemonDetails | { id: string }>();

  spriteUrls: string[] = [];
  currentSpriteIndex: number = 0;
  private spriteInterval: any;

  constructor() {
    // Effect to update sprite gallery when pokemon changes
    effect(() => {
      const currentPokemon = this.pokemon();
      if (currentPokemon) {
        this.setupSpriteGallery(currentPokemon);
      }
    });
  }

  ngOnInit(): void {}

  private setupSpriteGallery(pokemon: PokemonDetails): void {
    // Clear previous interval
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }

    this.spriteUrls = Object.values(pokemon.sprites).filter((val) => typeof val === 'string');
    const otherSprites = Object.values(pokemon.sprites.other || {})
      .flatMap((obj) => Object.values(obj))
      .filter((url) => url);
    this.spriteUrls = [...this.spriteUrls, ...otherSprites];
    this.currentSpriteIndex = 0;

    if (this.spriteUrls.length > 1) {
      this.spriteInterval = setInterval(() => {
        this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteUrls.length;
      }, 1000);
    }
  }

  closeModal(): void {
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
    this.modalClosed.emit();
  }

  getColorForType(typeName: string): string {
    const colors: { [key: string]: string } = {
      grass: '#A7DB8D',
      fire: '#f3bb94ff',
      water: '#9DB7F5',
      bug: '#C6D16E',
      normal: '#C6C6A7',
      poison: '#C183C1',
      electric: '#FAE078',
      ground: '#EBD69D',
      fairy: '#F4BDC9',
      fighting: '#D67873',
      psychic: '#FA92B2',
      rock: '#D1C17D',
      ghost: '#A292BC',
      ice: '#BCE6E6',
      dragon: '#A27DFA',
      dark: '#A29288',
      steel: '#D1D1E0',
      flying: '#C6B7F5',
    };
    return colors[typeName.toLowerCase()] || '#C6C6A7';
  }

  getTextColor(backgroundColor: string): string {
    if (!backgroundColor || backgroundColor.length < 7) return '#000000';
    const r = parseInt(backgroundColor.substr(1, 2), 16);
    const g = parseInt(backgroundColor.substr(3, 2), 16);
    const b = parseInt(backgroundColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }

  getTypeIcon(typeName: string): string {
    return `assets/icons/types/${typeName.toLowerCase()}.svg`;
  }

  private getCurrentPokemonIndex(): number {
    const currentPokemon = this.pokemon();
    if (!currentPokemon) return -1;
    return this.pokemonList().findIndex((p) => p.id === currentPokemon.id);
  }

  canGoToPrevious(): boolean {
    return this.getCurrentPokemonIndex() > 0;
  }

  canGoToNext(): boolean {
    const currentIndex = this.getCurrentPokemonIndex();
    return currentIndex > -1 && currentIndex < this.pokemonList().length - 1;
  }

  goToPreviousPokemon(event: MouseEvent): void {
    event.stopPropagation();
    if (this.canGoToPrevious()) {
      const currentIndex = this.getCurrentPokemonIndex();
      const previousPokemon = this.pokemonList()[currentIndex - 1];
      this.pokemonSelected.emit(previousPokemon);
    }
  }

  goToNextPokemon(event: MouseEvent): void {
    event.stopPropagation();
    if (this.canGoToNext()) {
      const currentIndex = this.getCurrentPokemonIndex();
      const nextPokemon = this.pokemonList()[currentIndex + 1];
      this.pokemonSelected.emit(nextPokemon);
    }
  }

  onEvolutionClick(evo: { name: string; id: string }): void {
    this.pokemonSelected.emit(evo);
  }

  ngOnDestroy(): void {
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
  }
}

