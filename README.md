# MyDay

MyDay is a personal daily planner and task manager. This repository currently contains the Phase 0 development foundation; business features begin in later phases.

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
- `SEED_USERNAME` and `SEED_PASSWORD`: reserved for future local seed data

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

## Prisma

Phase 0 intentionally contains no business models or migrations. Validate the configuration and generate the client with:

```bash
npm run prisma:validate
npm run prisma:generate
npm run db:check
```

Phase 1 will add the database baseline and initial migration.

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
