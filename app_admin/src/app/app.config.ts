/**
 * Application Configuration (app.config.ts)
 * ------------------------------------------
 * Defines global providers for the Travlr Admin Angular application.
 *
 * Responsibilities:
 *  - Register the application's routing configuration
 *  - Provide Angular's modern HTTP client (standalone API)
 *  - Register the JWT interceptor for automatic token injection
 *
 * Notes:
 *  - All providers listed here apply application-wide
 */

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptProvider } from './utils/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * provideRouter(routes)
     * ----------------------
     * Registers the application's route definitions using Angular's
     * standalone routing API.
     */
    provideRouter(routes),

    /**
     * provideHttpClient()
     * --------------------
     * Registers Angular's modern HTTP client.
     *
     * Notes:
     *  - Replaces deprecated HttpClientModule
     *  - Enables HttpClient injection throughout the application
     *  - Works seamlessly with interceptors
     */
    provideHttpClient(),

    /**
     * authInterceptProvider
     * ----------------------
     * Registers the JWT interceptor globally.
     *
     * Behavior:
     *  - Automatically attaches Authorization: Bearer <token>
     *    to outgoing HTTP requests (except login/register)
     */
    authInterceptProvider
  ]
};