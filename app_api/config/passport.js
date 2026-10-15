/**
 * Passport Local Authentication Strategy
 * ---------------------------------------
 * Configures Passport.js to authenticate users using a local strategy
 * (email + password). This strategy is used by the /login endpoint in
 * the API layer.
 *
 * Responsibilities:
 *  - Look up a user by email
 *  - Validate the provided password using the User model's method
 *  - Return authentication success or failure through Passport's callback
 *
 * Notes:
 *  - Password hashing and validation are handled by the Mongoose User model
 *  - This strategy supports the API's JWT-based authentication workflow
 *  - Only used for login; registration is handled separately
 */

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

// Load the User model registered with Mongoose
const Users = require("../models/user");
const User = mongoose.model("users");

// Configure Passport to use the LocalStrategy
passport.use(
  new LocalStrategy(
    {
      // Use "email" instead of the default "username"
      usernameField: "email",
    },
    async (username, password, done) => {
      try {
        // Look up the user by email
        const q = await User.findOne({ email: username }).exec();

        if (!q) {
          // No user found with this email
          return done(null, false, {
            message: "Incorrect username.",
          });
        }

        // Validate password using model's method
        if (!q.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect password.",
          });
        }

        // Authentication successful: return the user object
        return done(null, q);

      } catch (err) {
        // Handle unexpected errors
        return done(err);
      }
    }
  )
);