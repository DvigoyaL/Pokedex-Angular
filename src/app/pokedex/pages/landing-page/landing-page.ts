import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PokemonDetails, PokemonListResponse } from '../../interfaces/pokemon.model';
import { forkJoin, switchMap } from 'rxjs';
import { Pokemon } from '../../services/pokemon';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
})
export default class LandingPage {
  pokemonList: PokemonDetails[] = [];
  selectedPokemon: PokemonDetails | null = null;
  offset: number = 0;
  limit: number = 20;
  spriteUrls: string[] = [];
  currentSpriteIndex: number = 0;
  private spriteInterval: any;

  constructor(private pokemonService: Pokemon) {}

  ngOnInit() {
    this.loadPokemon();
  }

  loadPokemon() {
    this.pokemonService
      .getListPokemon(this.offset)
      .pipe(
        switchMap((data: PokemonListResponse) => {
          const detailObservables = data.results.map((pokemon) =>
            this.pokemonService.getPokemonDetails(pokemon.url)
          );
          return forkJoin(detailObservables);
        })
      )
      .subscribe((detailedPokemons: PokemonDetails[]) => {
        this.pokemonList = detailedPokemons;
        console.log(this.pokemonList);
      });
  }

  selectPokemon(pokemon: PokemonDetails) {
    if (this.spriteInterval) {
      clearInterval(this.spriteInterval);
    }
    this.selectedPokemon = pokemon;
    this.spriteUrls = Object.values(pokemon.sprites).filter((url) => typeof url === 'string');
    this.currentSpriteIndex = 0;

    this.spriteInterval = setInterval(() => {
      this.currentSpriteIndex = (this.currentSpriteIndex + 1) % this.spriteUrls.length;
    }, 1000);
  }

  closeModal() {
    this.selectedPokemon = null;
  }

  onPreviousPage() {
    if (this.offset > 0) {
      this.offset -= this.limit;
      this.loadPokemon();
    }
  }

  onNextPage() {
    this.offset += this.limit;
    this.loadPokemon();
  }
}
