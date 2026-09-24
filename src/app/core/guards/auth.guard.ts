import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {

  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (authService.isAuthenticated() && storageService.isSessionValid()) {
    return true;
  }

  // Clean up potential invalid state
  if (!storageService.isSessionValid()) {
    authService.logout();
  }

  return router.createUrlTree(['/login']);
};