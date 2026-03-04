/**
 * Mock database connection for tests.
 * All db.execute calls are mocked with jest.fn().
 */

const db = {
    execute: jest.fn(),
    getConnection: jest.fn().mockResolvedValue({ release: jest.fn() }),
};

module.exports = db;
