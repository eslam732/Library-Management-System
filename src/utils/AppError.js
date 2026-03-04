/**
 * Custom Application Error
 * Extends the native Error class with HTTP status codes
 * for consistent error handling across the application.
 */

class AppError extends Error {
    /**
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
