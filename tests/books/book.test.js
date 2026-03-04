/**
 * Book Module Unit Tests
 * Tests validation schemas and the book model (which uses the repository layer).
 * The repository calls db.execute, which is automatically mocked via jest.config.js moduleNameMapper.
 */

// The database connection is automatically mocked via jest.config.js moduleNameMapper

const BookModel = require('../../src/modules/books/book.model');
const BookRepository = require('../../src/modules/books/book.repository');
const { createBookSchema, updateBookSchema, searchBookSchema } = require('../../src/modules/books/book.validation');
const db = require('../../tests/__mocks__/connection');

// ── Validation Tests ───────────────────────────────────────────────

describe('Book Validation Schemas', () => {
    describe('createBookSchema', () => {
        const validBook = {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '9780743273565',
            quantity: 5,
            shelf_location: 'A1-01',
        };

        test('should validate a correct book object', () => {
            const { error } = createBookSchema.validate(validBook);
            expect(error).toBeUndefined();
        });

        test('should reject when title is missing', () => {
            const { error } = createBookSchema.validate({ ...validBook, title: '' });
            expect(error).toBeDefined();
        });

        test('should reject when author is missing', () => {
            const { error } = createBookSchema.validate({ ...validBook, author: undefined });
            expect(error).toBeDefined();
        });

        test('should reject an invalid ISBN', () => {
            const { error } = createBookSchema.validate({ ...validBook, isbn: 'invalid-isbn' });
            expect(error).toBeDefined();
        });

        test('should accept ISBN-10 format', () => {
            const { error } = createBookSchema.validate({ ...validBook, isbn: '0743273567' });
            expect(error).toBeUndefined();
        });

        test('should accept ISBN-13 with hyphens', () => {
            const { error } = createBookSchema.validate({ ...validBook, isbn: '978-0-7432-7356-5' });
            expect(error).toBeUndefined();
        });

        test('should reject negative quantity', () => {
            const { error } = createBookSchema.validate({ ...validBook, quantity: -1 });
            expect(error).toBeDefined();
        });

        test('should reject when shelf_location is missing', () => {
            const { error } = createBookSchema.validate({ ...validBook, shelf_location: '' });
            expect(error).toBeDefined();
        });

        test('should strip unknown fields', () => {
            const { value } = createBookSchema.validate(
                { ...validBook, unknownField: 'test' },
                { stripUnknown: true }
            );
            expect(value.unknownField).toBeUndefined();
        });
    });

    describe('updateBookSchema', () => {
        test('should validate a partial update', () => {
            const { error } = updateBookSchema.validate({ title: 'Updated Title' });
            expect(error).toBeUndefined();
        });

        test('should reject an empty update', () => {
            const { error } = updateBookSchema.validate({});
            expect(error).toBeDefined();
        });

        test('should allow updating only the quantity', () => {
            const { error } = updateBookSchema.validate({ quantity: 10 });
            expect(error).toBeUndefined();
        });

        test('should reject invalid ISBN in update', () => {
            const { error } = updateBookSchema.validate({ isbn: 'bad' });
            expect(error).toBeDefined();
        });
    });

    describe('searchBookSchema', () => {
        test('should validate search by title', () => {
            const { error } = searchBookSchema.validate({ title: 'Gatsby' });
            expect(error).toBeUndefined();
        });

        test('should validate search by author', () => {
            const { error } = searchBookSchema.validate({ author: 'Fitzgerald' });
            expect(error).toBeUndefined();
        });

        test('should validate search by ISBN', () => {
            const { error } = searchBookSchema.validate({ isbn: '978' });
            expect(error).toBeUndefined();
        });

        test('should reject an empty search', () => {
            const { error } = searchBookSchema.validate({});
            expect(error).toBeDefined();
        });
    });
});

// ── Model Tests (with mocked DB via repository) ───────────────────

