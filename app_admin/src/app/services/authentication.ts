/**
 * Authentication Service
 * ----------------------
 * Handles JWT storage, retrieval, decoding, and authentication workflows
 * for the Travlr Angular application. Works together with:
 *   - authentication.js (backend controller)
 *   - user.js (Mongoose model)
 *   - routes/index.js (JWT + role middleware)
 */

import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripData } from '../services/trip-data';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    /**
     * Stores the most recent authentication response.
     * Populated during login/register operations.
     */
    authResp: AuthResponse = new AuthResponse();

    /**
     * Reactive Login State
     * --------------------
     * loggedInSubject:
     *   - Internal BehaviorSubject that stores TRUE/FALSE login state.
     *   - Updated whenever token is saved or removed.
     *
     * loggedIn$:
     *   - Public observable exposed to components.
     *   - Components subscribe to this to update UI instantly.
     *
     * NOTE:
     *   These are initialized inside the constructor to avoid DI timing issues.
     */
    private loggedInSubject!: BehaviorSubject<boolean>;
    public loggedIn$!: Observable<boolean>;

    constructor(
        @Inject(BROWSER_STORAGE) private storage: Storage,
        private tripDataService: TripData
    ) {
        const initialState = this.hasValidToken();

        this.loggedInSubject = new BehaviorSubject<boolean>(initialState);
        this.loggedIn$ = this.loggedInSubject.asObservable();
    }

    /**
     * hasValidToken()
     * ----------------
     * Returns TRUE if:
     *   - a JWT exists
     *   - AND the token has not expired
     */
    private hasValidToken(): boolean {
        const payload = this.decodeToken();
        if (!payload) return false;
        return payload.exp > (Date.now() / 1000);
    }

    /**
     * getToken()
     * ----------
     * Retrieves the JWT from browser storage.
     * Returns an empty string if no token exists.
     */
    public getToken(): string {
        const token = this.storage.getItem('travlr-token');
        return token ? token : '';
    }

    /**
     * saveToken(token)
     * ----------------
     * Saves the JWT to browser storage AND updates reactive login state.
     */
    public saveToken(token: string): void {
        this.storage.setItem('travlr-token', token);
        this.loggedInSubject.next(true);
    }

    /**
     * logout()
     * --------
     * Removes the JWT from browser storage AND updates reactive login state.
     */
    public logout(): void {
        this.storage.removeItem('travlr-token');
        this.loggedInSubject.next(false);
    }

    /**
     * decodeToken()
     * -------------
     * Safely decodes the JWT payload.
     * Returns null if token is missing or malformed.
     */
    private decodeToken(): any {
        const token = this.getToken();
        if (!token) return null;

        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (err) {
            console.error('Error decoding token:', err);
            return null;
        }
    }

    /**
     * isLoggedIn()
     * ------------
     * Returns the current reactive login state.
     * Components should subscribe to loggedIn$ instead of calling this directly.
     */
    public isLoggedIn(): boolean {
        return this.loggedInSubject.value;
    }

    /**
     * getCurrentUser()
     * ----------------
     * Returns the current user's identity information extracted from the JWT.
     * Includes email, name, and role.
     */
    public getCurrentUser(): User {
        const payload = this.decodeToken();
        if (!payload) return { email: '', name: '' } as User;

        return {
            email: payload.email,
            name: payload.name,
            role: payload.role
        } as User;
    }

    /**
     * isAdmin()
     * ---------
     * Convenience method for checking whether the logged-in user
     * has the 'admin' role. Used by Angular route guards.
     */
    public isAdmin(): boolean {
        const payload = this.decodeToken();
        return payload && payload.role === 'admin';
    }

    /**
     * login(user, passwd)
     * -------------------
     * Sends login request to backend via TripData service.
     * Stores JWT upon successful authentication.
     * Updates reactive login state.
     */
    public login(user: User, passwd: string): void {
        this.tripDataService.login(user, passwd)
            .subscribe({
                next: (value: any) => {
                    if (value) {
                        console.log('Login successful:', value);
                        this.authResp = value;
                        this.saveToken(this.authResp.token);
                    }
                },
                error: (error: any) => {
                    console.error('Login error:', error);
                }
            });
    }

    /**
     * register(user, passwd)
     * ----------------------
     * Sends registration request to backend via TripData service.
     * Stores JWT upon successful registration.
     * Updates reactive login state.
     */
    public register(user: User, passwd: string): void {
        this.tripDataService.register(user, passwd)
            .subscribe({
                next: (value: any) => {
                    if (value) {
                        console.log('Registration successful:', value);
                        this.authResp = value;
                        this.saveToken(this.authResp.token);
                    }
                },
                error: (error: any) => {
                    console.error('Registration error:', error);
                }
            });
    }
}