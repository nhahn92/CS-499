/**
 * Database Seeding Script
 * ------------------------
 * Populates the Travlr database with initial trip data.
 * This script:
 *   1. Connects to MongoDB using the shared db module
 *   2. Loads the Trip model
 *   3. Reads seed data from /data/trips.json
 *   4. Clears existing trip records
 *   5. Inserts fresh seed data
 *   6. Closes the database connection
 */

const Mongoose = require('./db');
const Trip = require('./travlr');
const fs = require('fs');

/**
 * Load seed data from JSON file
 * ------------------------------
 * Reads the trips.json file and parses it into a JavaScript array.
 */
const trips = JSON.parse(
    fs.readFileSync('./data/trips.json', 'utf8')
);

/**
 * seedDB()
 * ---------
 * Deletes all existing trip records and inserts the seed data.
 */
const seedDB = async () => {
    await Trip.deleteMany({});
    await Trip.insertMany(trips);
};

/**
 * Execute seeding process
 * ------------------------
 * Runs the seed function, then closes the database connection
 * and exits the process.
 */
seedDB().then(async () => {
    await Mongoose.connection.close();
    process.exit(0);
});