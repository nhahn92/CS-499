/**
 * EditTripComponent
 * ------------------
 * Provides a form for editing an existing trip.
 * Fixes:
 * - Incoming ISO dates now normalized for <input type="date">
 * - Validators updated to match real-world trip formats
 * - Form fields no longer wipe themselves on load
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { TripData } from '../services/trip-data';
import { Trip } from '../models/trip';

@Component({
  selector: 'app-edit-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-trip.component.html',
  styleUrls: ['./edit-trip.component.css']
})
export class EditTripComponent implements OnInit {

  public editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tripDataService: TripData
  ) {}

  ngOnInit(): void {
    const tripCode = this.route.snapshot.paramMap.get('tripCode');

    if (!tripCode) {
      alert("Trip code not found.");
      this.router.navigate(['']);
      return;
    }

    // Build form with correct validators
    this.editForm = this.formBuilder.group({
      _id: [],
      code: [tripCode, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      length: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s\/]+$/)]],
      start: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      resort: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      perPerson: ['', [Validators.required, Validators.min(1), Validators.max(20000)]],
      image: ['', [Validators.required, Validators.pattern(/^[\w,\s-]+\.(jpg|jpeg|png|gif)$/i)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]]
    });

    // Retrieve trip data
    this.tripDataService.getTrip(tripCode).subscribe({
      next: (value: Trip) => {
        this.trip = value;

        // Normalize ISO date → YYYY-MM-DD
        const normalizedStart = this.trip.start.toISOString().split('T')[0];

        // Patch values into form
        this.editForm.patchValue({
          ...this.trip,
          start: normalizedStart
        });

        this.message = `Trip ${tripCode} retrieved`;
      },
      error: (error: any) => {
        console.log('Error:', error);
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      this.message = 'Please correct the errors in the form.';
      return;
    }

    this.tripDataService.updateTrip(this.editForm.value).subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (error: any) => {
        console.log('Error:', error);
        this.message = 'Error updating trip.';
      }
    });
  }

  get f() {
    return this.editForm.controls;
  }
}