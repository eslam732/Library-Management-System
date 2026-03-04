/**
 * Auth Validation Schemas
 * Joi schemas for validating registration and login request data.
 */

const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required()
        .messages({ 'string.empty': 'Name is required' }),
    email: Joi.string().trim().email().max(255).required()
        .messages({
            'string.email': 'A valid email address is required',
            'string.empty': 'Email is required',
        }),
    password: Joi.string().min(6).max(128).required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required',
        }),
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required()
        .messages({
            'string.email': 'A valid email address is required',
            'string.empty': 'Email is required',
        }),
    password: Joi.string().required()
        .messages({ 'any.required': 'Password is required' }),
});

module.exports = { registerSchema, loginSchema };
