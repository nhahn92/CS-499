/**
 * TripData Service
 * -----------------
 * Provides all HTTP operations for interacting with the Travlr API.
 * Enhanced for Milestone Four to enforce type consistency and data integrity.
 */

import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { BROWSER_STORAGE } from '../storage';

import { Trip } from '../models/trip';

@Injectable({
  providedIn: 'root'
})
export class TripData {

  baseUrl = 'http://localhost:3000/api';
  url = this.baseUrl + '/trips';

  constructor(
    private http: HttpClient,
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) {}

  /**
   * NormalizeTrip()
   * ----------------
   * Ensures all incoming trip data from the API is properly typed.
   * Converts:
   *  - start → Date
   *  - perPerson → number
   */
  private normalizeTrip(t: Trip): Trip {
    return {
      ...t,
      start: new Date(t.start),
      perPerson: Number(t.perPerson)
    };
  }

  /** Retrieve all trips */
  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.url).pipe(
      map(trips => trips.map(t => this.normalizeTrip(t)))
    );
  }

  /**
   * prepareTripPayload()
   * ---------------------
   * Ensures outgoing trip data sent to the API is properly typed.
   * Converts:
   *  - length → number
   *  - perPerson → number
   *  - start → Date
   * Trims all string fields to maintain consistency.
   */
  private prepareTripPayload(formData: any): any {
    return {
      code: String(formData.code).trim(),
      name: String(formData.name).trim(),
      length: Number(formData.length),
      start: new Date(formData.start),
      resort: String(formData.resort).trim(),
      perPerson: Number(formData.perPerson),
      image: String(formData.image).trim(),
      description: String(formData.description).trim()
    };
  }

  /** Add a new trip */
  addTrip(formData: Omit<Trip, '_id'>): Observable<Trip> {
    const token = this.storage.getItem('travlr-token');
    const payload = this.prepareTripPayload(formData);

    return this.http.post<Trip>(this.url, payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(map(t => this.normalizeTrip(t)));
  }

  /** Retrieve a single trip */
  getTrip(tripCode: string): Observable<Trip> {
    return this.http.get<Trip[]>(`${this.url}/${tripCode}`).pipe(
      map(arr => this.normalizeTrip(arr[0]))
    );
  }

  /** Update an existing trip */
  updateTrip(formData: Trip): Observable<Trip> {
    const token = this.storage.getItem('travlr-token');
    const payload = this.prepareTripPayload(formData);

    return this.http.put<Trip>(`${this.url}/${formData.code}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(map(t => this.normalizeTrip(t)));
  }

  /** Delete a trip */
  deleteTrip(tripCode: string): Observable<any> {
    const token = this.storage.getItem('travlr-token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete(`${this.baseUrl}/trips/${tripCode}`, { headers });
  }

  /** Authentication helpers */
  login(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('login', user, passwd);
  }

  register(user: User, passwd: string): Observable<AuthResponse> {
    return this.handleAuthAPICall('register', user, passwd);
  }

  private handleAuthAPICall(endpoint: string, user: User, passwd: string): Observable<AuthResponse> {
    const formData = {
      name: user.name,
      email: user.email,
      password: passwd
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/${endpoint}`, formData);
  }
}