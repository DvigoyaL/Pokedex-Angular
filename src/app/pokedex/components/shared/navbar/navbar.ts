import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuOption {
  label: string;
  hoverLabel: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
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
}
