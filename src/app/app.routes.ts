import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'landing-page',
    loadComponent: () => import('./pokedex/pages/landing-page/landing-page'),
  },
  {
    path: 'list-page',
    loadComponent: () => import('./pokedex/pages/list-page/list-page'),
  },
  {
    path: '**',
    redirectTo: 'landing-page',
  },
];
