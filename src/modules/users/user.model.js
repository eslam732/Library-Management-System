/**
 * User Model
 * Contains business logic for user operations.
 * Delegates all database queries to the repository layer.
 * Never exposes password in responses.
 */

const UserRepository = require('./user.repository');

const UserModel = {
    /**
     * Create a new user.
     * @param {Object} data - { name, email, password, role? }
     * @returns {Promise<Object>} The created user (without password)
     */
    async create({ name, email, password, role }) {
        const id = await UserRepository.insert({ name, email, password, role });
        return UserRepository.findById(id);
    },

    /**
     * Find a user by ID (excludes password).
     * @param {number} id
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        return UserRepository.findById(id);
    },

    /**
     * Find a user by email (excludes password).
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async findByEmail(email) {
        return UserRepository.findByEmail(email);
    },

    /**
     * Find a user by email INCLUDING password (for login).
     * @param {string} email
     * @returns {Promise<Object|null>}
     */
    async findByEmailWithPassword(email) {
        return UserRepository.findByEmailWithPassword(email);
    },

    /**
     * List all users with pagination (excludes password).
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<{ users: Array, total: number }>}
     */
    async findAll(limit, offset) {
        const [total, users] = await Promise.all([
            UserRepository.count(),
            UserRepository.findPaginated(limit, offset),
        ]);
        return { users, total };
    },

    /**
     * Update a user's details.
     * @param {number} id
     * @param {Object} updates - { name, email }
     * @returns {Promise<Object|null>}
     */
    async update(id, updates) {
        const allowedFields = ['name', 'email'];
        const fields = [];
        const params = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (fields.length === 0) return UserRepository.findById(id);

        await UserRepository.update(id, fields, params);
        return UserRepository.findById(id);
    },

    /**
     * Delete a user by ID.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        return UserRepository.delete(id);
    },
};

module.exports = UserModel;
