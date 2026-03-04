/**
 * Auth Controller
 * Handles user registration and login with JWT tokens.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../users/user.model');
const { NotAllowed, ConflictError } = require('../../utils/errors');
const asyncHandler = require('../../utils/asyncHandler');
const config = require('../../config');

/**
 * Generate a JWT token for the given user.
 * @param {Object} user - { id, email, role }
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

/**
 * POST /api/auth/register
 * Register a new user (default role: 'user').
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await UserModel.findByEmail(email);
    if (existing) {
        throw new ConflictError('A user with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await UserModel.create({ name, email, password: hashedPassword });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                registered_date: user.registered_date,
            },
            token,
        },
    });
});

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT token.
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email (including password for comparison)
    const user = await UserModel.findByEmailWithPassword(email);
    if (!user) {
        throw new NotAllowed('Invalid email or password.');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new NotAllowed('Invalid email or password.');
    }

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        },
    });
});

/**
 * POST /api/auth/register-admin
 * Register a new admin user.
 * Requires the "admin-pass" request header to match SUPERADMINPASS in .env.
 * This endpoint is intentionally NOT protected by JWT — it is guarded
 * solely by the shared secret so a first admin can be created.
 */
const registerAdmin = asyncHandler(async (req, res) => {
    // Verify super-admin password from header
    const provided = req.headers['admin-pass'];

    if (!config.superAdminPass) {
        throw new Error('SUPERADMINPASS is not configured on this server.');
    }

    if (!provided || provided !== config.superAdminPass) {
        throw new NotAllowed('Invalid or missing admin-pass header.');
    }

    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await UserModel.findByEmail(email);
    if (existing) {
        throw new ConflictError('A user with this email already exists.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user with role = 'admin'
    const user = await UserModel.create({ name, email, password: hashedPassword, role: 'admin' });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
        success: true,
        message: 'Admin registered successfully.',
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                registered_date: user.registered_date,
            },
            token,
        },
    });
});

module.exports = { register, login, registerAdmin };

