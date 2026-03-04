/**
 * Borrowing Routes
 * Defines RESTful endpoints for borrowing operations.
 * User operations use JWT for identification (req.user.id).
 *
 * POST   /api/borrowings/checkout                     - Check out a book (any authenticated user)
 * POST   /api/borrowings/return                       - Return a book (any authenticated user)
 * GET    /api/borrowings/my-books                     - Books checked out by the authenticated user
 * GET    /api/borrowings/overdue                      - List all overdue books (admin only)
 * GET    /api/borrowings/analytics                    - Analytics report (admin only)
 * GET    /api/borrowings/export/overdue-last-month    - Export overdue borrows (admin only)
 * GET    /api/borrowings/export/borrowings-last-month - Export all borrows (admin only)
 */

const express = require('express');
const router = express.Router();
const borrowingController = require('./borrowing.controller');
const validate = require('../../middleware/validate');
const { authorize } = require('../../middleware/auth');
const {
    checkoutSchema,
    returnSchema,
    analyticsQuerySchema,
    exportQuerySchema,
} = require('./borrowing.validation');
const { borrowingRateLimiter } = require('../../middleware/rateLimiter');

// Check out a book (any authenticated user, rate limited)
router.post('/checkout', borrowingRateLimiter, validate(checkoutSchema), borrowingController.checkout);

// Return a book (any authenticated user, rate limited)
router.post('/return', borrowingRateLimiter, validate(returnSchema), borrowingController.returnBook);

// Get books currently checked out by the authenticated user
router.get('/my-books', borrowingController.getMyBooks);

// List all overdue books (admin only)
router.get('/overdue', authorize('admin'), borrowingController.getOverdueBooks);

// Analytics report for a specific period (admin only)
router.get('/analytics', authorize('admin'), validate(analyticsQuerySchema, 'query'), borrowingController.getAnalytics);

// Export overdue borrows of the last month (admin only)
router.get(
    '/export/overdue-last-month',
    authorize('admin'),
    validate(exportQuerySchema, 'query'),
    borrowingController.exportOverdueLastMonth
);

// Export all borrowing processes of the last month (admin only)
router.get(
    '/export/borrowings-last-month',
    authorize('admin'),
    validate(exportQuerySchema, 'query'),
    borrowingController.exportBorrowingsLastMonth
);

module.exports = router;
