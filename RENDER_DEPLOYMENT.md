# Render.com Deployment Guide

This guide explains how to deploy the Bookary application (backend + frontend) to Render.com.

## Project Structure

```
bookary/
├── backend/                 # Node.js + Express API
├── frontend/                # React + Vite SPA
├── render.yaml             # Render configuration (monorepo)
└── .github/workflows/       # CI/CD pipeline
```

## Quick Start

### Prerequisites

1. GitHub repository with this code pushed
2. Render.com account (free tier available)
3. Basic understanding of environment variables

### Deployment Steps

1. **Connect Repository to Render**
   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Render will auto-detect `render.yaml`

2. **Configure Backend Service**
   - Service Name: `bookary-backend` (auto-detected)
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free tier (for testing)

3. **Configure Frontend Service**
   - Service Name: `bookary-frontend` (auto-detected)
   - Environment: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Plan: Free tier

### Environment Variables Setup

#### Backend Service
In Render Dashboard → Backend Service → Environment:

```
NODE_ENV = production
DATABASE_URL = file:./prisma/prod.db
PORT = 10000
```

#### Frontend Service  
In Render Dashboard → Frontend Service → Environment:

```
VITE_API_BASE_URL = https://bookary-backend.onrender.com/api
```

⚠️ **Important**: Replace `bookary-backend` with your actual backend service name.

## Database Configuration

### Current Setup (SQLite)
- **File**: `prisma/prod.db`
- **Issue**: Render's file system is ephemeral - files don't persist between deployments
- **Duration**: Data will be lost after dyno restarts or updates

### Production Recommendations

#### Option 1: PostgreSQL (Recommended for Production)
1. Add PostgreSQL database in Render Dashboard
2. Update `DATABASE_URL` environment variable:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/bookary
   ```
3. Render will handle backups automatically

#### Option 2: Keep SQLite (Testing Only)
- Current setup: `DATABASE_URL=file:./prisma/prod.db`
- Data persistence: **Not guaranteed** between deployments
- Use only for development/testing purposes

#### Option 3: Cloud SQLite (Turso)
1. Sign up at [turso.tech](https://turso.tech)
2. Create a database
3. Update `DATABASE_URL`:
   ```
   DATABASE_URL=libsql://name.turso.io?authToken=your_token
   ```

## Database Initialization

### First Deploy
1. Render will run `npm install` → TypeScript build → start server
2. **Manual step needed**: Run Prisma migrations and seeding
3. Connect via Render's Shell:
   ```bash
   cd /var/task/backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Automatic Seeding (Optional)
Add a postbuild script to `backend/package.json`:
```json
{
  "scripts": {
    "postbuild": "npm run db:seed"
  }
}
```
⚠️ This will seed data on every build.

## Verify Deployment

1. **Backend Health Check**
   ```
   curl https://bookary-backend.onrender.com/api/health
   ```
   Expected response: `{"status":"ok"}`

2. **Frontend**
   - Visit `https://bookary-frontend.onrender.com`
   - Should load the login page
   - Check browser console for errors

3. **API Connectivity**
   - Login with test credentials from seed data:
     - Email: `admin@quanlysach.com`
     - Password: `admin123`

## Troubleshooting

### Frontend shows blank page
- Check VITE_API_BASE_URL in Render dashboard
- Open browser DevTools Console for errors
- Verify backend service is running (check health endpoint)

### "Cannot connect to API"
- Verify backend service URL is correct
- Check VITE_API_BASE_URL includes `/api` suffix
- Ensure backend service is deployed and healthy

### Database errors on first deploy
- Render Shell → run migrations manually:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```
- Check `DATABASE_URL` environment variable is set

### Service keeps restarting
- Check application logs in Render Dashboard
- Ensure `start` script in package.json is correct
- Verify PORT environment variable handling

### Port binding error
- Backend expects `process.env.PORT` (default: 3001)
- Render sets this automatically (default: 10000)
- Should not need manual configuration

## File Structure Details

### render.yaml
- Defines both backend (Web Service) and frontend (Static Site)
- Located at project root
- Render auto-detects on repository connection
- Specifies build commands, start commands, and directories

### Backend Configuration
- `backend/tsconfig.json`: TypeScript compilation settings
- `backend/.env.example`: Environment variables template
- `backend/package.json`: Scripts and dependencies
  - `build`: Compiles TypeScript to `dist/`
  - `start`: Runs `node dist/index.js`

### Frontend Configuration
- `frontend/vite.config.ts`: Vite build configuration
- `frontend/.env.example`: Environment variables template
- `frontend/src/api/client.ts`: Uses `VITE_API_BASE_URL` for API calls
- `frontend/package.json`: Scripts and dependencies
  - `build`: Compiles TypeScript and bundles with Vite
  - Output: `dist/` folder with static files

## Environment Variables Summary

| Variable | Service | Value | Example |
|----------|---------|-------|---------|
| `NODE_ENV` | Backend | `production` | `production` |
| `DATABASE_URL` | Backend | Database connection | `file:./prisma/prod.db` |
| `PORT` | Backend | Port number | `10000` (auto-set by Render) |
| `VITE_API_BASE_URL` | Frontend | API endpoint | `https://bookary-backend.onrender.com/api` |

## Local Development

To test the setup locally before deploying:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run build
NODE_ENV=production npm start

# Terminal 2: Frontend
cd frontend
npm install
VITE_API_BASE_URL=http://localhost:3001/api npm run dev
```

## CI/CD Integration

The `.github/workflows/ci.yml` file runs automated tests:
- Backend build verification
- Frontend linting and build
- Both must pass before deployment

Push to `main` branch to trigger automated deployment.

## Additional Resources

- [Render Web Services Documentation](https://render.com/docs/web-services)
- [Render Static Sites Documentation](https://render.com/docs/static-sites)
- [Prisma with Render](https://www.prisma.io/docs/guides/deployment)
