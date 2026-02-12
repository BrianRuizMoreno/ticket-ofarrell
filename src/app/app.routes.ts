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
    path: 'session-config',
    loadComponent: () => import('./features/auth/pages/session-config/session-config.page').then(m => m.SessionConfigPage),
    canActivate: [authGuard, empresaGuard]
  },
  {
    path: 'tickets',
    canActivate: [authGuard, empresaGuard],
    children: [
      {
        path: 'menu',
        loadComponent: () => import('./features/tickets/pages/menu/menu.page').then(m => m.MenuPage)
      },
      {
        path: 'scanner',
        loadComponent: () => import('./features/tickets/pages/scanner/scanner.page').then(m => m.ScannerPage)
      },
      {
        path: 'form',
        loadComponent: () => import('./features/tickets/pages/form/form.page').then(m => m.FormPage)
      },
      {
        path: 'decision',
        loadComponent: () => import('./features/tickets/pages/decision/decision.page').then(m => m.DecisionPage)
      },
      {
        path: 'confirm',
        loadComponent: () => import('./features/tickets/pages/confirm/confirm.page').then(m => m.ConfirmPage)
      },
      {
        path: 'success',
        loadComponent: () => import('./features/tickets/pages/success/success.page').then(m => m.SuccessPage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];