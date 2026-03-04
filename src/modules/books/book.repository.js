/**
 * Book Repository
 * Encapsulates all raw SQL database operations for the books table.
 * The model layer should call these methods instead of writing SQL directly.
 */

const db = require('../../database/connection');

const BookRepository = {
    /**
     * Insert a new book row.
     * @param {Object} data - { title, author, isbn, quantity, shelf_location }
     * @returns {Promise<number>} The inserted row ID
     */
    async insert({ title, author, isbn, quantity, shelf_location }) {
        const sql = `
            INSERT INTO books (title, author, isbn, quantity, available_quantity, shelf_location)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [title, author, isbn, quantity, quantity, shelf_location]);
        return result.insertId;
    },

    /**
     * Find a book by its ID.
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const sql = 'SELECT * FROM books WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    /**
     * Find a book by its ISBN.
     * @param {string} isbn
     * @returns {Promise<Object|null>}
     */
    async findByISBN(isbn) {
        const sql = 'SELECT * FROM books WHERE isbn = ?';
        const [rows] = await db.execute(sql, [isbn]);
        return rows[0] || null;
    },

    /**
     * Count total books.
     * @returns {Promise<number>}
     */
    async count() {
        const sql = 'SELECT COUNT(*) as total FROM books';
        const [rows] = await db.execute(sql);
        return rows[0].total;
    },

    /**
     * Fetch paginated books ordered by created_at DESC.
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Array>}
     */
    async findPaginated(limit, offset) {
        const sql = 'SELECT * FROM books ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const [rows] = await db.execute(sql, [limit, offset]);
        return rows;
    },

    /**
     * Search books by dynamic conditions (title, author, isbn) using LIKE.
     * @param {Array<string>} conditions - SQL WHERE fragments
     * @param {Array<string>} params - Bound parameters
     * @returns {Promise<Array>}
     */
    async search(conditions, params) {
        const sql = `SELECT * FROM books WHERE ${conditions.join(' OR ')} ORDER BY title ASC`;
        const [rows] = await db.execute(sql, params);
        return rows;
    },

    /**
     * Update specified fields of a book.
     * @param {number} id
     * @param {Array<string>} fields - e.g. ['title = ?', 'author = ?']
     * @param {Array<*>} params - Values for each field + the id at the end
     * @returns {Promise<void>}
     */
    async update(id, fields, params) {
        const sql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
        await db.execute(sql, [...params, id]);
    },

    /**
     * Delete a book by ID.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const sql = 'DELETE FROM books WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Atomically decrement available_quantity (only if > 0).
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async decrementAvailable(id) {
        const sql = 'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ? AND available_quantity > 0';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Atomically increment available_quantity (only if < quantity).
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async incrementAvailable(id) {
        const sql = 'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ? AND available_quantity < quantity';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    },
};

module.exports = BookRepository;
