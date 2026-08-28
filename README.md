# Upfold

Upfold is a secure file storage and sharing application. It combines a Next.js web client with an Express API, PostgreSQL metadata storage, and Amazon S3 object storage.

## What is implemented

- Account registration and login with email and password.
- Argon2 password hashing.
- JWT access tokens and refresh-token rotation stored as SHA-256 hashes in PostgreSQL.
- Cookie-aware authentication and automatic access-token refresh in the frontend.
- Personal folders with nested folder navigation.
- Single-file and folder uploads, including multi-file uploads.
- S3 presigned uploads, so file content is sent directly to object storage instead of through the API server.
- File rename, download, preview, and deletion flows.
- Private/public file visibility and share links backed by unique share tokens.
- Shared-file browsing and unauthenticated shared-file viewing.
- MIME-aware previews for images, video, audio, PDF, text, JSON, Word, Excel, and PowerPoint files.
- Request validation with Zod and centralized Express error handling.
- Responsive interface built with Next.js, React, Tailwind CSS, shadcn/ui, and Lucide icons.
- Light/dark theme support and upload progress feedback.

## What makes it different

Upfold is designed around a small, separated storage architecture rather than treating the application server as the file server:

1. **Metadata and file bytes are separated.** PostgreSQL stores users, folders, file metadata, and share records, while S3 stores the actual objects.
2. **Uploads are direct-to-S3.** The API creates a short-lived presigned POST and the browser uploads the file directly to S3. This reduces API bandwidth and keeps storage credentials on the server.
3. **Sharing is explicit and revocable.** Files can be shared through dedicated tokens, with share records and optional expiry data represented in the database.
4. **Authentication is built for renewal.** Access tokens are paired with refresh tokens, while only a SHA-256 hash of each refresh token is persisted.
5. **The drive experience stays familiar.** Nested folders, folder uploads, previews, shared files, and a compact drive sidebar provide a cloud-drive workflow without requiring a large service footprint.

## Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer, or a hosted PostgreSQL database
- An AWS account with an S3 bucket and credentials allowed to read/write that bucket

## Local setup

### 1. Install dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```dotenv
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/upfold

JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_MAX_AGE=900000
REFRESH_TOKEN_MAX_AGE=604800000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-bucket-name
```

`ACCESS_TOKEN_MAX_AGE` and `REFRESH_TOKEN_MAX_AGE` are milliseconds. The values above represent 15 minutes and 7 days.

The S3 bucket must allow the application credentials to create presigned uploads and read/delete objects. Configure bucket CORS to allow browser requests from `http://localhost:3000` for the methods used by your upload and download flows.

### 3. Create the database schema

Make sure PostgreSQL is running, then run the Prisma migration and client-generation commands:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

The repository includes the existing migrations under `backend/prisma/migrations`.

### 4. Configure the frontend

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

The backend defaults to port `3000`, so the example intentionally sets it to `3001` to leave port `3000` available for Next.js. Keep `FRONTEND_URL` and the frontend origin aligned with the port you use.

### 5. Run both applications

Open two terminals.

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and enter the drive. The API is available at [http://localhost:3001/api/v1](http://localhost:3001/api/v1).

## Production commands

Build and start the backend:

```bash
cd backend
npm run build
npm start
```

Build and start the frontend:

```bash
cd frontend
npm run build
npm start
```

Set production environment variables before starting either application. In production, use HTTPS, restrict S3 bucket access, use a strong randomly generated `JWT_SECRET`, and configure the frontend/API origins explicitly.

## Useful scripts

### Backend

- `npm run dev` - run the Express API with `tsx` watch mode
- `npm run build` - compile TypeScript to `dist`
- `npm start` - run the compiled API

### Frontend

- `npm run dev` - run the Next.js development server
- `npm run build` - create a production build
- `npm start` - serve the production build
- `npm run lint` - run ESLint

## Project structure

```text
backend/
  prisma/       Prisma schema and migrations
  src/api/      Versioned Express routes and feature modules
  src/common/   Errors, JWT, Prisma, and middleware
frontend/
  src/app/      Next.js routes and pages
  src/actions/  File and folder mutations
  src/components/ Drive, auth, providers, and UI components
  src/store/    Authentication and drive state
```