/**
 * Borrowing Repository
 * Encapsulates all raw SQL database operations for the borrowings table.
 */

const db = require('../../database/connection');

const BorrowingRepository = {
    /**
     * Insert a new borrowing record.
     * @param {Object} data - { book_id, user_id, due_date }
     * @returns {Promise<number>} The inserted row ID
     */
    async insert({ book_id, user_id, due_date }) {
        const sql = `
            INSERT INTO borrowings (book_id, user_id, checkout_date, due_date)
            VALUES (?, ?, CURDATE(), ?)
        `;
        const [result] = await db.execute(sql, [book_id, user_id, due_date]);
        return result.insertId;
    },

    /**
     * Find a borrowing record by ID (with book and user details).
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const sql = `
            SELECT 
                br.id, br.checkout_date, br.due_date, br.return_date,
                br.book_id, b.title AS book_title, b.isbn AS book_isbn,
                br.user_id, u.name AS user_name, u.email AS user_email
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            WHERE br.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    /**
     * Check if a user currently has a specific book checked out (not returned).
     * @param {number} bookId
     * @param {number} userId
     * @returns {Promise<Object|null>}
     */
    async findActiveBorrowing(bookId, userId) {
        const sql = `
            SELECT * FROM borrowings
            WHERE book_id = ? AND user_id = ? AND return_date IS NULL
        `;
        const [rows] = await db.execute(sql, [bookId, userId]);
        return rows[0] || null;
    },

    /**
     * Count how many copies of a book are currently checked out (not returned).
     * @param {number} bookId
     * @returns {Promise<number>}
     */
    async countActiveForBook(bookId) {
        const sql = `
            SELECT COUNT(*) as total FROM borrowings
            WHERE book_id = ? AND return_date IS NULL
        `;
        const [rows] = await db.execute(sql, [bookId]);
        return rows[0].total;
    },

    /**
     * Mark a borrowing as returned.
     * @param {number} id
     * @returns {Promise<void>}
     */
    async markReturned(id) {
        const sql = `UPDATE borrowings SET return_date = CURDATE() WHERE id = ?`;
        await db.execute(sql, [id]);
    },

    /**
     * Get all books currently checked out by a user.
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    async findBooksByUser(userId) {
        const sql = `
            SELECT 
                br.id AS borrowing_id, br.checkout_date, br.due_date,
                b.id AS book_id, b.title, b.author, b.isbn, b.shelf_location
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = ? AND br.return_date IS NULL
            ORDER BY br.due_date ASC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    },

    /**
     * Get all overdue books (due date has passed, not yet returned).
     * @returns {Promise<Array>}
     */
    async findOverdue() {
        const sql = `
            SELECT 
                br.id AS borrowing_id, br.checkout_date, br.due_date,
                DATEDIFF(CURDATE(), br.due_date) AS days_overdue,
                b.id AS book_id, b.title AS book_title, b.isbn,
                u.id AS user_id, u.name AS user_name, u.email AS user_email
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            WHERE br.return_date IS NULL AND br.due_date < CURDATE()
            ORDER BY br.due_date ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Get overdue borrowings from the last month.
     * @returns {Promise<Array>}
     */
    async findOverdueLastMonth() {
        const sql = `
            SELECT 
                br.id AS borrowing_id, br.checkout_date, br.due_date, br.return_date,
                DATEDIFF(COALESCE(br.return_date, CURDATE()), br.due_date) AS days_overdue,
                b.id AS book_id, b.title AS book_title, b.author, b.isbn,
                u.id AS user_id, u.name AS user_name, u.email AS user_email
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            WHERE br.due_date < COALESCE(br.return_date, CURDATE())
              AND br.due_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            ORDER BY br.due_date ASC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Get all borrowing processes from the last month.
     * @returns {Promise<Array>}
     */
    async findBorrowingsLastMonth() {
        const sql = `
            SELECT 
                br.id AS borrowing_id, br.checkout_date, br.due_date, br.return_date,
                b.id AS book_id, b.title AS book_title, b.author, b.isbn,
                u.id AS user_id, u.name AS user_name, u.email AS user_email
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            WHERE br.checkout_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            ORDER BY br.checkout_date DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * Get analytics summary for a date range.
     * @param {string} startDate
     * @param {string} endDate
     * @returns {Promise<Object>} { total_borrowings, total_returned, total_active, total_overdue }
     */
    async getAnalyticsSummary(startDate, endDate) {
        const sql = `
            SELECT 
                COUNT(*) AS total_borrowings,
                SUM(CASE WHEN return_date IS NOT NULL THEN 1 ELSE 0 END) AS total_returned,
                SUM(CASE WHEN return_date IS NULL THEN 1 ELSE 0 END) AS total_active,
                SUM(CASE WHEN return_date IS NULL AND due_date < CURDATE() THEN 1 ELSE 0 END) AS total_overdue
            FROM borrowings
            WHERE checkout_date BETWEEN ? AND ?
        `;
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows[0];
    },

    /**
     * Get analytics details for a date range.
     * @param {string} startDate
     * @param {string} endDate
     * @returns {Promise<Array>}
     */
    async getAnalyticsDetails(startDate, endDate) {
        const sql = `
            SELECT 
                br.id AS borrowing_id, br.checkout_date, br.due_date, br.return_date,
                b.title AS book_title, b.isbn,
                u.name AS user_name, u.email AS user_email
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            JOIN users u ON br.user_id = u.id
            WHERE br.checkout_date BETWEEN ? AND ?
            ORDER BY br.checkout_date DESC
        `;
        const [rows] = await db.execute(sql, [startDate, endDate]);
        return rows;
    },
};

module.exports = BorrowingRepository;
