# SPHERE Agents

## Project Structure

- **api/** — Express + MongoDB + Redis backend (TypeScript)
- **frontend/** — React + Vite + TailwindCSS v4 frontend
- Package manager: **pnpm** (not npm/yarn)

## Developer Commands

```bash
pnpm run install    # Install dependencies for both packages
pnpm run dev        # Run API + Vite dev servers concurrently (from root)
pnpm run dev:setup  # Run MongoDB and Redis containers locally with Docker Compose. Also seeds MongoDB with test data. It must be run BEFORE dev commands.
pnpm run test       # Run API tests (vitest) then reseed MongoDB
pnpm run build      # Build both frontend and api
```

## Running Single Test / Package

```bash
cd api && npx vitest --run --test-name-pattern "<pattern>"
```

## Prerequisites (required for dev and tests)

- **MongoDB** — must be running with a seeded database
- **MiniZinc** — required for analytics/pricing optimization; must have `gecode` solver available

  If analytics return 500, verify with:
  ```bash
  minizinc --solvers  # gecode must appear in output
  ```

## Important Quirks

- `test` script runs `seed:mongo-local:small` **after** tests to reset state
- Tests run sequentially (`fileParallelism: false` in vitest.config.ts)
- API entry point: `api/src/main/backend.ts`
- Migrations auto-run via `npx migrate up` in `dev:api` script
- API uses `ts-migrate-mongoose` for MongoDB migrations

## Lint Config

- API: `api/eslint.config.ts` (TypeScript-eslint, semi required)
- Frontend: `frontend/eslint.config.js`