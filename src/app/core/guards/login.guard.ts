import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { TicketStateService } from '../services/ticket-state.service';

export const loginGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {

  const authService = inject(AuthService);
  const ticketState = inject(TicketStateService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    if (ticketState.hasSession()) {
      return router.createUrlTree(['/tickets/menu']);
    }
    return router.createUrlTree(['/session-config']);
  }
  return true;
};