import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { empresaGuard } from './core/guards/empresa.guards';
import { reverseEmpresaGuard } from './core/guards/reverse-empresa.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.page').then(m => m.LoginPage),
    canActivate: [loginGuard]
  },
  {
    path: 'select-empresa',
    loadComponent: () => import('./features/auth/pages/empresa-select/empresa-select.page').then(m => m.EmpresaSelectPage),
    canActivate: [reverseEmpresaGuard]
  },
  {
    path: 'validador',
    canActivate: [authGuard, empresaGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/validador/pages/lista-rendiciones/lista-rendiciones.page').then(m => m.ListaRendicionesPage)
      },
      {
        path: 'lista',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'detalle/:id',
        loadComponent: () => import('./features/validador/pages/detalle-rendicion/detalle-rendicion.page').then(m => m.DetalleRendicionPage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];