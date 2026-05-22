# AGENTS.md

## Purpose

This file gives coding agents concise project instructions.

Keep changes safe, focused, and minimal.

## Project

Deployment Vault is a Next.js fullstack app for storing deployment information by company and project.

Core features:

- Auth
- Companies
- Projects
- Repository links
- Deployment environments
- Encrypted credentials
- Encrypted env files
- Backend documentation
- Other project documents

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Prisma
- PostgreSQL
- Zod
- React Hook Form

## Non-Negotiable Rules

Do not:

- Rebuild from scratch unless explicitly asked.
- Change database schema unless necessary.
- Change authentication behavior unless task is auth-related.
- Remove existing CRUD features.
- Store secrets in plain text.
- Log secrets.
- Import Prisma, bcryptjs, or Node crypto encryption utilities into middleware.
- Import server-only modules into client components.
- Replace shadcn/ui with another component library.

Always:

- Validate API input with Zod.
- Check authenticated user on protected routes.
- Check ownership before accessing data.
- Keep sensitive data encrypted at rest.
- Mask secrets in the UI by default.
- Run build/lint when possible.
- Summarize changed files.

## UI Rules

The UI should be bright, modern, and SaaS-like.

Use:

- Light background
- White cards
- Soft borders
- Subtle shadows
- Blue/indigo/violet accent
- Rounded-xl or rounded-2xl
- Clean spacing
- Responsive layout

Avoid:

- Dark-heavy design
- Cramped spacing
- Random colors
- Inconsistent card styles

## Working Method

For large tasks:

1. Inspect files.
2. Make a short plan.
3. Implement in small steps.
4. Test with lint/build/typecheck.
5. Fix errors.
6. Summarize.

For small tasks:

- Make the smallest correct change.
- Do not refactor unrelated code.

## Common Commands

Prefer the package manager from the lockfile.

```bash
npm install
npm dev
npm build
npm lint
npm prisma generate
npm prisma validate
npm prisma migrate dev
```
