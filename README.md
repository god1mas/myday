# MyDay

MyDay is a personal daily planner and task manager. The repository contains the application foundation and the Phase 1 MVP database baseline; application features begin in later phases.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL 17
- Prisma ORM 7
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
- `AUTH_SECRET`: reserved for the Phase 2 authentication implementation
- `SEED_USERNAME` and `SEED_PASSWORD`: personal user credentials used by the database seed

Never use the example development credentials in production.

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
npm run lint
npm run typecheck
npm run build
```

The production server can be started after a successful build:

```bash
npm run start
```

Product requirements and design documents are preserved in [`docs/`](docs/).
