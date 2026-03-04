/**
 * Book Routes
 * Defines RESTful endpoints for book operations.
 *
 * GET    /api/books          - List all books (any authenticated user)
 * GET    /api/books/search   - Search books (any authenticated user)
 * GET    /api/books/:id      - Get a single book (any authenticated user)
 * POST   /api/books          - Add a new book (admin only)
 * PUT    /api/books/:id      - Update a book (admin only)
 * DELETE /api/books/:id      - Delete a book (admin only)
 */

const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');
const validate = require('../../middleware/validate');
const { authorize } = require('../../middleware/auth');
const { createBookSchema, updateBookSchema, searchBookSchema } = require('./book.validation');

// List all books (pagination via query: ?page=1)
router.get('/', bookController.getAllBooks);

// Search books (query params: ?title=...&author=...&isbn=...)
router.get('/search', validate(searchBookSchema, 'query'), bookController.searchBooks);

// Get a single book by ID
router.get('/:id', bookController.getBookById);

// Add a new book (admin only)
router.post('/', authorize('admin'), validate(createBookSchema), bookController.createBook);

// Update a book (admin only)
router.put('/:id', authorize('admin'), validate(updateBookSchema), bookController.updateBook);

// Delete a book (admin only)
router.delete('/:id', authorize('admin'), bookController.deleteBook);

module.exports = router;
