/**
 * Validation Middleware Factory
 * Uses Joi schemas to validate request bodies, params, and queries.
 * Returns 400 Bad Request with details on validation failure.
 */

const { BadRequest } = require('../utils/errors');

/**
 * Creates a validation middleware for the given Joi schema.
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} source - Request property to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,   // Return all validation errors
            stripUnknown: true,  // Remove unknown fields (security)
        });

        if (error) {
            const details = error.details.map((d) => d.message).join(', ');
            return next(new BadRequest(`Validation error: ${details}`));
        }

        // Replace the source with the sanitized/validated value
        req[source] = value;
        next();
    };
};

module.exports = validate;
