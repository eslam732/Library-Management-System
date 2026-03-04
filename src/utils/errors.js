/**
 * Centralized Error Classes
 *
 * Hierarchy:
 *   AppError          – base (operational, has statusCode + isOperational)
 *     ├── NotAllowed  – 401 Unauthenticated  /  403 Forbidden
 *     ├── BadRequest  – 400 invalid / malformed data
 *     ├── NotFound    – 404 resource does not exist
 *     └── ConflictError – 409 duplicate / state conflict
 *
 * Usage:
 *   const { NotFound, BadRequest, NotAllowed, ConflictError } = require('../utils/errors');
 *
 *   throw new NotFound('Book not found.');
 *   throw new BadRequest('Quantity must be a positive integer.');
 *   throw new NotAllowed('Authentication required.');
 *   throw new NotAllowed('You do not have permission to perform this action.', 403);
 *   throw new ConflictError('A book with this ISBN already exists.');
 */

// ---------------------------------------------------------------------------
// Base
// ---------------------------------------------------------------------------
class AppError extends Error {
    /**
     * @param {string} message     Human-readable message (safe to surface to clients)
     * @param {number} statusCode  HTTP status code
     */
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name; // e.g. "NotFound", "BadRequest"
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes app errors from programming bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

// ---------------------------------------------------------------------------
// 401 / 403  – not authenticated or not authorized
// ---------------------------------------------------------------------------
class NotAllowed extends AppError {
    /**
     * @param {string} message
     * @param {401|403} [statusCode=401]  Use 401 for missing/invalid token,
     *                                    403 for insufficient role/permission.
     */
    constructor(message = 'Authentication required.', statusCode = 401) {
        super(message, statusCode);
    }
}

// ---------------------------------------------------------------------------
// 400 – client sent invalid / malformed data
// ---------------------------------------------------------------------------
class BadRequest extends AppError {
    constructor(message = 'Bad request.') {
        super(message, 400);
    }
}

// ---------------------------------------------------------------------------
// 404 – requested resource does not exist
// ---------------------------------------------------------------------------
class NotFound extends AppError {
    constructor(message = 'The requested resource was not found.') {
        super(message, 404);
    }
}

// ---------------------------------------------------------------------------
// 409 – conflict (duplicate entry, invalid state transition, etc.)
// ---------------------------------------------------------------------------
class ConflictError extends AppError {
    constructor(message = 'Conflict.') {
        super(message, 409);
    }
}

module.exports = { AppError, NotAllowed, BadRequest, NotFound, ConflictError };
