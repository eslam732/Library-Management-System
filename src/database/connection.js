/**
 * Database Connection Pool
 * Uses mysql2/promise for async/await support.
 * A connection pool is used for better performance and scalability.
 */

const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.db);

// Test the connection on startup
pool.getConnection()
    .then((connection) => {
        console.log('✅ Database connected successfully.');
        connection.release();
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
