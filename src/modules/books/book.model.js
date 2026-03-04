/**
 * Book Model
 * Contains business logic for book operations.
 * Delegates all database queries to the repository layer.
 */

const BookRepository = require('./book.repository');

const BookModel = {
  /**
   * Create a new book.
   * @param {Object} bookData - { title, author, isbn, quantity, shelf_location }
   * @returns {Promise<Object>} The created book
   */
  async create({ title, author, isbn, quantity, shelf_location }) {
        const id = await BookRepository.insert({ title, author, isbn, quantity, shelf_location });
    return BookRepository.findById(id);
  },

  /**
   * Find a book by its ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return BookRepository.findById(id);
  },

  /**
   * Find a book by its ISBN.
   * @param {string} isbn
   * @returns {Promise<Object|null>}
   */
  async findByISBN(isbn) {
    return BookRepository.findByISBN(isbn);
  },

  /**
   * List all books with pagination.
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{ books: Array, total: number }>}
   */
  async findAll(limit, offset) {
    const [total, books] = await Promise.all([
      BookRepository.count(),
      BookRepository.findPaginated(limit, offset),
    ]);
    return { books, total };
  },

  /**
   * Search books by title, author, or ISBN.
   * @param {Object} filters - { title, author, isbn }
   * @returns {Promise<Array>}
   */
  async search({ title, author, isbn }) {
    const conditions = [];
    const params = [];

    if (title) {
            conditions.push('title LIKE ?');
      params.push(`%${title}%`);
    }
    if (author) {
            conditions.push('author LIKE ?');
      params.push(`%${author}%`);
    }
    if (isbn) {
            conditions.push('isbn LIKE ?');
      params.push(`%${isbn}%`);
    }

    if (conditions.length === 0) return null;

    return BookRepository.search(conditions, params);
  },

  /**
   * Update a book's details. Only updates provided fields.
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async update(id, updates) {
        const allowedFields = ['title', 'author', 'isbn', 'quantity', 'available_quantity', 'shelf_location'];
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (fields.length === 0) return BookRepository.findById(id);

    await BookRepository.update(id, fields, params);
    return BookRepository.findById(id);
  },

  /**
   * Delete a book by ID.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    return BookRepository.delete(id);
  },

  /**
   * Decrement available quantity when a book is checked out.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async decrementAvailable(id) {
    return BookRepository.decrementAvailable(id);
  },

  /**
   * Increment available quantity when a book is returned.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async incrementAvailable(id) {
    return BookRepository.incrementAvailable(id);
  },
};

module.exports = BookModel;
