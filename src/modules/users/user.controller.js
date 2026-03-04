/**
 * User Controller
 * Handles HTTP request/response logic for user operations.
 * Users can only view/update/delete their own profile.
 * Admins can manage all users.
 */

const UserModel = require('./user.model');
const { NotFound, BadRequest, ConflictError } = require('../../utils/errors');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');

/**
 * GET /api/users
 * List all users with pagination (admin only).
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const limit = config.itemsPerPage;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;

    const { users, total } = await UserModel.findAll(limit, offset);

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

/**
 * GET /api/users/me
 * Get the authenticated user's own profile.
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
        throw new NotFound('User not found.');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * GET /api/users/:id
 * Get a single user by ID (admin only).
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
        throw new NotFound('User not found.');
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * PUT /api/users/me
 * Update the authenticated user's own profile.
 */
const updateMe = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
        throw new NotFound('User not found.');
    }

    // If email is being changed, check for duplicates
    if (req.body.email && req.body.email !== user.email) {
        const existing = await UserModel.findByEmail(req.body.email);
        if (existing) {
            throw new ConflictError('A user with this email already exists.');
        }
    }

    const updatedUser = await UserModel.update(req.user.id, req.body);

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUser,
    });
});

/**
 * PUT /api/users/:id
 * Update a user's details (admin only).
 */
const updateUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
        throw new NotFound('User not found.');
    }

    if (req.body.email && req.body.email !== user.email) {
        const existing = await UserModel.findByEmail(req.body.email);
        if (existing) {
            throw new ConflictError('A user with this email already exists.');
        }
    }

    const updatedUser = await UserModel.update(req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: updatedUser,
    });
});

/**
 * DELETE /api/users/:id
 * Delete a user (admin only).
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
        throw new NotFound('User not found.');
    }

    try {
        await UserModel.delete(req.params.id);
    } catch (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new BadRequest('Cannot delete this user because they have borrowing records.');
        }
        throw err;
    }

    res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
    });
});

module.exports = {
    getAllUsers,
    getMe,
    getUserById,
    updateMe,
    updateUser,
    deleteUser,
};
