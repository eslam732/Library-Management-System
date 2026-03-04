/**
 * Auth Controller
 * Handles user registration and login with JWT tokens.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../users/user.model');
const AppError = require('../../utils/AppError');
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
        throw new AppError('A user with this email already exists.', 409);
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
        throw new AppError('Invalid email or password.', 401);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Invalid email or password.', 401);
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

module.exports = { register, login };
