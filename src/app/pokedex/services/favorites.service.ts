import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FavoritePokemon {
  id: number;
  name: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'pokemon-favorites';
  private favoritesSubject: BehaviorSubject<FavoritePokemon[]>;
  public favorites$: Observable<FavoritePokemon[]>;

  constructor() {
    const stored = this.loadFromStorage();
    this.favoritesSubject = new BehaviorSubject<FavoritePokemon[]>(stored);
    this.favorites$ = this.favoritesSubject.asObservable();
  }

  private loadFromStorage(): FavoritePokemon[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  }

  private saveToStorage(favorites: FavoritePokemon[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  addFavorite(pokemon: FavoritePokemon): void {
    const currentFavorites = this.favoritesSubject.value;

    // Evitar duplicados
    if (!this.isFavorite(pokemon.id)) {
      const updatedFavorites = [...currentFavorites, pokemon];
      this.favoritesSubject.next(updatedFavorites);
      this.saveToStorage(updatedFavorites);
    }
  }

  removeFavorite(pokemonId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(fav => fav.id !== pokemonId);
    this.favoritesSubject.next(updatedFavorites);
    this.saveToStorage(updatedFavorites);
  }

  toggleFavorite(pokemon: FavoritePokemon): void {
    if (this.isFavorite(pokemon.id)) {
      this.removeFavorite(pokemon.id);
    } else {
      this.addFavorite(pokemon);
    }
  }

  isFavorite(pokemonId: number): boolean {
    return this.favoritesSubject.value.some(fav => fav.id === pokemonId);
  }

  getFavorites(): FavoritePokemon[] {
    return this.favoritesSubject.value;
  }

  clearAllFavorites(): void {
    this.favoritesSubject.next([]);
    this.saveToStorage([]);
  }

  get count(): number {
    return this.favoritesSubject.value.length;
  }
}

