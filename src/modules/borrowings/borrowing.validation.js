/**
 * Borrowing Validation Schemas
 * Joi schemas for validating borrowing-related request data.
 * Note: user_id comes from JWT token, not from request body.
 */

const Joi = require('joi');

const checkoutSchema = Joi.object({
    book_id: Joi.number().integer().positive().required()
        .messages({ 'any.required': 'Book ID is required' }),
    due_date: Joi.date().iso().greater('now').optional()
        .messages({ 'date.greater': 'Due date must be in the future' }),
});

const returnSchema = Joi.object({
    book_id: Joi.number().integer().positive().required()
        .messages({ 'any.required': 'Book ID is required' }),
});

const analyticsQuerySchema = Joi.object({
    start_date: Joi.date().iso().required()
        .messages({ 'any.required': 'Start date is required (YYYY-MM-DD)' }),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
        .messages({
            'any.required': 'End date is required (YYYY-MM-DD)',
            'date.min': 'End date must be after start date',
        }),
    format: Joi.string().valid('json', 'csv', 'xlsx').default('json'),
});

const exportQuerySchema = Joi.object({
    format: Joi.string().valid('csv', 'xlsx').default('csv'),
});

module.exports = { checkoutSchema, returnSchema, analyticsQuerySchema, exportQuerySchema };
