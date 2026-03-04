/**
 * Simple file-based logger.
 *
 * - error()  → logs to  logs/error.log   (errors + stack traces)
 * - info()   → logs to  logs/combined.log
 * - warn()   → logs to  logs/combined.log
 *
 * Each line is a JSON object:
 *   { "timestamp": "...", "level": "error", "message": "...", "stack": "..." }
 *
 * The logger is synchronous-on-open (append stream) so it never blocks the
 * event loop for normal request traffic, yet every entry is flushed to disk.
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../logs');

// Ensure the directory exists at module-load time (safe for test environments)
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const errorStream = fs.createWriteStream(path.join(LOG_DIR, 'error.log'), { flags: 'a' });
const combinedStream = fs.createWriteStream(path.join(LOG_DIR, 'combined.log'), { flags: 'a' });

/**
 * Write a structured log entry to a stream.
 * @param {fs.WriteStream} stream
 * @param {'error'|'warn'|'info'} level
 * @param {string} message
 * @param {object} [extra]  Any additional fields (e.g. stack, meta)
 */
function write(stream, level, message, extra = {}) {
    const entry = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...extra,
    });
    stream.write(entry + '\n');
}

const logger = {
    /**
     * Log an error – written to both error.log and combined.log.
     * @param {string} message
     * @param {{ stack?: string, [key: string]: any }} [meta]
     */
    error(message, meta = {}) {
        write(errorStream, 'error', message, meta);
        write(combinedStream, 'error', message, meta);
    },

    /**
     * Log a warning – written to combined.log only.
     * @param {string} message
     * @param {object} [meta]
     */
    warn(message, meta = {}) {
        write(combinedStream, 'warn', message, meta);
    },

    /**
     * Log an informational message – written to combined.log only.
     * @param {string} message
     * @param {object} [meta]
     */
    info(message, meta = {}) {
        write(combinedStream, 'info', message, meta);
    },
};

module.exports = logger;
