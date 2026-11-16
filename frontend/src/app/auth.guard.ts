import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Lets a page open only when logged in, otherwise sends the user to /login.
export const authGuard: CanActivateFn = () =>
  inject(AuthService).loggedIn() ? true : inject(Router).createUrlTree(['/login']);