describe('Book Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        test('should insert a book and return it', async () => {
            const mockBook = {
                id: 1,
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890123',
                quantity: 3,
                available_quantity: 3,
                shelf_location: 'B2-05',
            };

            // Mock INSERT (repository.insert calls db.execute)
            db.execute.mockResolvedValueOnce([{ insertId: 1 }]);
            // Mock SELECT (repository.findById calls db.execute)
            db.execute.mockResolvedValueOnce([[mockBook]]);

            const result = await BookModel.create({
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890123',
                quantity: 3,
                shelf_location: 'B2-05',
            });

            expect(result).toEqual(mockBook);
            expect(db.execute).toHaveBeenCalledTimes(2);
        });
    });

    describe('findById', () => {
        test('should return a book when found', async () => {
            const mockBook = { id: 1, title: 'Test' };
            db.execute.mockResolvedValueOnce([[mockBook]]);

            const result = await BookModel.findById(1);
            expect(result).toEqual(mockBook);
        });

        test('should return null when not found', async () => {
            db.execute.mockResolvedValueOnce([[]]);

            const result = await BookModel.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('findByISBN', () => {
        test('should return a book when ISBN matches', async () => {
            const mockBook = { id: 1, isbn: '1234567890123' };
            db.execute.mockResolvedValueOnce([[mockBook]]);

            const result = await BookModel.findByISBN('1234567890123');
            expect(result).toEqual(mockBook);
        });

        test('should return null when ISBN not found', async () => {
            db.execute.mockResolvedValueOnce([[]]);

            const result = await BookModel.findByISBN('0000000000000');
            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        test('should return paginated books and total count', async () => {
            const mockBooks = [{ id: 1 }, { id: 2 }];
            db.execute
                .mockResolvedValueOnce([[{ total: 2 }]])  // COUNT query (repo.count)
                .mockResolvedValueOnce([mockBooks]);        // SELECT query (repo.findPaginated)

            const result = await BookModel.findAll(10, 0);
            expect(result.books).toEqual(mockBooks);
            expect(result.total).toBe(2);
        });
    });

    describe('search', () => {
        test('should search by title', async () => {
            const mockBooks = [{ id: 1, title: 'Gatsby' }];
            db.execute.mockResolvedValueOnce([mockBooks]);

            const result = await BookModel.search({ title: 'Gatsby' });
            expect(result).toEqual(mockBooks);
            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('title LIKE ?'),
                ['%Gatsby%']
            );
        });

        test('should search by multiple fields', async () => {
            const mockBooks = [{ id: 1 }];
            db.execute.mockResolvedValueOnce([mockBooks]);

            const result = await BookModel.search({ title: 'Gatsby', author: 'Fitzgerald' });
            expect(result).toEqual(mockBooks);
            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('OR'),
                ['%Gatsby%', '%Fitzgerald%']
            );
        });
    });

    describe('update', () => {
        test('should update specified fields', async () => {
            const mockUpdated = { id: 1, title: 'Updated Title' };
            db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE (repo.update)
            db.execute.mockResolvedValueOnce([[mockUpdated]]);        // findById (repo.findById)

            const result = await BookModel.update(1, { title: 'Updated Title' });
            expect(result).toEqual(mockUpdated);
        });

        test('should skip update if no valid fields provided', async () => {
            const mockBook = { id: 1, title: 'Original' };
            db.execute.mockResolvedValueOnce([[mockBook]]); // findById only (repo.findById)

            const result = await BookModel.update(1, { invalid_field: 'value' });
            expect(result).toEqual(mockBook);
        });
    });

    describe('delete', () => {
        test('should return true when book is deleted', async () => {
            db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await BookModel.delete(1);
            expect(result).toBe(true);
        });

        test('should return false when book does not exist', async () => {
            db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const result = await BookModel.delete(999);
            expect(result).toBe(false);
        });
    });

    describe('decrementAvailable', () => {
        test('should return true when decremented', async () => {
            db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            const result = await BookModel.decrementAvailable(1);
            expect(result).toBe(true);
        });

        test('should return false when no available copies', async () => {
            db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
            const result = await BookModel.decrementAvailable(1);
            expect(result).toBe(false);
        });
    });

    describe('incrementAvailable', () => {
        test('should return true when incremented', async () => {
            db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
            const result = await BookModel.incrementAvailable(1);
            expect(result).toBe(true);
        });
    });
});
