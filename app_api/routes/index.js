/**
 * API Routes
 * -----------
 * Defines all API endpoints for authentication and trip management.
 * Includes JWT authentication, role-based authorization, and consistent
 * error forwarding for centralized error handling.
 */

const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const tripsController = require("../controllers/trips");
const authController = require("../controllers/authentication");

/**
 * JWT Authentication Middleware
 * ------------------------------
 * Validates the Authorization header, verifies the JWT, and attaches
 * the decoded payload to req.user. Forwards errors to centralized
 * error handling middleware.
 */
function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            const err = new Error('Authorization header missing');
            err.status = 401;
            return next(err);
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            const err = new Error('Invalid authorization format');
            err.status = 401;
            return next(err);
        }

        const token = parts[1];
        if (!token) {
            const err = new Error('Token missing');
            err.status = 401;
            return next(err);
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                const authErr = new Error('Invalid or expired token');
                authErr.status = 401;
                return next(authErr);
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Role-Based Authorization Middleware
 * -----------------------------------
 * Ensures the authenticated user has the required role. Forwards
 * authorization errors to centralized error handling middleware.
 */
function authorizeRole(requiredRole) {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                const err = new Error('Role information missing');
                err.status = 403;
                return next(err);
            }

            if (req.user.role !== requiredRole) {
                const err = new Error('Insufficient permissions');
                err.status = 403;
                return next(err);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Authentication Routes
 * ---------------------
 * Public endpoints for registration and login.
 */
router
    .route("/register")
    .post(authController.register);

router
    .route("/login")
    .post(authController.login);

/**
 * Trip Summary Route (Aggregation Pipeline)
 * -----------------------------------------
 * Public endpoint providing high-level analytics about trip data.
 */
router.get("/trips/summary", tripsController.tripsSummary);

/**
 * Trip Routes
 * -----------
 * GET routes are public.
 * POST, PUT, DELETE routes require:
 *   - Valid JWT (authenticateJWT)
 *   - Admin role (authorizeRole('admin'))
 */
router
    .route("/trips")
    .get(tripsController.tripsList)
    .post(
        authenticateJWT,
        authorizeRole('admin'),
        tripsController.tripsAddTrips
    );

router
    .route("/trips/:tripCode")
    .get(tripsController.tripsFindByCode)
    .put(
        authenticateJWT,
        authorizeRole('admin'),
        tripsController.tripsUpdateTrip
    )
    .delete(
        authenticateJWT,
        authorizeRole('admin'),
        tripsController.tripsDeleteTrip
    );

module.exports = router;