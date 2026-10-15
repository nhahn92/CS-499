/**
 * JwtInterceptor
 * ----------------
 * Automatically attaches the JWT (JSON Web Token) to outgoing HTTP requests
 * for protected API endpoints.
 *
 * Responsibilities:
 *  - Inspect outgoing requests
 *  - Skip adding the token for authentication endpoints (login/register)
 *  - Add Authorization: Bearer <token> header for all other requests
 *
 * Notes:
 *  - This interceptor centralizes JWT handling so individual services
 *    (TripData, AuthenticationService, etc.) do not need to manually
 *    attach tokens.
 *  - Angular's HttpInterceptor runs for every HTTP request automatically.
 */

import { Injectable, Provider } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authenticationService: AuthenticationService
  ) {}

  /**
   * intercept()
   * ------------
   * Intercepts outgoing HTTP requests and conditionally adds the JWT.
   *
   * Behavior:
   *  - If the request is for login or registration → do NOT attach a token
   *  - If the user is logged in → attach the JWT to the Authorization header
   *  - Otherwise → forward the request unchanged
   *
   * This ensures protected API routes receive the required authentication
   * while public routes remain unaffected.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    let isAuthAPI = false;

    // Identify authentication endpoints
    if (request.url.startsWith('login') ||
        request.url.startsWith('register')) {
      isAuthAPI = true;
    }

    // Attach JWT only if user is logged in AND request is not auth-related
    if (this.authenticationService.isLoggedIn() && !isAuthAPI) {
      const token = this.authenticationService.getToken();

      // Clone the request and add the Authorization header
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(authReq);
    }

    // Forward request unchanged
    return next.handle(request);
  }
}

/**
 * authInterceptProvider
 * ----------------------
 * Registers the JwtInterceptor with Angular's HTTP system.
 *
 * Notes:
 *  - multi: true allows multiple interceptors to be chained
 *  - This provider is typically added in main.ts or app bootstrap configuration
 */
export const authInterceptProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: JwtInterceptor,
  multi: true
};