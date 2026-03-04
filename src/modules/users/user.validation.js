/**
 * User Validation Schemas
 * Joi schemas for validating user-related request data.
 */

const Joi = require('joi');

const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255),
    email: Joi.string().trim().email().max(255),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

module.exports = { updateUserSchema };
