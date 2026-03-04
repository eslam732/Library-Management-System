/**
 * JWT Authentication & Authorization Middleware
 * - authenticate: Verifies the JWT token from the Authorization header
 *   and attaches the decoded user payload to req.user.
 * - authorize: Factory that returns middleware restricting access to
 *   users whose role is in the allowed list.
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { NotAllowed } = require('../utils/errors');

/**
 * Verify JWT token and attach user to request.
 * Expects header: Authorization: Bearer <token>
 */
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new NotAllowed('Authentication required. Please provide a valid token.'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        // Attach user info (id, email, role) to the request
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new NotAllowed('Token has expired. Please log in again.'));
        }
        return next(new NotAllowed('Invalid token.'));
    }
};

/**
 * Authorize by role(s).
 * Usage: authorize('admin')  or  authorize('admin', 'user')
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new NotAllowed('Authentication required.'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new NotAllowed('You do not have permission to perform this action.', 403));
        }

        next();
    };
};

module.exports = { authenticate, authorize };