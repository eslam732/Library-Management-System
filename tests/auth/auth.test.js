/**
 * Auth Module Unit Tests
 * Tests registration/login validation schemas and JWT middleware.
 */

const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../../src/modules/auth/auth.validation');
const { authenticate, authorize } = require('../../src/middleware/auth');
const config = require('../../src/config');

// ── Validation Tests ───────────────────────────────────────────────

describe('Auth Validation Schemas', () => {
    describe('registerSchema', () => {
        const validUser = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        test('should validate a correct registration object', () => {
            const { error } = registerSchema.validate(validUser);
            expect(error).toBeUndefined();
        });

        test('should reject when name is missing', () => {
            const { error } = registerSchema.validate({ ...validUser, name: '' });
            expect(error).toBeDefined();
        });

        test('should reject when email is invalid', () => {
            const { error } = registerSchema.validate({ ...validUser, email: 'not-an-email' });
            expect(error).toBeDefined();
        });

        test('should reject when email is missing', () => {
            const { error } = registerSchema.validate({ ...validUser, email: undefined });
            expect(error).toBeDefined();
        });

        test('should reject when password is too short', () => {
            const { error } = registerSchema.validate({ ...validUser, password: '12345' });
            expect(error).toBeDefined();
        });

        test('should reject when password is missing', () => {
            const { error } = registerSchema.validate({ ...validUser, password: undefined });
            expect(error).toBeDefined();
        });

        test('should accept a 6-character password', () => {
            const { error } = registerSchema.validate({ ...validUser, password: '123456' });
            expect(error).toBeUndefined();
        });
    });

    describe('loginSchema', () => {
        test('should validate a correct login object', () => {
            const { error } = loginSchema.validate({ email: 'john@example.com', password: 'password123' });
            expect(error).toBeUndefined();
        });

        test('should reject when email is missing', () => {
            const { error } = loginSchema.validate({ password: 'password123' });
            expect(error).toBeDefined();
        });

        test('should reject when password is missing', () => {
            const { error } = loginSchema.validate({ email: 'john@example.com' });
            expect(error).toBeDefined();
        });

        test('should reject when email is invalid', () => {
            const { error } = loginSchema.validate({ email: 'bad', password: 'password123' });
            expect(error).toBeDefined();
        });
    });
});

// ── Middleware Tests ────────────────────────────────────────────────

describe('Auth Middleware', () => {
    describe('authenticate', () => {
        const mockNext = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should call next with error when no Authorization header', () => {
            const req = { headers: {} };
            authenticate(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        test('should call next with error for non-Bearer token', () => {
            const req = { headers: { authorization: 'Basic abc123' } };
            authenticate(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        test('should call next with error for invalid token', () => {
            const req = { headers: { authorization: 'Bearer invalidtoken' } };
            authenticate(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        test('should attach user to req and call next for valid token', () => {
            const payload = { id: 1, email: 'admin@test.com', role: 'admin' };
            const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
            const req = { headers: { authorization: `Bearer ${token}` } };

            authenticate(req, {}, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(1);
            expect(req.user.email).toBe('admin@test.com');
            expect(req.user.role).toBe('admin');
        });

        test('should call next with error for expired token', () => {
            const token = jwt.sign({ id: 1 }, config.jwt.secret, { expiresIn: '0s' });
            const req = { headers: { authorization: `Bearer ${token}` } };

            // Wait a moment to ensure token is expired
            setTimeout(() => {
                authenticate(req, {}, mockNext);
                expect(mockNext).toHaveBeenCalledWith(
                    expect.objectContaining({ statusCode: 401 })
                );
            }, 100);
        });
    });

    describe('authorize', () => {
        const mockNext = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should call next when user has correct role', () => {
            const req = { user: { id: 1, role: 'admin' } };
            authorize('admin')(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should call next with 403 when user has wrong role', () => {
            const req = { user: { id: 1, role: 'user' } };
            authorize('admin')(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 403 })
            );
        });

        test('should call next with 401 when no user on request', () => {
            const req = {};
            authorize('admin')(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        test('should allow any of multiple roles', () => {
            const req = { user: { id: 1, role: 'user' } };
            authorize('admin', 'user')(req, {}, mockNext);
            expect(mockNext).toHaveBeenCalledWith();
        });
    });
});
