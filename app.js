/**
 * Application Entry Point
 * ------------------------
 * Configures and initializes the Travlr Getaways Express application.
 * Sets up middleware, view engine, static file serving, authentication,
 * routing, CORS, structured logging, correlation IDs, and centralized
 * JSON error handling.
 */

require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { randomUUID } = require('crypto');

// Passport authentication setup
const passport = require('passport');
require('./app_api/config/passport');

// Route modules
const indexRouter = require('./app_server/routes/index');
const travelRouter = require('./app_server/routes/travel');
const apiRouter = require('./app_api/routes/index');

// Handlebars view engine
const handlebars = require('hbs');

// Database connection
require('./app_api/models/db');

// Create Express application
const app = express();

/**
 * View Engine Configuration
 * -------------------------
 * Uses Handlebars (hbs) for server-rendered pages.
 * Registers partials for reusable template sections.
 */
app.set('views', path.join(__dirname, 'app_server', 'views'));
handlebars.registerPartials(path.join(__dirname, 'app_server', 'views', 'partials'));
app.set('view engine', 'hbs');

/**
 * Standard Middleware Setup
 * --------------------------
 * - Logger: Basic request logging (Morgan)
 * - JSON: Parses JSON request bodies
 * - URL-encoded: Parses form submissions
 * - Cookies: Parses cookies
 * - Static: Serves static files from /public
 * - Passport: Initializes authentication
 */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

/**
 * Request Correlation ID Middleware
 * ---------------------------------
 * Assigns a unique ID to every incoming request.
 * This ID is included in all logs and error responses,
 * making debugging significantly easier.
 */
app.use((req, res, next) => {
    req.id = randomUUID();
    next();
});

/**
 * Structured Request Logging
 * --------------------------
 * Logs each request in JSON format, including:
 * - correlation ID
 * - HTTP method
 * - URL
 * - status code
 * - response time
 *
 * Development: pretty-printed logs
 * Production: compact logs
 */
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;

        const logEntry = {
            id: req.id,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: duration
        };

        if (req.app.get('env') === 'development') {
            console.log(JSON.stringify(logEntry, null, 2));
        } else {
            console.log(JSON.stringify(logEntry));
        }
    });

    next();
});

/**
 * CORS Configuration
 * -------------------
 * Allows the Angular admin application (localhost:4200)
 * to communicate with the API.
 */
app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

/**
 * Route Registration
 * -------------------
 * Connects URL paths to route controllers.
 */
app.use('/', indexRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

/**
 * 404 Handler
 * ------------
 * Creates a 404 error when no route matches the request.
 * This is forwarded to the centralized JSON error handler.
 */
app.use((req, res, next) => {
    next(createError(404, 'Resource not found'));
});

/**
 * Centralized JSON Error Handler
 * -------------------------------
 * Provides consistent JSON error responses and structured error logging.
 *
 * Behavior:
 * - Development: includes stack trace for debugging
 * - Production: hides stack trace for security
 */
app.use((err, req, res, next) => {
    const status = err.status || 500;

    const errorResponse = {
        id: req.id,
        status,
        error: err.message || 'Internal Server Error'
    };

    // Structured error log
    const errorLog = {
        id: req.id,
        status,
        message: err.message,
        stack: req.app.get('env') === 'development' ? err.stack : undefined
    };

    if (req.app.get('env') === 'development') {
        console.error(JSON.stringify(errorLog, null, 2));
    } else {
        console.error(JSON.stringify(errorLog));
    }

    // Include stack trace only in development
    if (req.app.get('env') === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(status).json(errorResponse);
});

/**
 * Unauthorized Error Handler
 * ---------------------------
 * Handles authentication errors produced by JWT middleware.
 */
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            id: req.id,
            status: 401,
            error: 'Unauthorized',
            details: err.message
        });
    }
    next(err);
});

/**
 * Server Startup
 * ---------------
 * Starts the Express server on port 3000.
 */
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});