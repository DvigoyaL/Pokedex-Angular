import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
      hoverLabel: 'Gifs populares',
      route: '/landing-page',
    },
    {
      label: 'List',
      hoverLabel: 'Buscador de gifs',
      route: '/list-page',
    },
  ];

  constructor(private searchService: SearchService) {}

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchService.updateSearchTerm(term);
  }
}
