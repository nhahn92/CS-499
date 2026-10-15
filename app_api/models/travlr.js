/**
 * Trip Model
 * -----------
 * Defines the Mongoose schema for trip data used throughout the Travlr API.
 * This enhanced version includes stronger validation, type consistency,
 * and security-focused constraints to support Milestone Four (Databases).
 */

const mongoose = require('mongoose');

/**
 * Custom Validators
 * ------------------
 * These validators enforce data integrity and prevent malformed or unsafe
 * values from being stored in MongoDB.
 */

// Validate that price is a positive number
const positiveNumberValidator = (value) => {
    return typeof value === 'number' && value > 0;
};

// Validate that the start date is not in the past
const futureDateValidator = (value) => {
    return value instanceof Date && value >= new Date();
};

/**
 * tripSchema
 * -----------
 * Enhanced schema with:
 * - Strong type enforcement
 * - Required fields
 * - Custom validators
 * - Consistent numeric and date types
 * - Security-focused constraints
 */
const tripSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: [true, 'Trip code is required'], 
        index: true,
        trim: true
    },

    name: { 
        type: String, 
        required: [true, 'Trip name is required'], 
        index: true,
        trim: true,
        minlength: [3, 'Trip name must be at least 3 characters long']
    },

    length: { 
        type: Number, 
        required: [true, 'Trip length is required'],
        min: [1, 'Trip length must be at least 1 day']
    },

    start: { 
        type: Date, 
        required: [true, 'Start date is required'],
        validate: {
            validator: futureDateValidator,
            message: 'Start date must be today or in the future'
        }
    },

    resort: { 
        type: String, 
        required: [true, 'Resort name is required'],
        trim: true,
        minlength: [2, 'Resort name must be at least 2 characters long']
    },

    perPerson: { 
        type: Number, 
        required: [true, 'Price per person is required'],
        validate: {
            validator: positiveNumberValidator,
            message: 'Price per person must be a positive number'
        }
    },

    image: { 
        type: String, 
        required: [true, 'Image filename is required'],
        trim: true
    },

    description: { 
        type: String, 
        required: [true, 'Trip description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long']
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

/**
 * Trip Model
 * -----------
 * Creates the Mongoose model using the enhanced schema. The model name "trips"
 * corresponds to the MongoDB collection where trip documents are stored.
 */
const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;