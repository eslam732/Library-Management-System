/**
 * Borrowing Controller
 * Handles HTTP request/response logic for borrowing operations.
 * Uses req.user.id from JWT — users can only manage their own borrowings.
 * Admins can view all overdue books, analytics, and exports.
 */

const BorrowingModel = require('./borrowing.model');
const BookModel = require('../books/book.model');
const UserModel = require('../users/user.model');
const AppError = require('../../utils/AppError');
const asyncHandler = require('../../utils/asyncHandler');
const { exportCSV, exportXLSX } = require('../../utils/exportHelper');
const config = require('../../config');

/**
 * POST /api/borrowings/checkout
 * The authenticated user checks out a book.
 * The user_id comes from JWT, not from the request body.
 */
const checkout = asyncHandler(async (req, res) => {
    const { book_id, due_date } = req.body;
    const user_id = req.user.id;

    // Validate book exists
    const book = await BookModel.findById(book_id);
    if (!book) {
        throw new AppError('Book not found.', 404);
    }

    // Check if book is available
    if (book.available_quantity <= 0) {
        throw new AppError('No copies of this book are currently available.', 400);
    }

    // Check if user already has this book checked out
    const activeBorrowing = await BorrowingModel.findActiveBorrowing(book_id, user_id);
    if (activeBorrowing) {
        throw new AppError('You already have this book checked out.', 400);
    }

    // Calculate due date (default: 14 days from now)
    const calculatedDueDate = due_date || new Date(
        Date.now() + config.defaultBorrowDays * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    // Decrement available quantity
    const decremented = await BookModel.decrementAvailable(book_id);
    if (!decremented) {
        throw new AppError('Failed to checkout book. No available copies.', 400);
    }

    // Create borrowing record
    const borrowing = await BorrowingModel.create({
        book_id,
        user_id,
        due_date: calculatedDueDate,
    });

    res.status(201).json({
        success: true,
        message: 'Book checked out successfully.',
        data: borrowing,
    });
});

/**
 * POST /api/borrowings/return
 * The authenticated user returns a book.
 * The user_id comes from JWT, not from the request body.
 */
const returnBook = asyncHandler(async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;

    // Find the active borrowing record for this user
    const activeBorrowing = await BorrowingModel.findActiveBorrowing(book_id, user_id);
    if (!activeBorrowing) {
        throw new AppError('No active borrowing record found for this book.', 404);
    }

    // Mark as returned
    const updatedBorrowing = await BorrowingModel.returnBook(activeBorrowing.id);

    // Increment available quantity
    await BookModel.incrementAvailable(book_id);

    res.status(200).json({
        success: true,
        message: 'Book returned successfully.',
        data: updatedBorrowing,
    });
});

/**
 * GET /api/borrowings/my-books
 * Get all books currently checked out by the authenticated user.
 */
const getMyBooks = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
        throw new AppError('User not found.', 404);
    }

    const books = await BorrowingModel.getBooksByUser(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: { id: user.id, name: user.name, email: user.email },
            checked_out_books: books,
            count: books.length,
        },
    });
});

/**
 * GET /api/borrowings/overdue
 * List all overdue books (admin only).
 */
const getOverdueBooks = asyncHandler(async (_req, res) => {
    const overdueBooks = await BorrowingModel.getOverdueBooks();

    res.status(200).json({
        success: true,
        data: overdueBooks,
        count: overdueBooks.length,
    });
});

/**
 * GET /api/borrowings/analytics?start_date=...&end_date=...&format=json|csv|xlsx
 * Get analytical reports for borrowing in a specific period (admin only).
 */
const getAnalytics = asyncHandler(async (req, res) => {
    const { start_date, end_date, format } = req.query;

    const analytics = await BorrowingModel.getAnalytics(start_date, end_date);

    if (format === 'csv') {
        return exportCSV(res, analytics.details, `borrowing-report-${start_date}-to-${end_date}`);
    }

    if (format === 'xlsx') {
        return exportXLSX(res, analytics.details, `borrowing-report-${start_date}-to-${end_date}`);
    }

    res.status(200).json({
        success: true,
        data: analytics,
    });
});

/**
 * GET /api/borrowings/export/overdue-last-month?format=csv|xlsx
 * Export all overdue borrows of the last month (admin only).
 */
const exportOverdueLastMonth = asyncHandler(async (req, res) => {
    const format = req.query.format || 'csv';
    const data = await BorrowingModel.getOverdueLastMonth();

    if (format === 'xlsx') {
        return exportXLSX(res, data, 'overdue-last-month');
    }

    return exportCSV(res, data, 'overdue-last-month');
});

/**
 * GET /api/borrowings/export/borrowings-last-month?format=csv|xlsx
 * Export all borrowing processes of the last month (admin only).
 */
const exportBorrowingsLastMonth = asyncHandler(async (req, res) => {
    const format = req.query.format || 'csv';
    const data = await BorrowingModel.getBorrowingsLastMonth();

    if (format === 'xlsx') {
        return exportXLSX(res, data, 'borrowings-last-month');
    }

    return exportCSV(res, data, 'borrowings-last-month');
});

module.exports = {
    checkout,
    returnBook,
    getMyBooks,
    getOverdueBooks,
    getAnalytics,
    exportOverdueLastMonth,
    exportBorrowingsLastMonth,
};
