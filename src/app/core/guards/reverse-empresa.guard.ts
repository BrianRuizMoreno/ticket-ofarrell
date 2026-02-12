import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const reverseEmpresaGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.requiresEmpresaSelection()) {

    return authService.isAuthenticated()
      ? router.createUrlTree(['/tickets/menu'])
      : router.createUrlTree(['/login']);
  }
  return true;
};