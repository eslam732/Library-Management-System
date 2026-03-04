/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors
 * and pass them to the global error handler.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
