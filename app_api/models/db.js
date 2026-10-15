/**
 * Database Connection Module
 * ---------------------------
 * Establishes and manages the MongoDB connection for the Travlr API.
 * Includes connection monitoring, graceful shutdown handlers, and
 * Windows-specific SIGINT support for development environments.
 */

const mongoose = require('mongoose');
const host = process.env.DB_HOST || '127.0.0.1';
const dbURI = `mongodb://${host}/travlr`;
const readLine = require('readline');

/**
 * connect()
 * ----------
 * Initiates the MongoDB connection with a short delay.
 * The delay helps avoid race conditions during server startup.
 */
const connect = () => {
    setTimeout(() => mongoose.connect(dbURI, {}), 1000);
};

/**
 * Connection Event Logging
 * -------------------------
 * Provides visibility into MongoDB connection state.
 */
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

/**
 * Windows SIGINT Support
 * -----------------------
 * Ensures Ctrl+C works properly in Windows terminals by forwarding
 * SIGINT events to the Node process.
 */
if (process.platform === 'win32') {
    const r1 = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    r1.on('SIGINT', () => {
        process.emit('SIGINT');
    });
}

/**
 * gracefulShutdown(msg)
 * ----------------------
 * Closes the MongoDB connection cleanly and logs the reason.
 */
const gracefulShutdown = (msg) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose disconnected through ${msg}`);
    });
};

/**
 * Graceful Shutdown Event Handlers
 * ---------------------------------
 * Handles shutdown events triggered by:
 * - Nodemon restarts
 * - Application termination (Ctrl+C)
 * - Container or environment shutdown
 */
process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', () => {
    gracefulShutdown('app termination');
    process.exit(0);
});

process.on('SIGTERM', () => {
    gracefulShutdown('app shutdown');
    process.exit(0);
});

/**
 * Initial Database Connection
 * ----------------------------
 * Starts the MongoDB connection when the module loads.
 */
connect();

/**
 * Model Registration
 * -------------------
 * Loads the Trip schema so Mongoose can create the model.
 */
require('./travlr');

module.exports = mongoose;