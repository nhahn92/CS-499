/**
 * AddTripComponent
 * -----------------
 * Provides the admin interface for creating new trips.
 *
 * Responsibilities:
 * - Build and validate the reactive form
 * - Submit form data to the TripData service
 * - Handle success and error responses
 * - Redirect the user back to the trip listing after creation
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TripData } from '../services/trip-data';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.css']
})
export class AddTripComponent implements OnInit {

  /** Reactive form instance */
  addForm!: FormGroup;

  /** Tracks form submission state */
  submitted = false;

  /** Status message displayed to the user */
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripData
  ) {}

  /**
   * ngOnInit()
   * -----------
   * Initializes the reactive form with strong validation rules.
   */
  ngOnInit() {
    this.addForm = this.formBuilder.group({
      _id: [],

      code: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Z0-9]{4,12}$/)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],

      length: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z0-9\s\/]+$/)
        ]
      ],

      start: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
        ]
      ],

      resort: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],

      perPerson: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(20000)
        ]
      ],

      image: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[\w,\s-]+\.(jpg|jpeg|png|gif)$/i)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(5000)
        ]
      ]
    });
  }

  /**
   * onSubmit()
   * ----------
   * Validates the form and submits new trip data.
   */
  public onSubmit() {
    this.submitted = true;

    if (this.addForm.invalid) {
      this.message = 'Please correct the errors in the form.';
      return;
    }

    this.tripService.addTrip(this.addForm.value).subscribe({
      next: (data: any) => {
        console.log('Trip created:', data);
        this.router.navigate(['']);
      },
      error: (error: any) => {
        console.log('Error creating trip:', error);
        this.message = 'Error creating trip.';
      }
    });
  }

  /** Convenience getter for form controls */
  get f() {
    return this.addForm.controls;
  }
}