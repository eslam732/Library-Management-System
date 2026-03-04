/**
 * Auth Routes
 * Public routes - no authentication required.
 *
 * POST /api/auth/register  - Register a new user
 * POST /api/auth/login     - Log in and receive a JWT token
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

module.exports = router;
