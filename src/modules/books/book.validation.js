/**
 * Book Validation Schemas
 * Joi schemas for validating book-related request data.
 */

const Joi = require('joi');

// ISBN-13 pattern (with or without hyphens): e.g. 978-3-16-148410-0 or 9783161484100
const isbnPattern = /^(?:\d{3}-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1}|\d{10}|\d{13})$/;

const createBookSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255).required()
        .messages({ 'string.empty': 'Title is required' }),
    author: Joi.string().trim().min(1).max(255).required()
        .messages({ 'string.empty': 'Author is required' }),
    isbn: Joi.string().trim().pattern(isbnPattern).required()
        .messages({
            'string.pattern.base': 'ISBN must be a valid ISBN-10 or ISBN-13',
            'string.empty': 'ISBN is required',
        }),
    quantity: Joi.number().integer().min(0).required()
        .messages({ 'number.min': 'Quantity must be at least 0' }),
    shelf_location: Joi.string().trim().min(1).max(50).required()
        .messages({ 'string.empty': 'Shelf location is required' }),
});

const updateBookSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255),
    author: Joi.string().trim().min(1).max(255),
    isbn: Joi.string().trim().pattern(isbnPattern)
        .messages({ 'string.pattern.base': 'ISBN must be a valid ISBN-10 or ISBN-13' }),
    quantity: Joi.number().integer().min(0),
    shelf_location: Joi.string().trim().min(1).max(50),
}).min(1).messages({ 'object.min': 'At least one field must be provided for update' });

const searchBookSchema = Joi.object({
    title: Joi.string().trim().max(255),
    author: Joi.string().trim().max(255),
    isbn: Joi.string().trim().max(17),
}).min(1).messages({ 'object.min': 'At least one search parameter is required (title, author, or isbn)' });

module.exports = { createBookSchema, updateBookSchema, searchBookSchema };
