/**
 * User Repository
 * Encapsulates all raw SQL database operations for the users table.
 */

const db = require('../../database/connection');

const UserRepository = {
    /**
     * Insert a new user row.
     * @param {Object} data - { name, email, password, role? }
     * @returns {Promise<number>} The inserted row ID
     */
    async insert({ name, email, password, role = 'user' }) {
        const sql = `
            INSERT INTO users (name, email, password, role, registered_date)
            VALUES (?, ?, ?, ?, CURDATE())
        `;
        const [result] = await db.execute(sql, [name, email, password, role]);
        return result.insertId;
    },

    /**
     * Find a user by ID (excludes password).
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const sql = 'SELECT id, name, email, role, registered_date, created_at, updated_at FROM users WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    /**
     * Find a user by email (excludes password).
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        const sql = 'SELECT id, name, email, role, registered_date, created_at, updated_at FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0] || null;
    },

    /**
     * Find a user by email INCLUDING password (for login comparison).
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async findByEmailWithPassword(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(sql, [email]);
        return rows[0] || null;
    },

    /**
     * Count total users.
     * @returns {Promise<number>}
     */
    async count() {
        const sql = 'SELECT COUNT(*) as total FROM users';
        const [rows] = await db.execute(sql);
        return rows[0].total;
    },

    /**
     * Fetch paginated users (excludes password).
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Array>}
     */
    async findPaginated(limit, offset) {
        const sql = 'SELECT id, name, email, role, registered_date, created_at, updated_at FROM users ORDER BY registered_date DESC LIMIT ? OFFSET ?';
        const [rows] = await db.execute(sql, [limit, offset]);
        return rows;
    },

    /**
     * Update specified fields of a user.
     * @param {number} id
     * @param {Array<string>} fields - e.g. ['name = ?', 'email = ?']
     * @param {Array<*>} params - Values for each field
     * @returns {Promise<void>}
     */
    async update(id, fields, params) {
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await db.execute(sql, [...params, id]);
    },

    /**
     * Delete a user by ID.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    },
};

module.exports = UserRepository;
