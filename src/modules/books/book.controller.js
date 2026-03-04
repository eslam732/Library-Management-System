/**
 * Book Controller
 * Handles HTTP request/response logic for book operations.
 * Business logic is kept thin — delegates to the model layer.
 */

const BookModel = require('./book.model');
const BorrowingModel = require('../borrowings/borrowing.model');
const { NotFound, BadRequest, ConflictError } = require('../../utils/errors');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');

/**
 * POST /api/books
 * Add a new book to the library.
 */
const createBook = asyncHandler(async (req, res) => {
    // Check for duplicate ISBN
    const existingBook = await BookModel.findByISBN(req.body.isbn);
    if (existingBook) {
        throw new ConflictError('A book with this ISBN already exists.');
    }

    const book = await BookModel.create(req.body);
    res.status(201).json({
        success: true,
        message: 'Book created successfully.',
        data: book,
    });
});

/**
 * GET /api/books
 * List all books with pagination.
 */
const getAllBooks = asyncHandler(async (req, res) => {
    const limit = config.itemsPerPage;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    const { books, total } = await BookModel.findAll(limit, offset);

    res.status(200).json({
        success: true,
        data: books,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

/**
 * GET /api/books/search?title=...&author=...&isbn=...
 * Search for books by title, author, or ISBN.
 */
const searchBooks = asyncHandler(async (req, res) => {
    const results = await BookModel.search(req.query);

    // No filters provided — fall back to paginated list
    if (results === null) {
        const limit = config.itemsPerPage;
        const page = parseInt(req.query.page, 10) || 1;
        const offset = (page - 1) * limit;
        const { books, total } = await BookModel.findAll(limit, offset);
        return res.status(200).json({
            success: true,
            data: books,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }

    res.status(200).json({
        success: true,
        data: results,
        count: results.length,
    });
});

/**
 * GET /api/books/:id
 * Get a single book by ID.
 */
const getBookById = asyncHandler(async (req, res) => {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
        throw new NotFound('Book not found.');
    }

    res.status(200).json({
        success: true,
        data: book,
    });
});

/**
 * PUT /api/books/:id
 * Update a book's details.
 */
const updateBook = asyncHandler(async (req, res) => {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
        throw new NotFound('Book not found.');
    }

    // If ISBN is being changed, check for duplicates
    if (req.body.isbn && req.body.isbn !== book.isbn) {
        const existingBook = await BookModel.findByISBN(req.body.isbn);
        if (existingBook) {
            throw new ConflictError('A book with this ISBN already exists.');
        }
    }

    // If quantity is updated, adjust available_quantity proportionally
    if (req.body.quantity !== undefined) {
        const checkedOut = book.quantity - book.available_quantity;
        const newAvailable = req.body.quantity - checkedOut;
        if (newAvailable < 0) {
            throw new BadRequest(
                `Cannot reduce quantity below ${checkedOut}. There are ${checkedOut} copies currently checked out.`
            );
        }
        req.body.available_quantity = newAvailable;
    }

    const updatedBook = await BookModel.update(req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: 'Book updated successfully.',
        data: updatedBook,
    });
});

/**
 * DELETE /api/books/:id
 * Delete a book from the library.
 */
const deleteBook = asyncHandler(async (req, res) => {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
        throw new NotFound('Book not found.');
    }

    // Prevent deletion if there are active (unreturned) borrowings
    const activeBorrowings = await BorrowingModel.countActiveForBook(req.params.id);
    if (activeBorrowings > 0) {
        throw new BadRequest(
            `Cannot delete this book. ${activeBorrowings} cop${activeBorrowings === 1 ? 'y is' : 'ies are'} currently checked out.`
        );
    }

    await BookModel.delete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Book deleted successfully.',
    });
});

module.exports = {
    createBook,
    getAllBooks,
    searchBooks,
    getBookById,
    updateBook,
    deleteBook,
};
