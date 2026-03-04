/**
 * Auth Routes
 * Public routes - no authentication required.
 *
 * POST /api/auth/register        - Register a new user (role: 'user')
 * POST /api/auth/login           - Log in and receive a JWT token
 * POST /api/auth/register-admin  - Register an admin (requires "admin-pass" header)
 */

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.validation');

// Register a new user
router.post('/register', validate(registerSchema), authController.register);

// Log in
router.post('/login', validate(loginSchema), authController.login);

// Register an admin — guarded by SUPERADMINPASS in the "admin-pass" header
router.post('/register-admin', validate(registerSchema), authController.registerAdmin);

module.exports = router;
