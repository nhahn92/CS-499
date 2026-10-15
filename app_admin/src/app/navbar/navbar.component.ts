/**
 * NavbarComponent
 * ----------------
 * Displays the top navigation bar for the Travlr Admin application.
 *
 * Responsibilities:
 *  - Show login/logout options based on authentication state
 *  - Provide navigation links to routed components
 *  - Trigger logout through AuthenticationService
 *
 * Notes:
 *  - This component is standalone and imported directly into AppComponent
 *  - Uses AuthenticationService to determine login status
 *  - RouterLink and RouterLinkActive are provided via RouterModule
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService
  ) {}

  /**
   * ngOnInit()
   * -----------
   * Lifecycle hook included for future expansion.
   * Currently unused but kept for consistency and readability.
   */
  ngOnInit() {}

  /**
   * isLoggedIn()
   * -------------
   * Returns true if a valid JWT exists in browser storage.
   * Used in the template to toggle login/logout UI elements.
   */
  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  /**
   * onLogout()
   * -----------
   * Logs the user out by removing the JWT from storage.
   * The AuthenticationService handles the actual token removal.
   */
  public onLogout(): void {
    return this.authenticationService.logout();
  }
}