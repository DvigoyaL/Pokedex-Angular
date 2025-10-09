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
      label: 'Filters',
      hoverLabel: 'Búsqueda avanzada',
      route: '/filters-page',
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
