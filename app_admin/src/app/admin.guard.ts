/**
 * AdminGuard
 * -----------
 * Prevents navigation to admin-only routes unless the user is logged in
 * and has the 'admin' role. Uses the AuthenticationService to validate
 * login state and role information stored in the JWT.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  /**
   * canActivate()
   * -------------
   * Determines whether the user is allowed to access an admin route.
   * Returns true only if:
   *   - The user is logged in
   *   - The user's role is 'admin'
   *
   * Redirects to the login page if access is denied.
   */
  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const isAdmin = this.authService.isAdmin();

    if (isLoggedIn && isAdmin) {
      return true;
    }

    this.router.navigate(['login']);
    return false;
  }
}