/**
 * TripListingComponent
 * ---------------------
 * Displays, filters, and paginates the list of trips in the Travlr Admin
 * application. This component represents the primary administrative view
 * for managing travel inventory.
 *
 * Milestone Three Enhancements:
 * -----------------------------
 * - Reactive authentication state (admin controls update instantly)
 * - Pagination (reduces rendering complexity)
 * - Search filtering (linear search algorithm)
 * - Sample trip injection for pagination testing
 * - Human-friendly date formatting (via Angular date pipe)
 *
 * Responsibilities:
 * -----------------
 * - Retrieve trips from TripData service
 * - Normalize and prepare data for display
 * - Provide admin-only actions (edit, delete)
 * - Support search and pagination
 * - Reactively update UI when login state changes
 */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripData } from '../services/trip-data';
import { Trip } from '../models/trip';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-listing.component.html',
  styleUrls: ['./trip-listing.component.css'],
  providers: [TripData]
})
export class TripListingComponent implements OnInit {

  /**
   * Full list of trips retrieved from the API.
   * This array is never mutated directly by search or pagination.
   */
  trips: Trip[] = [];

  /**
   * Filtered list after applying search criteria.
   * Pagination operates on this array.
   */
  filteredTrips: Trip[] = [];

  /**
   * Pagination State
   * ----------------
   * pageSize      → number of trips per page
   * currentPage   → active page index (1-based)
   * totalPages    → computed based on filteredTrips.length
   * paginatedTrips → slice of filteredTrips shown on the current page
   */
  pageSize: number = 5;
  currentPage: number = 1;
  totalPages: number = 1;
  paginatedTrips: Trip[] = [];

  /**
   * Search term bound to the search input field.
   * Used to filter trips via applySearch().
   */
  searchTerm: string = '';

  /**
   * Status message displayed above the table.
   */
  message: string = '';

  /**
   * Reactive login state.
   * Updated automatically when user logs in or out.
   * Used to conditionally show admin-only UI elements.
   */
  loggedIn: boolean = false;

  constructor(
    private tripData: TripData,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthenticationService
  ) {}

  /**
   * ngOnInit()
   * -----------
   * Lifecycle hook that loads the trip list and subscribes to login state.
   */
  ngOnInit(): void {
    this.getStuff();

    /**
     * Subscribe to reactive login state.
     * Whenever the user logs in or out, this value updates instantly.
     */
    this.authService.loggedIn$.subscribe((status) => {
      this.loggedIn = status;
      this.cdr.detectChanges(); // ensure UI updates immediately
    });
  }

  /**
   * addTrip()
   * ---------
   * Navigates to the AddTripComponent.
   * Admin-only action.
   */
  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  /**
   * editTrip(trip)
   * ---------------
   * Navigates to the EditTripComponent using the trip code as a route param.
   */
  public editTrip(trip: Trip): void {
    this.router.navigate(['edit-trip', trip.code]);
  }

  /**
   * deleteTrip(trip)
   * -----------------
   * Deletes a trip after user confirmation.
   *
   * Behavior:
   * - Confirms deletion
   * - Calls TripData.deleteTrip()
   * - Removes the trip from the local array
   * - Re-applies search and pagination
   */
  public deleteTrip(trip: Trip): void {
    if (!confirm(`Are you sure you want to delete ${trip.name}?`)) return;

    this.tripData.deleteTrip(trip.code).subscribe({
      next: () => {
        // Remove deleted trip
        this.trips = this.trips.filter(t => t.code !== trip.code);

        // Reapply search and pagination
        this.applySearch();

        this.message = `Trip ${trip.code} deleted successfully.`;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.log('Delete error:', error);
        this.message = 'Error deleting trip.';
      }
    });
  }

  /**
   * applySearch()
   * --------------
   * Implements a linear search algorithm across the trip list.
   *
   * Searchable fields:
   * - name
   * - resort
   * - code
   *
   * Behavior:
   * - Converts searchTerm to lowercase
   * - Filters trips into filteredTrips
   * - Resets pagination to page 1
   */
  public applySearch(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredTrips = this.trips.filter(trip =>
      trip.name.toLowerCase().includes(term) ||
      trip.resort.toLowerCase().includes(term) ||
      trip.code.toLowerCase().includes(term)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * updatePagination()
   * -------------------
   * Computes pagination values and slices filteredTrips.
   *
   * Algorithm:
   * - totalPages = ceil(n / pageSize)
   * - startIndex = (currentPage - 1) * pageSize
   * - endIndex = startIndex + pageSize
   * - paginatedTrips = filteredTrips[startIndex:endIndex]
   */
  private updatePagination(): void {
    if (!this.filteredTrips || this.filteredTrips.length === 0) {
      this.paginatedTrips = [];
      this.totalPages = 1;
      return;
    }

    this.totalPages = Math.ceil(this.filteredTrips.length / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedTrips = this.filteredTrips.slice(startIndex, endIndex);
  }

  /**
   * nextPage()
   * -----------
   * Moves to the next page if available.
   */
  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * prevPage()
   * -----------
   * Moves to the previous page if available.
   */
  public prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * getStuff()
   * -----------
   * Retrieves trips from the API and injects additional sample trips
   * for pagination testing.
   *
   * Notes:
   * - Sample trips are development-only and should be removed in production.
   * - Dates are normalized to human-friendly formats in the template.
   */
  private getStuff(): void {
    this.tripData.getTrips().subscribe({
      next: (value: Trip[]) => {
        this.trips = [...value];

        // Inject sample trips for pagination testing
        for (let i = 1; i <= 15; i++) {
          this.trips.push({
            code: `TEST${i}`,
            name: `Sample Trip ${i}`,
            length: 3 + i,
            start: new Date(`2026-10-${(i % 28) + 1}`),
            resort: `Resort ${i}`,
            perPerson: 999 + i * 10,
            image: 'sample.jpg',
            description: 'Sample description for testing pagination.'
          });
        }

        this.filteredTrips = this.trips;
        this.updatePagination();
        this.cdr.detectChanges();

        this.message = `There are ${this.trips.length} trips available.`;
      },
      error: (error: any) => {
        console.log('Error:', error);
        this.message = 'Error retrieving trips.';
      }
    });
  }
}