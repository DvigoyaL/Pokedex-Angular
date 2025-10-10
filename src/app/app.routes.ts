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
    path: 'filters-page',
    loadComponent: () => import('./pokedex/pages/filters-page/filters-page'),
  },
  {
    path: 'favorites-page',
    loadComponent: () => import('./pokedex/pages/favorites-page/favorites-page'),
  },
  {
    path: 'guess-page',
    loadComponent: () => import('./pokedex/pages/guess-page/guess-page'),
  },
  {
    path: '**',
    redirectTo: 'landing-page',
  },
];
