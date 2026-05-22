# Deployment Vault

A secure web application to store deployment-related information per company and project.

## Features

- **Authentication** — Register/login with bcrypt-hashed passwords, JWT sessions
- **Companies** — Create and manage company workspaces
- **Projects** — Per-company projects with full CRUD
- **Repositories** — Track repo URLs per project
- **Deployment Environments** — Production / Staging / Development with encrypted secrets
- **Backend Documentation** — Postman, Swagger, Apidog links per project
- **Other Documents** — Links, notes, credentials, and documents with encryption for sensitive types
- **AES-256-GCM encryption** — All sensitive values encrypted at rest
- **Reveal/copy buttons** — Masked secrets with reveal and clipboard copy

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Prisma 7 · PostgreSQL · Zod · React Hook Form · bcryptjs · jose · Sonner

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Generate the required secrets:

```bash
# JWT secret (base64, 32 bytes)
openssl rand -base64 32

# Encryption key (hex, must be exactly 64 hex chars = 32 bytes)
openssl rand -hex 32
```

Set `DATABASE_URL` to your PostgreSQL connection string.

### 3. Install dependencies

```bash
npm install
```

### 4. Database migration

```bash
npx prisma migrate dev --name init
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Security Notes

- Passwords are hashed with bcryptjs (12 salt rounds)
- Session tokens are signed JWTs via `jose` (HS256, 7-day expiry)
- Sensitive deployment fields (credentials, env files, notes, tokens) are encrypted with AES-256-GCM before storage
- All API routes verify ownership — users can only access their own data
- `ENCRYPTION_KEY` and `JWT_SECRET` must never be committed or logged

## Folder Structure

```
app/
  (auth)/login, register    — public auth pages
  (dashboard)/              — protected dashboard routes
  api/                      — route handlers
components/
  layout/                   — sidebar, topbar
  companies/                — company UI
  projects/                 — project UI
  vault/                    — tab panels (repos, deployments, docs)
hooks/                      — TanStack Query hooks
lib/                        — db, auth, encryption, validation helpers
prisma/                     — Prisma schema and migrations
types/                      — shared TypeScript types
```
