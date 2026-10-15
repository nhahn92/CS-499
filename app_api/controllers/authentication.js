/**
 * Authentication Controller
 * -------------------------
 * Handles user registration and login for the Travlr application.
 * Implements secure password hashing, JWT generation, and Passport-based
 * authentication. All errors are forwarded to centralized error handling
 * middleware using next(err).
 */

const mongoose = require('mongoose');
const User = require('../models/user');
const passport = require('passport');

/**
 * register(req, res, next)
 * ------------------------
 * Creates a new user account and returns a signed JWT.
 */
const register = async (req, res, next) => {
    try {
        // Validate required fields
        if (!req.body.name || !req.body.email || !req.body.password) {
            const err = new Error("All fields required");
            err.status = 400;
            return next(err);
        }

        // Create new user object
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: '' // Placeholder; actual password stored as hash + salt
        });

        // Hash and store password securely
        user.setPassword(req.body.password);

        // Save user to database
        const savedUser = await user.save();

        if (!savedUser) {
            const err = new Error("User registration failed");
            err.status = 400;
            return next(err);
        }

        // Generate JWT for the new user
        const token = user.generateJWT();

        return res.status(200).json({ token });

    } catch (error) {
        error.status = 400;
        next(error);
    }
};

/**
 * login(req, res, next)
 * ---------------------
 * Authenticates an existing user using Passport's local strategy.
 * Returns a signed JWT on success.
 */
const login = (req, res, next) => {
    try {
        // Validate required fields
        if (!req.body.email || !req.body.password) {
            const err = new Error("All fields required");
            err.status = 400;
            return next(err);
        }

        // Delegate authentication to Passport
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                const authErr = new Error("Authentication error");
                authErr.status = 404;
                return next(authErr);
            }

            if (!user) {
                const loginErr = new Error(info?.message || "Invalid credentials");
                loginErr.status = 401;
                return next(loginErr);
            }

            // Successful login: generate JWT
            const token = user.generateJWT();
            return res.status(200).json({ token });

        })(req, res);

    } catch (error) {
        next(error);
    }
};

// Export controller methods
module.exports = {
    register,
    login
};