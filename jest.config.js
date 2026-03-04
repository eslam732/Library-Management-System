const path = require('path');

module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
    rootDir: '.',
    moduleDirectories: ['node_modules'],
    // Map the database connection module to a manual mock
    moduleNameMapper: {
        '^(.*[\\\\/])database[\\\\/]connection$': path.resolve(__dirname, 'tests', '__mocks__', 'connection.js'),
    },
};
