/**
 * Global Error Handling Middleware
 * Catches all errors thrown in routes/middleware and returns
 * a consistent JSON error response.
 */

const errorHandler = (err, req, res, _next) => {
    // Default to 500 Internal Server Error
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    // Log the error in development for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR] ${statusCode} - ${err.message}`);
        if (!err.isOperational) {
            console.error(err.stack);
        }
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;
