/**
 * Rate Limiting Middleware
 * Prevents API abuse by limiting the number of requests per window.
 * Applied to the checkout and return endpoints (most critical operations).
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for borrowing operations (checkout / return).
 * Max 10 requests per minute per IP.
 */
const borrowingRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many requests. Please try again after 1 minute.',
        },
    },
});

/**
 * General API rate limiter.
 * Max 100 requests per minute per IP.
 */
const generalRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            message: 'Too many requests. Please try again later.',
        },
    },
});

module.exports = { borrowingRateLimiter, generalRateLimiter };
