/**
 * Global Error Handling Middleware
 *
 * - Operational errors (AppError subclasses) → safe message returned to client.
 * - Programming / unexpected errors          → generic message to client,
 *                                              full details go to log file only.
 *
 * The stack trace is NEVER exposed in the HTTP response.
 * All errors (operational or not) are persisted to logs/error.log via logger.
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const isOperational = Boolean(err.isOperational);

    // ------------------------------------------------------------------
    // Always log to file: message + stack for full traceability
    // ------------------------------------------------------------------
    logger.error(err.message, {
        type: err.name || 'Error',
        statusCode,
        method: req.method,
        url: req.originalUrl,
        stack: err.stack,
    });

    // ------------------------------------------------------------------
    // Console output (development only, no stack on operational errors)
    // ------------------------------------------------------------------
    if (process.env.NODE_ENV !== 'production') {
        if (isOperational) {
            console.error(`[${err.name || 'AppError'}] ${statusCode} — ${err.message}`);
        } else {
            console.error('[UnhandledError]', err);
        }
    }

    // ------------------------------------------------------------------
    // HTTP response — stack is NEVER included
    // ------------------------------------------------------------------
    res.status(statusCode).json({
        success: false,
        error: {
            type: err.name || 'InternalServerError',
            message: isOperational ? err.message : 'An unexpected error occurred. Please try again later.',
        },
    });
};

module.exports = errorHandler;
