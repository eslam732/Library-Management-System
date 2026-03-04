-- ============================================
-- Library Management System - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- ============================================
-- Books Table
-- ============================================
CREATE TABLE IF NOT EXISTS books (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)   NOT NULL,
    author      VARCHAR(255)   NOT NULL,
    isbn        VARCHAR(17)    NOT NULL UNIQUE,  -- ISBN-13 with hyphens
    quantity    INT            NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    available_quantity INT     NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    shelf_location VARCHAR(50) NOT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for frequent search operations
    INDEX idx_books_title  (title),
    INDEX idx_books_author (author),
    INDEX idx_books_isbn   (isbn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Users Table (admins & borrowers)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255)   NOT NULL,
    email           VARCHAR(255)   NOT NULL UNIQUE,
    password        VARCHAR(255)   NOT NULL,
    role            ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    registered_date DATE           NOT NULL DEFAULT (CURRENT_DATE),
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index for email lookups
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Borrowing Records Table
-- Tracks which books are checked out and by whom
-- ============================================
CREATE TABLE IF NOT EXISTS borrowings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    book_id       INT       NOT NULL,
    user_id       INT       NOT NULL,
    checkout_date DATE      NOT NULL DEFAULT (CURRENT_DATE),
    due_date      DATE      NOT NULL,
    return_date   DATE      NULL DEFAULT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_borrowings_book
        FOREIGN KEY (book_id) REFERENCES books(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_borrowings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Indexes for performance on frequent queries
    INDEX idx_borrowings_book_id     (book_id),
    INDEX idx_borrowings_user_id     (user_id),
    INDEX idx_borrowings_due_date    (due_date),
    INDEX idx_borrowings_return_date (return_date),
    INDEX idx_borrowings_checkout    (checkout_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
