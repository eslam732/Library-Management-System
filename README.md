# 📚 Library Management System

A RESTful API for managing books, users, and the borrowing process. Built with **Node.js**, **Express**, and **MySQL**. Features **JWT authentication**, **role-based access control** (admin/user), and a **repository pattern** architecture.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
  - [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Auth Endpoints](#auth-endpoints)
  - [Books Endpoints](#books-endpoints)
  - [Users Endpoints](#users-endpoints)
  - [Borrowing Endpoints](#borrowing-endpoints)
- [Running Tests](#running-tests)
- [Rate Limiting](#rate-limiting)

---

## Features

### Functional
- **Books**: CRUD operations, search by title/author/ISBN (admin manages, all users can read)
- **Users**: Register with password, login with JWT, profile management
- **Borrowing**: Check out books, return books, track due dates, list overdue books
- **Analytics**: Reports for borrowing activity in specific periods (admin only)
- **Export**: CSV and XLSX export for overdue and borrowing data (admin only)

### Non-Functional / Bonus
- ✅ **JWT Authentication** with role-based access control (admin/user)
- ✅ **Repository pattern** — SQL queries separated from business logic
- ✅ **Paginated listing** with configurable `ITEMS_PER_PAGE` from environment
- ✅ **User scoping** — users can only affect their own data (borrow/return uses JWT id)
- ✅ Input validation (Joi) to prevent SQL injection
- ✅ Parameterized SQL queries
- ✅ Rate limiting on checkout/return endpoints
- ✅ Docker & Docker Compose support
- ✅ Unit tests (52 tests — Books module + Auth module)
- ✅ Proper error handling with meaningful messages

---

## Tech Stack

| Component        | Technology         |
| ---------------- | ------------------ |
| Runtime          | Node.js 18+        |
| Framework        | Express.js 4       |
| Database         | MySQL 8            |
| Authentication   | JWT (jsonwebtoken)  |
| Password Hashing | bcryptjs           |
| Validation       | Joi                |
| Security         | Helmet             |
| Rate Limiting    | express-rate-limit |
| Export           | SheetJS (xlsx)      |
| Testing          | Jest               |
| Containerization | Docker & Docker Compose |

---

## Project Structure

```
lib-management-system/
├── src/
│   ├── config/
│   │   └── index.js                  # Centralized configuration
│   ├── database/
│   │   ├── connection.js             # MySQL connection pool
│   │   ├── migrate.js                # Migration script
│   │   └── schema.sql                # Database schema
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication & authorization
│   │   ├── errorHandler.js           # Global error handler
│   │   ├── rateLimiter.js            # Rate limiting
│   │   └── validate.js               # Request validation (Joi)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js    # Register & login handlers
│   │   │   ├── auth.validation.js    # Auth validation schemas
│   │   │   └── auth.routes.js        # Auth route definitions
│   │   ├── books/
│   │   │   ├── book.repository.js    # Book SQL queries
│   │   │   ├── book.model.js         # Book business logic
│   │   │   ├── book.controller.js    # Book request handlers
│   │   │   ├── book.validation.js    # Book validation schemas
│   │   │   └── book.routes.js        # Book routes (admin guards on CUD)
│   │   ├── users/
│   │   │   ├── user.repository.js    # User SQL queries
│   │   │   ├── user.model.js         # User business logic
│   │   │   ├── user.controller.js    # User request handlers
│   │   │   ├── user.validation.js    # User validation schemas
│   │   │   └── user.routes.js        # User routes
│   │   └── borrowings/
│   │       ├── borrowing.repository.js # Borrowing SQL queries
│   │       ├── borrowing.model.js     # Borrowing business logic
│   │       ├── borrowing.controller.js# Borrowing request handlers
│   │       ├── borrowing.validation.js# Borrowing validation schemas
│   │       └── borrowing.routes.js    # Borrowing routes
│   ├── utils/
│   │   ├── AppError.js               # Custom error class
│   │   ├── asyncHandler.js           # Async error wrapper
│   │   └── exportHelper.js           # CSV/XLSX export utilities
│   ├── app.js                        # Express app setup
│   └── server.js                     # Server entry point
├── tests/
│   ├── __mocks__/
│   │   └── connection.js             # Mock DB for tests
│   ├── auth/
│   │   └── auth.test.js              # Auth module unit tests
│   └── books/
│       └── book.test.js              # Book module unit tests
├── .env.example
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
└── README.md
```

---

## Database Schema

```
┌──────────────────────────┐
│         books            │
├──────────────────────────┤
│ id (PK)          INT     │
│ title            VARCHAR │  ◄── INDEX
│ author           VARCHAR │  ◄── INDEX
│ isbn (UNIQUE)    VARCHAR │  ◄── INDEX
│ quantity         INT     │
│ available_quantity INT   │
│ shelf_location   VARCHAR │
│ created_at       TIMESTAMP│
│ updated_at       TIMESTAMP│
└──────────┬───────────────┘
           │
           │ FK (book_id)
           ▼
┌──────────────────────────┐
│       borrowings         │
├──────────────────────────┤
│ id (PK)          INT     │
│ book_id (FK)     INT     │  ◄── INDEX
│ user_id (FK)     INT     │  ◄── INDEX
│ checkout_date    DATE    │  ◄── INDEX
│ due_date         DATE    │  ◄── INDEX
│ return_date      DATE    │  ◄── INDEX
│ created_at       TIMESTAMP│
│ updated_at       TIMESTAMP│
└──────────▲───────────────┘
           │
           │ FK (user_id)
           │
┌──────────┴───────────────┐
│         users            │
├──────────────────────────┤
│ id (PK)          INT     │
│ name             VARCHAR │
│ email (UNIQUE)   VARCHAR │  ◄── INDEX
│ password         VARCHAR │
│ role        ENUM(admin,user) │
│ registered_date  DATE    │
│ created_at       TIMESTAMP│
│ updated_at       TIMESTAMP│
└──────────────────────────┘
```

**Key Design Decisions:**
- `available_quantity` is maintained separately from `quantity` to avoid counting active borrowings on every read.
- Indexes are placed on all frequently searched/filtered columns.
- `ON DELETE RESTRICT` prevents orphaned borrowing records.
- InnoDB engine for transaction support and referential integrity.
- Passwords are hashed with **bcryptjs** (12 salt rounds) — never stored or returned in plain text.
- Users have a `role` field (`admin` or `user`) for role-based access control.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** 8.0+
- **Docker** & **Docker Compose** (optional)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lib-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials and JWT secret
   ```

4. **Create the database:**
   ```bash
   # Make sure MySQL is running, then:
   npm run db:migrate
   ```

5. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

6. **Access the API:**
   - Health check: `http://localhost:3000/health`
   - API base: `http://localhost:3000/api`

### Docker Setup

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes (wipes database)
docker-compose down -v
```

The API will be available at `http://localhost:3000` and MySQL at port `3307`.

---

## API Documentation

### Authentication

The API uses **JWT (JSON Web Token)** authentication.

1. **Register** a new user via `POST /api/auth/register`
2. **Login** via `POST /api/auth/login` to receive a JWT token
3. Include the token in all subsequent requests:

```
Header: Authorization: Bearer <your_jwt_token>
```

**Roles:**
- `user` (default) — Can borrow/return books, view books, manage own profile
- `admin` — Can manage books (add/update/delete), manage all users, view overdue/analytics/exports

---

### Auth Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| name     | string | Yes      | Full name                      |
| email    | string | Yes      | Valid email (unique)            |
| password | string | Yes      | Min 6 characters               |

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "registered_date": "2026-03-02"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Books Endpoints

> 📖 **Read** endpoints (GET) are available to all authenticated users.
> ✏️ **Write** endpoints (POST, PUT, DELETE) require **admin** role.

#### List All Books
```
GET /api/books?page=1
```
Pagination uses `ITEMS_PER_PAGE` from environment (default: 10).

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Search Books
```
GET /api/books/search?title=gatsby&author=fitzgerald&isbn=978
```

#### Get a Book
```
GET /api/books/:id
```

#### Add a Book 🔒 *Admin Only*
```
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "quantity": 5,
  "shelf_location": "A1-01"
}
```

#### Update a Book 🔒 *Admin Only*
```
PUT /api/books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "quantity": 10
}
```

#### Delete a Book 🔒 *Admin Only*
```
DELETE /api/books/:id
```

---

### Users Endpoints

> Users can view/update their own profile via `/me` endpoints.
> Admin-only endpoints manage all users.

#### Get My Profile
```
GET /api/users/me
```

#### Update My Profile
```
PUT /api/users/me
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

#### List All Users 🔒 *Admin Only*
```
GET /api/users?page=1
```

#### Get a User 🔒 *Admin Only*
```
GET /api/users/:id
```

#### Update a User 🔒 *Admin Only*
```
PUT /api/users/:id
```

#### Delete a User 🔒 *Admin Only*
```
DELETE /api/users/:id
```

---

### Borrowing Endpoints

> Checkout and return use the **authenticated user's ID from JWT** — users cannot borrow/return on behalf of others.

#### Check Out a Book 🔒 *Rate Limited*
```
POST /api/borrowings/checkout
Content-Type: application/json

{
  "book_id": 1,
  "due_date": "2026-03-16"
}
```

| Field    | Type   | Required | Description                           |
| -------- | ------ | -------- | ------------------------------------- |
| book_id  | number | Yes      | ID of the book to check out           |
| due_date | string | No       | ISO date (YYYY-MM-DD), must be future |

> Note: `user_id` is automatically taken from the JWT token.

**Response (201):**
```json
{
  "success": true,
  "message": "Book checked out successfully.",
  "data": {
    "id": 1,
    "checkout_date": "2026-03-02",
    "due_date": "2026-03-16",
    "return_date": null,
    "book_id": 1,
    "book_title": "The Great Gatsby",
    "book_isbn": "9780743273565",
    "user_id": 1,
    "user_name": "John Doe",
    "user_email": "john@example.com"
  }
}
```

#### Return a Book 🔒 *Rate Limited*
```
POST /api/borrowings/return
Content-Type: application/json

{
  "book_id": 1
}
```

> Note: The system finds the active borrowing for the authenticated user automatically.

#### Get My Checked-Out Books
```
GET /api/borrowings/my-books
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "checked_out_books": [ ... ],
    "count": 2
  }
}
```

#### List Overdue Books 🔒 *Admin Only*
```
GET /api/borrowings/overdue
```

#### Analytics Report 🔒 *Admin Only*
```
GET /api/borrowings/analytics?start_date=2026-02-01&end_date=2026-03-01&format=json
```

| Parameter  | Type   | Required | Description                       |
| ---------- | ------ | -------- | --------------------------------- |
| start_date | string | Yes      | Start of period (YYYY-MM-DD)      |
| end_date   | string | Yes      | End of period (YYYY-MM-DD)        |
| format     | string | No       | `json` (default), `csv`, or `xlsx`|

#### Export Overdue Last Month 🔒 *Admin Only*
```
GET /api/borrowings/export/overdue-last-month?format=csv
```

#### Export Borrowings Last Month 🔒 *Admin Only*
```
GET /api/borrowings/export/borrowings-last-month?format=csv
```

---

### Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message"
  }
}
```

| Status Code | Meaning                          |
| ----------- | -------------------------------- |
| 400         | Bad Request / Validation Error   |
| 401         | Authentication Required / Invalid Token |
| 403         | Forbidden (insufficient role)    |
| 404         | Resource Not Found               |
| 409         | Conflict (duplicate)             |
| 429         | Too Many Requests (rate limited) |
| 500         | Internal Server Error            |

---

## Running Tests

```bash
# Run all tests (52 tests)
npm test

# Run with coverage report
npm run test:coverage
```

Tests use **Jest** with mocked database connections. No real database is needed.

---

## Rate Limiting

| Endpoint                        | Limit                |
| ------------------------------- | -------------------- |
| `POST /api/borrowings/checkout` | 10 requests / minute |
| `POST /api/borrowings/return`   | 10 requests / minute |
| All other endpoints             | 100 requests / minute |
