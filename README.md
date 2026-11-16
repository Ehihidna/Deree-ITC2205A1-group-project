# Gym Tracker

ITC2205 group project: a workout tracker with an AI agent that generates
personalised training plans and suggests exercise replacements. The agent only
uses exercises from the catalogue, and every plan is checked against safety
rules before it is shown.

## Tech stack

| Part | Choice |
| --- | --- |
| Front end and API | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Database | PostgreSQL (Neon in production) through Prisma ORM 7 |
| AI model | Google Gemini API (through `lib/agent/`, behind an `LLMClient` interface) |
| Tests and CI | Vitest, ESLint, GitHub Actions |
| Hosting | Vercel (app) and Neon (database), free plans |
| Exercise catalogue | [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) (public domain), 876 exercises |

## Project layout

```
app/              Pages and API routes (Next.js App Router)
lib/db.ts         Shared Prisma client (server only)
lib/services/     Profile, catalogue, workout and plan services
lib/agent/        AI agent, LLMClient interface and Gemini client
lib/validation/   Plan validator (structure, catalogue, safety rules)
prisma/           Schema, migrations, exercise data and import script
tests/            Unit tests (Vitest)
```

`lib/generated/` holds the Prisma client. It is created by `npm install` and is
not committed.

## Getting started

Requirements: Node.js 22 or later and a PostgreSQL database (a local one, or a
free Neon project).

1. Install dependencies (this also generates the Prisma client):

   ```bash
   npm install
   ```

2. Create your `.env` file and fill in `DATABASE_URL` and `AUTH_SECRET`:

   ```bash
   cp .env.example .env
   ```

3. Create the tables:

   ```bash
   npm run db:migrate
   ```

4. Import the exercise catalogue (safe to run more than once):

   ```bash
   npm run db:seed
   ```

5. Start the development server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

   http://localhost:3000/api/health should report 876 exercises.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Unit tests |
| `npm run db:migrate` | Create a migration after changing `prisma/schema.prisma`, and apply it to your database |
| `npm run db:deploy` | Apply existing migrations (production, CI) |
| `npm run db:seed` | Import exercises |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Working on the code

- Work on a branch and open a pull request into `main`. CI (lint, type check,
  tests, migrations, import, build) must pass before merging.
- After changing `prisma/schema.prisma`, run `npm run db:migrate -- --name <change>`
  and commit the new folder in `prisma/migrations/`.
- The Prisma config file is `prisma7.config.ts`. Prisma 7.10 looks for it under
  this name; `prisma.config.ts` is reserved for Prisma 8.
- Keep secrets in `.env` only. The Gemini key must never reach the browser, so
  only use it in server code.
