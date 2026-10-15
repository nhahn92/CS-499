/**
 * LoginComponent
 * ----------------
 * Provides the login interface for the Travlr Admin application.
 *
 * Responsibilities:
 *  - Capture user credentials (email + password)
 *  - Validate required fields
 *  - Call the AuthenticationService to perform login
 *  - Display error messages on failure
 *  - Redirect authenticated users to the home page
 *
 * Notes:
 *  - Uses template-driven forms (FormsModule)
 *  - AuthenticationService handles JWT storage and validation
 *  - A short delay is used after login to allow token persistence
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication';
import { User } from '../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {

  /**
   * Holds any error message to display in the template.
   * Reset on each login attempt.
   */
  public formError: string = '';

  /**
   * Model bound to the login form fields.
   * Template-driven form automatically updates these values.
   */
  credentials = {
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  /**
   * doLogin()
   * ----------
   * Performs the login request using AuthenticationService.
   * After calling login(), waits briefly for the JWT to be saved
   * before checking authentication status.
   *
   * If login succeeds → redirect to home page.
   * If login fails → display error message.
   */
  private doLogin(): void {
    const user: User = {
      name: '', // Name not required for login
      email: this.credentials.email
    };

    // Trigger login request
    this.authenticationService.login(user, this.credentials.password);

    // Allow time for token to be saved to storage
    setTimeout(() => {
      if (this.authenticationService.isLoggedIn()) {
        this.router.navigate(['']); // Redirect to home page
      } else {
        this.formError = 'Login failed';
      }
    }, 300);
  }

  /**
   * onLoginSubmit()
   * ----------------
   * Validates form fields and triggers login.
   * Ensures both email and password are provided.
   */
  public onLoginSubmit(): void {
    this.formError = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.formError = 'Email and password are required';
      return;
    }

    this.doLogin();
  }
}