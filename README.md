# MyDay

MyDay is a private, single-user daily planner and task manager. The repository currently contains the application foundation, the MVP database baseline, and personal username/password authentication.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL 17
- Prisma ORM 7
- Auth.js 5 (Credentials provider)
- Zod 4
- npm

## Prerequisites

- Node.js 24 or a compatible active LTS release
- npm
- Docker Desktop with Docker Compose, or a locally accessible PostgreSQL server

## Installation

```bash
npm install
```

Copy `.env.example` to `.env`, then adjust local values if necessary. `.env` is ignored by Git.

```powershell
Copy-Item .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection URL
- `AUTH_SECRET`: a long random secret used to encrypt and sign authentication state
- `SEED_USERNAME` and `SEED_PASSWORD`: personal user credentials used by the database seed

Never use the example development credentials in production.

Generate an authentication secret before starting the application. For example:

```bash
npx auth secret
```

The command writes `AUTH_SECRET` to the local `.env` file. Keep that file and all real credentials out of Git.

Auth.js automatically trusts local development and supported hosting platforms. For a custom production proxy, configure its canonical `AUTH_URL` (or explicitly set `AUTH_TRUST_HOST=true` only when that proxy validates the incoming host header).

## PostgreSQL

The included Compose configuration starts PostgreSQL 17 on `localhost:5432` with a persistent Docker volume:

```bash
docker compose up -d
docker compose ps
```

To stop it without deleting its data:

```bash
docker compose stop
```

If Docker is unavailable, create a PostgreSQL database named `myday` and update `DATABASE_URL` in `.env`.

## Database and Prisma

Apply committed migrations, generate Prisma Client, and seed the personal user plus default Areas:

```bash
npm run db:deploy
npm run prisma:generate
npm run db:seed
```

The seed is idempotent and hashes `SEED_PASSWORD` with Argon2id. It never stores the plaintext password. Development migration and reset commands are also available:

```bash
npm run db:migrate
npm run db:reset
```

`db:reset` destroys data in the configured database. Use it only with the local MyDay development database.

Validate configuration, connectivity, migration behavior, and database relations with:

```bash
npm run prisma:validate
npm run prisma:generate
npm run db:check
npm run db:verify
```

The baseline migration includes PostgreSQL CHECK constraints for positive durations and recurrence intervals, non-negative positions/counts, non-empty required text, valid weekdays, and `endAt > startAt`.

## Development and verification

```bash
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

After seeding and starting the application, open `http://localhost:3000`. Unauthenticated requests are redirected to `/login`; a valid login lands on the protected `/today` placeholder. Use `SEED_USERNAME` and `SEED_PASSWORD` from the local environment. Authenticated visits to `/login` return to `/today`, and **Keluar** destroys the session and returns to `/login`. There is intentionally no registration flow.

Authentication uses a server-side Auth.js Credentials provider, Argon2id password verification, encrypted JWT session cookies, and a minimal session payload containing only the user's ID and username. Cookies are HTTP-only and SameSite-protected; Auth.js enables secure cookie naming and transport in production HTTPS environments. Authentication errors are deliberately generic so callers cannot distinguish an unknown username from an incorrect password.

The code includes a rate-limit integration boundary in `src/lib/auth/rate-limit.ts`, but no external limiter is configured in this phase. Before exposing MyDay outside a trusted local environment, connect that boundary to a distributed, persistent rate-limit service. An in-memory limiter is intentionally not used because it is unreliable across restarts and multiple application instances.

The production server can be started after a successful build:

```bash
npm run start
```

Product requirements and design documents are preserved in [`docs/`](docs/).
