import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'landing-page',
    loadComponent: () => import('./pokedex/pages/landing-page/landing-page'),
  },
  {
    path: '**',
    redirectTo: 'landing-page',
  },
];
