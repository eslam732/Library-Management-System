/**
 * Server Entry Point
 * Starts the Express server and connects to the database.
 */

const app = require('./app');
const config = require('./config');

// The database connection is established when the pool module is first imported
require('./database/connection');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Library Management System running on port ${PORT}`);
    console.log(`📚 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});
