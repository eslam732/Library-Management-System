/**
 * User Routes
 * Defines RESTful endpoints for user operations.
 *
 * GET    /api/users          - List all users (admin only)
 * GET    /api/users/me       - Get own profile (any authenticated user)
 * GET    /api/users/:id      - Get a single user (admin only)
 * PUT    /api/users/me       - Update own profile (any authenticated user)
 * PUT    /api/users/:id      - Update a user (admin only)
 * DELETE /api/users/:id      - Delete a user (admin only)
 */

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const validate = require('../../middleware/validate');
const { authorize } = require('../../middleware/auth');
const { updateUserSchema } = require('./user.validation');

// Get own profile (any authenticated user)
router.get('/me', userController.getMe);

// Update own profile (any authenticated user)
router.put('/me', validate(updateUserSchema), userController.updateMe);

// List all users (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);

// Get a single user by ID (admin only)
router.get('/:id', authorize('admin'), userController.getUserById);

// Update a user (admin only)
router.put('/:id', authorize('admin'), validate(updateUserSchema), userController.updateUser);

// Delete a user (admin only)
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
