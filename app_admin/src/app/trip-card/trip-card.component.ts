/**
 * TripCardComponent
 * ------------------
 * Displays a single trip card within the trip listing view.
 *
 * Responsibilities:
 *  - Render trip details passed from TripListingComponent
 *  - Provide an edit button for admin users
 *  - Navigate to the edit-trip page using Angular route parameters
 *
 * Notes:
 *  - This component is standalone and imported directly into TripListingComponent
 *  - Admin-only UI elements are conditionally displayed based on authentication
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.css']
})
export class TripCardComponent implements OnInit {

  /**
   * trip
   * ----
   * Trip data passed from the parent component (TripListingComponent).
   * Contains all fields defined in the Trip model.
   */
  @Input() trip: Trip | any;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  /**
   * ngOnInit()
   * -----------
   * Lifecycle hook included for future expansion.
   * Currently no initialization logic is required.
   */
  ngOnInit(): void {}

  /**
   * editTrip(trip)
   * --------------
   * Navigates to the edit-trip page using Angular route parameters.
   *
   * Behavior:
   *   - Passes tripCode directly in the URL: /edit-trip/:tripCode
   *   - Allows EditTripComponent to load the correct trip from the API
   */
  public editTrip(trip: Trip): void {
    this.router.navigate(['edit-trip', trip.code]);
  }

  /**
   * isLoggedIn()
   * ------------
   * Returns true if the user is authenticated and the JWT is valid.
   * Used to conditionally display admin-only UI elements such as:
   *   - Edit button
   *   - Delete button (if implemented)
   */
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}