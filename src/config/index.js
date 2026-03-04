/**
 * Application Configuration
 * Centralizes all environment variables and default settings.
 */

require('dotenv').config();

const config = {
    // Server settings
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database settings
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'library_db',
        waitForConnections: true,
        connectionLimit: 10,      // Pool size for scalability
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    },

    // JWT Authentication
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // Pagination
    itemsPerPage: parseInt(process.env.ITEMS_PER_PAGE, 10) || 10,

    // Borrowing defaults
    defaultBorrowDays: parseInt(process.env.DEFAULT_BORROW_DAYS, 10) || 14,
};

module.exports = config;
