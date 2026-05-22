# CLAUDE.md

## Project Summary

This project is **Deployment Vault**, a fullstack app for securely storing deployment information per company and project.

Users can manage:

- Companies
- Projects
- Repository links
- Deployment environments
- Credentials
- Env file contents
- Backend documentation links
- Other project documents or notes

Sensitive deployment data must be encrypted at rest.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query / React Query
- Prisma ORM
- PostgreSQL
- Zod
- React Hook Form
- bcryptjs
- Node crypto AES-256-GCM
- Sonner
- Lucide React

## Package Manager

Use the existing package manager from the lockfile:

- If `pnpm-lock.yaml` exists, use `pnpm`.
- If `package-lock.json` exists, use `npm`.
- Do not switch package managers unless explicitly asked.

## Common Commands

Use the correct package manager equivalent.

```bash
# install
npm install

# dev
npm dev

# build
npm build

# lint
npm lint

# prisma
npm prisma generate
npm prisma validate
npm prisma migrate dev
npm prisma studio
```
