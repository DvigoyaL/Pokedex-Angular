import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SearchService } from '../../../services/search.service';

interface MenuOption {
  label: string;
  hoverLabel: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // CommonModule is not needed for standalone components with this setup
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  menuOptions: MenuOption[] = [
    {
      label: 'Home',
      hoverLabel: 'Página principal',
      route: '/landing-page',
    },
    {
      label: 'List',
      hoverLabel: 'Lista de Pokémon',
      route: '/list-page',
    },
    {
      label: 'Favs',
      hoverLabel: 'Pokémon favoritos',
      route: '/favorites-page',
    },
    {
      label: 'Filters',
      hoverLabel: 'Búsqueda avanzada',
      route: '/filters-page',
    },
    {
      label: 'Guess',
      hoverLabel: 'Guess the Pokémon',
      route: '/guess-page',
    },
  ];

  isMenuOpen = false;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.updateSearchTerm(term);

    // Navigate to list-page if not already there
    if (this.router.url !== '/list-page') {
      this.router.navigate(['/list-page']);
    }
  }

  // Método para limpiar la búsqueda
  clearSearch(): void {
    this.searchService.updateSearchTerm('');
  }

  // Método para navegar a List y limpiar búsqueda
  navigateToList(): void {
    this.clearSearch();
    this.router.navigate(['/list-page']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
