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
const { NotFound } = require('./utils/errors');

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

// ── Protected API Routes (JWT required) ───────────────────────────

app.use('/api/books', authenticate, bookRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/borrowings', authenticate, borrowingRoutes);

// ── 404 Handler ────────────────────────────────────────────────────

app.use((_req, _res, next) => {
    next(new NotFound('The requested resource was not found.'));
});

// ── Global Error Handler ───────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
