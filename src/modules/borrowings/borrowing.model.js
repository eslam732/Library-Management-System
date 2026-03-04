/**
 * Borrowing Model
 * Contains business logic for borrowing operations.
 * Delegates all database queries to the repository layer.
 */

const BorrowingRepository = require('./borrowing.repository');

const BorrowingModel = {
    /**
     * Create a new borrowing record (checkout).
     * @param {Object} data - { book_id, user_id, due_date }
     * @returns {Promise<Object>}
     */
    async create({ book_id, user_id, due_date }) {
        const id = await BorrowingRepository.insert({ book_id, user_id, due_date });
        return BorrowingRepository.findById(id);
    },

    /**
     * Find a borrowing record by ID.
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        return BorrowingRepository.findById(id);
    },

    /**
     * Check if a user currently has a specific book checked out.
     * @param {number} bookId
     * @param {number} userId
     * @returns {Promise<Object|null>}
     */
    async findActiveBorrowing(bookId, userId) {
        return BorrowingRepository.findActiveBorrowing(bookId, userId);
    },

    /**
     * Count all active (unreturned) borrowings for a specific book.
     * @param {number} bookId
     * @returns {Promise<number>}
     */
    async countActiveForBook(bookId) {
        return BorrowingRepository.countActiveForBook(bookId);
    },

    /**
     * Mark a borrowing as returned.
     * @param {number} id
     * @returns {Promise<Object>}
     */
    async returnBook(id) {
        await BorrowingRepository.markReturned(id);
        return BorrowingRepository.findById(id);
    },

    /**
     * Get all books currently checked out by a user.
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    async getBooksByUser(userId) {
        return BorrowingRepository.findBooksByUser(userId);
    },

    /**
     * Get all overdue books.
     * @returns {Promise<Array>}
     */
    async getOverdueBooks() {
        return BorrowingRepository.findOverdue();
    },

    /**
     * Get overdue borrowings from the last month.
     * @returns {Promise<Array>}
     */
    async getOverdueLastMonth() {
        return BorrowingRepository.findOverdueLastMonth();
    },

    /**
     * Get all borrowing processes from the last month.
     * @returns {Promise<Array>}
     */
    async getBorrowingsLastMonth() {
        return BorrowingRepository.findBorrowingsLastMonth();
    },

    /**
     * Get analytical reports for a specific period.
     * @param {string} startDate
     * @param {string} endDate
     * @returns {Promise<Object>}
     */
    async getAnalytics(startDate, endDate) {
        const [summary, details] = await Promise.all([
            BorrowingRepository.getAnalyticsSummary(startDate, endDate),
            BorrowingRepository.getAnalyticsDetails(startDate, endDate),
        ]);
        return { summary, details };
    },
};

module.exports = BorrowingModel;
