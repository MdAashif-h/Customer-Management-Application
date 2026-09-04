# Custora

Custora uses Next.js App Router, Auth.js credentials authentication, and Prisma 6. Local development uses SQLite when `DATABASE_URL` is set to `file:./dev.db`; production can use PostgreSQL with the same Prisma data layer.

## Setup

1. Copy `.env.example` to `.env`.
2. Keep the local `DATABASE_URL="file:./dev.db"` or set it to PostgreSQL for production.
3. Generate and migrate the local database: `npm.cmd run db:generate` then `npm.cmd run db:migrate:dev`.
4. Run `npm.cmd run db:seed` to create the configured development admin.
5. Run `npm.cmd run dev`.

Protected application routes require a valid Auth.js session. Roles are `ADMIN`, `MANAGER`, and `USER`; permissions are centralized in `lib/permissions/index.ts`. Customer writes and audit activities are server-side validated in `lib/db/customers.ts`.

The current visual prototype pages still contain mock display data in their client-only list/dashboard components; migrate those reads to the server data functions before production use. SQLite is for local development; use PostgreSQL for Vercel production deployments.

## Supabase configuration

The supplied Supabase project values are stored in the ignored `.env.local`. `SUPABASE_PUBLISHABLE_KEY` is safe for the public Supabase client; `SUPABASE_SECRET_KEY` is server-only and must never use a `NEXT_PUBLIC_` prefix. Supabase clients are available in `lib/supabase/`.

The existing Auth.js + Prisma + SQLite path remains the active application data path. The Supabase URL and API keys do not provide Prisma with a database connection string. To migrate application data to Supabase Postgres, add the project database connection string as `DATABASE_URL`, apply a reviewed Postgres schema/RLS migration, and then switch the data-access layer deliberately.