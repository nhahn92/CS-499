/**
 * Application Routes
 * -------------------
 * Defines navigation paths for the Travlr Angular application.
 * Includes route parameter support for editing trips and admin
 * route protection for trip management features.
 */

import { Routes } from '@angular/router';
import { AddTripComponent } from './add-trip/add-trip.component';
import { TripListingComponent } from './trip-listing/trip-listing.component';
import { EditTripComponent } from './edit-trip/edit-trip.component';
import { LoginComponent } from './login/login.component';
import { AdminGuard } from './admin.guard';

/**
 * routes
 * ------
 * Main route configuration for the application.
 *
 * Paths:
 *  - add-trip: Protected by AdminGuard
 *  - edit-trip/:tripCode: Protected by AdminGuard
 *  - login: Public
 *  - '' (root): Trip listing page
 */
export const routes: Routes = [
  {
    path: 'add-trip',
    component: AddTripComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'edit-trip/:tripCode',
    component: EditTripComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: TripListingComponent,
    pathMatch: 'full'
  }
];