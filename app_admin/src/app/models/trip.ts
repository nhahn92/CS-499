/**
 * Trip Interface
 * --------------
 * Defines the structure of a Trip object used throughout the Travlr Getaways
 * Angular admin application.
 */

export interface Trip {
  /**
   * _id
   * ---
   * Optional MongoDB primary key.
   * Present in API responses, absent in static JSON.
   */
  _id?: string;

  /**
   * code
   * ----
   * Unique trip identifier (e.g., "GALR210214").
   */
  code: string;

  /**
   * name
   * ----
   * Human-readable trip name.
   */
  name: string;

  /**
   * length
   * -------
   * Duration of the trip in days.
   */
  length: number;

  /**
   * start
   * -----
   * Actual JavaScript Date object.
   */
  start: Date;

  /**
   * resort
   * -------
   * Resort name and rating (e.g., "Emerald Bay, 3 stars").
   */
  resort: string;

  /**
   * perPerson
   * ----------
   * Cost per traveler.
   * Always a number (TypeScript primitive).
   */
  perPerson: number;

  /**
   * image
   * -----
   * Filename of the trip image stored in assets/images.
   */
  image: string;

  /**
   * description
   * ------------
   * HTML-free trip description text.
   * Sanitized on the server before storage.
   */
  description: string;
}