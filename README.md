# Bookary - Library Management System

A full-stack Vietnamese library management system built with React 18, Node.js/Express, Prisma, and SQLite.

## Project Structure

```
bookary/
├── backend/          # Node.js + Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/       # Database migrations
│   │   └── seed.ts          # Seed data script
│   ├── src/
│   │   ├── middleware/       # Authentication middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Express server
│   └── package.json
│
└── frontend/         # React + TypeScript + Tailwind CSS
    ├── src/
    │   ├── api/              # API clients
    │   ├── components/       # Reusable components
    │   ├── context/          # Auth context
    │   ├── pages/            # Route pages
    │   ├── types.ts          # TypeScript types
    │   ├── App.tsx           # Main app
    │   └── main.tsx          # Entry point
    └── package.json
```

## Features Implemented

### Module 1: Onboarding & Authentication ✅
- Login & registration pages
- Role-based access control (Admin/Guest)
- JWT-based authentication
- Protected routes

### Module 2: Book Management ✅
- CRUD operations (Create, Read, Update, Delete)
- Book search & pagination
- Inventory tracking (available quantity)
- Admin-only write operations

### Module 3: Reader Management ✅
- CRUD operations for readers
- Search by code/name/email/phone
- Membership expiry tracking
- Red flag for expired memberships

### Module 4: Borrow Books (3-Step Wizard) ✅
- Step 1: Select reader from list
- Step 2: Select book to borrow
- Step 3: Confirmation & print option
- Automatic inventory decrement

### Module 5: Return Books ✅
- Search active borrow tickets
- Mark books as returned or lost
- Calculate overdue fines (5000 VND/day)
- Automatic inventory increment

### Module 6: Extend Borrowing (Gia Hạn) ✅
- Extend due date by 7 days
- View all active tickets
- Search functionality

### Module 7: Dashboard & Reports ✅
- Summary statistics (total books, readers, borrowing, overdue)
- Recent borrow tickets list
- Status indicators (red for overdue)
- Real-time data

## Database Schema

### Tables
- **User**: Authentication (email, password, role)
- **Book**: Book catalog (code, title, author, quantities)
- **Reader**: Library members (code, name, contact, membership)
- **BorrowTicket**: Borrow records (reader, book, dates, status)

### Demo Data
- 2 admin users
- 25 sample books
- 50 sample readers
- 13 sample borrow tickets (including overdue, returned, and lost records)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Set up database (first time only)
npx prisma migrate dev --name init

# Seed database (optional - populates with demo data)
npm run db:seed

# Start server (development)
npm run dev

# Start server (production)
npm run build
npm run start
```

Backend runs on `http://localhost:3001`

**Useful commands:**
```bash
# Reset database completely
npm run db:reset

# Run migrations (CI/CD environments)
npx prisma migrate deploy

# View database in browser
npx prisma studio
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend runs on `http://localhost:5173`

## Demo Credentials

### Admin 1 (Full access)
- Email: `thuthu@quanlysach.com`
- Password: `123456`
- Role: Admin
- Can access all modules

### Admin 2 (Full access)
- Email: `admin@quanlysach.com`
- Password: `admin123`
- Role: Admin
- Can access all modules

**Note:** There are no pre-created guest users. Register a new account with a guest role to test guest functionality. Guest users can only view the book catalog.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Books (Paginated)
- `GET /api/books?search=&page=1` - List books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Readers (Paginated)
- `GET /api/readers?search=&page=1` - List readers
- `GET /api/readers/:id` - Get reader details
- `GET /api/readers/:id/history` - Borrow history
- `POST /api/readers` - Create reader (Admin only)
- `PUT /api/readers/:id` - Update reader (Admin only)
- `DELETE /api/readers/:id` - Delete reader (Admin only)

### Borrowing
- `POST /api/borrow` - Create borrow ticket (Admin only)
- `GET /api/return?search=` - List active tickets
- `POST /api/return/:ticketId` - Return book
- `GET /api/renew?search=` - List tickets for renewal
- `POST /api/renew/:ticketId` - Extend due date

### Dashboard
- `GET /api/dashboard` - Get statistics and recent tickets

## Troubleshooting

### Backend won't start

**Error: "Could not find a declaration file for module"**
```bash
npm install -D @types/cors
```

**Error: "PrismaClient" not exported**
Use transpile-only flag:
```bash
npx ts-node --transpile-only src/index.ts
```

**Error: Prisma engine not found**
```bash
npx prisma generate
# Then restart the server
```

### Frontend won't compile

**Port 5173 in use**
```bash
npm run dev -- --port 5174
```

### Database issues

**Reset database completely**
```bash
npm run db:reset
# This will:
# 1. Drop the database
# 2. Re-run all migrations
# 3. Run the seed script
```

**Migrations not applying in CI/CD**
```bash
# Use this in CI/CD environments instead of migrate dev
npx prisma migrate deploy
```

**Manual database reset**
```bash
rm backend/prisma/dev.db
npx prisma migrate dev --name init
npm run db:seed
```

## Tech Stack

### Backend
- Node.js + Express 5.2
- TypeScript 6.0
- Prisma 7.8 (ORM)
- SQLite (Database)
- JWT (Authentication)
- bcryptjs (Password hashing)
- CORS

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios (HTTP client)
- React Query (State management)

## Development Notes

- All routes require authentication (Bearer token in Authorization header)
- Admin routes are protected with `adminMiddleware`
- Guest users can only view books
- Timestamps use ISO 8601 format
- All monetary values in VND (Vietnamese Dong)
- Fine calculation: 5000 VND per day overdue

## CI/CD Configuration

### GitHub Actions
- **Frontend**: Lints and builds React app on every push
- **Backend**: Generates Prisma Client and builds TypeScript on every push
- **Workflow file**: `.github/workflows/ci.yml`

The CI/CD pipeline runs on:
- Push to `main`, `develop`, or `master` branches
- Pull requests to those branches

**Note:** Database seeding is not part of the build process. It's executed locally or during deployment.

## Future Enhancements

- Email notifications for overdue books
- Reservation system
- Book ratings/reviews
- User profile management
- Advanced reporting/analytics
- Barcode scanning support
- Mobile app (React Native)

## License

MIT

## Support

For issues or questions, check the troubleshooting section above or review the code structure.
