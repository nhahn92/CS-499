/**
 * Trip Controller
 * ----------------
 * Provides CRUD operations for trip data. All errors are forwarded to
 * centralized error handling middleware using next(err).
 */

const mongoose = require('mongoose');
const Trip = require('../models/travlr');
const Model = mongoose.model('trips');

/**
 * Security: HTML Sanitization
 * ---------------------------
 * sanitize-html removes unsafe HTML, scripts, and malicious input.
 * All string fields are sanitized before stored in MongoDB.
 */
const sanitizeHtml = require('sanitize-html');

/**
 * sanitizeInput()
 * ---------------
 * Helper function to sanitize any incoming string field.
 * Ensures no HTML, scripts, or unsafe characters are stored.
 */
const sanitizeInput = (value) => {
    if (typeof value !== 'string') return value; // Only sanitize strings
    return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

/**
 * GET /trips
 * ----------
 * Returns a list of all trips.
 */
const tripsList = async (req, res, next) => {
    try {
        const trips = await Model.find({}).exec();

        if (!trips || trips.length === 0) {
            const err = new Error('No trips found');
            err.status = 404;
            return next(err);
        }

        return res.status(200).json(trips);

    } catch (error) {
        next(error);
    }
};

/**
 * GET /trips/:tripCode
 * ---------------------
 * Returns a single trip matching the provided tripCode.
 */
const tripsFindByCode = async (req, res, next) => {
    try {
        const trip = await Model.find({ code: req.params.tripCode }).exec();

        if (!trip || trip.length === 0) {
            const err = new Error('Trip not found');
            err.status = 404;
            return next(err);
        }

        return res.status(200).json(trip);

    } catch (error) {
        next(error);
    }
};

/**
 * POST /trips
 * ------------
 * Creates a new trip. Requires admin authorization.
 * Sanitizes all string fields before saving to the database.
 */
const tripsAddTrips = async (req, res, next) => {
    try {
        const newTrip = new Trip({
            code: sanitizeInput(req.body.code),
            name: sanitizeInput(req.body.name),
            length: Number(req.body.length),
            start: new Date(req.body.start),
            resort: sanitizeInput(req.body.resort),
            perPerson: Number(req.body.perPerson),
            image: sanitizeInput(req.body.image),
            description: sanitizeInput(req.body.description)
        });

        const savedTrip = await newTrip.save();

        if (!savedTrip) {
            const err = new Error('Trip could not be saved');
            err.status = 400;
            return next(err);
        }

        return res.status(201).json(savedTrip);

    } catch (error) {
        next(error);
    }
};

/**
 * PUT /trips/:tripCode
 * ---------------------
 * Updates an existing trip. Requires admin authorization.
 * Sanitizes all string fields before updating the database.
 */
const tripsUpdateTrip = async (req, res, next) => {
    try {
        const updatedTrip = await Model.findOneAndUpdate(
            { code: req.params.tripCode },
            {
                code: sanitizeInput(req.body.code),
                name: sanitizeInput(req.body.name),
                length: Number(req.body.length),
                start: new Date(req.body.start),
                resort: sanitizeInput(req.body.resort),
                perPerson: Number(req.body.perPerson),
                image: sanitizeInput(req.body.image),
                description: sanitizeInput(req.body.description)
            },
            { new: true }
        ).exec();

        if (!updatedTrip) {
            const err = new Error('Trip not found or could not be updated');
            err.status = 400;
            return next(err);
        }

        return res.status(200).json(updatedTrip);

    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /trips/:tripCode
 * ------------------------
 * Deletes a trip. Requires admin authorization.
 */
const tripsDeleteTrip = async (req, res, next) => {
    try {
        const deletedTrip = await Model.findOneAndDelete({
            code: req.params.tripCode
        }).exec();

        if (!deletedTrip) {
            const err = new Error('Trip not found');
            err.status = 404;
            return next(err);
        }

        return res.status(204).json(null);

    } catch (error) {
        next(error);
    }
};

/**
 * GET /trips/summary
 * -------------------
 * Provides a summary of trip data using MongoDB's aggregation
 * framework.
 *
 * Returns:
 *  - totalTrips: total number of trips
 *  - averagePrice: average per-person cost
 *  - averageLength: average trip duration
 *  - earliestStart: earliest trip start date
 *  - latestStart: latest trip start date
 *  - tripsByResort: array of resorts with trip counts
 */
const tripsSummary = async (req, res, next) => {
    try {
        const summary = await Model.aggregate([
            {
                $facet: {
                    overallStats: [
                        {
                            $group: {
                                _id: null,
                                totalTrips: { $sum: 1 },
                                averagePrice: { $avg: "$perPerson" },
                                averageLength: { $avg: "$length" },
                                earliestStart: { $min: "$start" },
                                latestStart: { $max: "$start" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalTrips: 1,
                                averagePrice: 1,
                                averageLength: 1,
                                earliestStart: 1,
                                latestStart: 1
                            }
                        }
                    ],
                    tripsByResort: [
                        {
                            $group: {
                                _id: "$resort",
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { count: -1 } },
                        {
                            $project: {
                                _id: 0,
                                resort: "$_id",
                                count: 1
                            }
                        }
                    ]
                }
            }
        ]).exec();

        return res.status(200).json(summary[0]);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrips,
    tripsUpdateTrip,
    tripsDeleteTrip,
    tripsSummary
};