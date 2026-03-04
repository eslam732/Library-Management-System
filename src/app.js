/**
 * Express Application Setup
 * Configures middleware, routes, and error handling.
 * Exported separately from server for testing purposes.
 */

const express = require('express');
const helmet = require('helmet');
const { generalRateLimiter } = require('./middleware/rateLimiter');
const { authenticate } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const bookRoutes = require('./modules/books/book.routes');
const userRoutes = require('./modules/users/user.routes');
const borrowingRoutes = require('./modules/borrowings/borrowing.routes');

const app = express();

// ── Global Middleware ──────────────────────────────────────────────

// Security headers
app.use(helmet());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// General rate limiting
app.use(generalRateLimiter);

// ── Public Routes (no authentication required) ────────────────────

// Auth routes (register, login)
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── JWT Authentication for all /api routes below ──────────────────

app.use('/api', authenticate);

// ── Protected API Routes ───────────────────────────────────────────

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrowings', borrowingRoutes);

// ── 404 Handler ────────────────────────────────────────────────────

app.use((_req, _res, next) => {
    next(new AppError('The requested resource was not found.', 404));
});

// ── Global Error Handler ───────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
