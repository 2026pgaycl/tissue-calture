# @tcms/api

NestJS REST API for the Tissue Culture Management System, backed by Prisma/PostgreSQL. Mirrors [`docs/02-database-schema.md`](../../docs/02-database-schema.md) and [`docs/03-api-specification.md`](../../docs/03-api-specification.md) — update these together.

## Setup

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL and JWT_SECRET for your local Postgres
npm run prisma:generate
```

## Apply the schema to a database

Once `DATABASE_URL` in `.env` points at a running PostgreSQL instance:

```bash
npx prisma migrate deploy   # applies prisma/migrations/20260828130343_init_with_tenancy
npm run seed                # bootstraps the first organization + admin user (SEED_ORG_*/SEED_ADMIN_* in .env)
npm run start:dev
```

For further schema changes during development, use `npm run prisma:migrate` (wraps `prisma migrate dev`) instead of hand-editing SQL.

## Local Postgres instance

This machine already runs a system-wide PostgreSQL 18 Windows service (`postgresql-x64-18`, port 5432), but its `postgres` superuser password wasn't available and couldn't be reset, so dev setup uses a **second, self-contained instance** instead — same binaries, separate data directory, separate port, no admin rights or Docker required:

- Data directory: `apps/api/.pgdata` (gitignored — this is local state, not source)
- Port: **5433** (the system service stays on 5432, untouched)
- Superuser: `tcms` / `tcms_dev_pw` (only valid for this instance's cluster)
- `DATABASE_URL` in `.env`/`.env.example` already points at it: `postgresql://tcms:tcms_dev_pw@127.0.0.1:5433/tcms_dev`

Start/stop it with the Postgres binaries already on this machine (adjust the path if yours differs):

```powershell
# Start
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "apps\api\.pgdata" -l "apps\api\.pgdata-log.txt" -o "-p 5433 -c listen_addresses=127.0.0.1" start

# Stop
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "apps\api\.pgdata" stop
```

If this repo moves to a machine with its own Postgres (or you'd rather use the system service, Docker, or a managed instance), just point `DATABASE_URL` at that instead — nothing else in the app assumes this specific setup.

## Module structure

| Module | Covers |
|---|---|
| `auth/` | Login, JWT issuing, `JwtStrategy` (Passport) |
| `users/` | Admin-only user management (RBAC bootstrap target — see below) |
| `reference-data/` | Plant species, locations — reference tables other modules FK against |
| `batches/` | Batches, vessels, self-referencing lineage (`GET /batches/:id/lineage` via recursive CTE) |
| `media-prep/` | Chemicals, recipes (+ quantity calculation), media batches (+ inventory deduction), autoclave logs |
| `subculture/` | Workstations, subculture sessions (scan-in → split → scan-out) |
| `qc/` | Contamination events, discard logs |
| `common/` | `@Public()`/`@Roles()` decorators, `JwtAuthGuard`/`RolesGuard` (applied globally in `app.module.ts`), the shared error-envelope filter |
| `prisma/` | `PrismaService` — Prisma Client wired to the `pg` driver adapter |

**RBAC bootstrap:** `POST /users` requires `ADMIN`, so nothing can create the first admin through the API. Run `npm run seed` once against a fresh database to create the first organization + admin from `SEED_ORG_*`/`SEED_ADMIN_*` in `.env`.

**Deferred to Phase 2** (per [`docs/05-roadmap.md`](../../docs/05-roadmap.md), not built here): QC root-cause/mortality analytics, subculture yield projection, environmental logging, and the customers/sales-orders module. `docs/03-api-specification.md` documents their target shape.

## Multi-tenancy

Every table carries an `organization_id` FK (see [`docs/02-database-schema.md`](../../docs/02-database-schema.md)'s multi-tenancy note), and every service method scopes both reads and writes by `user.organizationId` from the JWT (added to `JwtPayload`/`AuthenticatedUser` in [`src/auth/jwt-payload.interface.ts`](src/auth/jwt-payload.interface.ts)). Verified live: a second organization's admin gets zero rows back from `/plant-species`, `/locations`, and `/batches` despite the first organization having real data.

**What this does not yet cover:**

- **Nested foreign keys aren't ownership-checked everywhere.** `Batch.parentBatchId` and `Vessel.batchId` are validated against the caller's org on create (the two with the highest blast radius — lineage and physical containers). Other nested references (a recipe's `gellingAgentId`, a recipe component's `chemicalId`, a contamination event's `workstationId`) aren't — a caller who already knows another org's UUID could point their own record at it. Lower severity (it doesn't expose the other org's data, just creates a dangling/incorrect reference) but still worth closing before this is a real multi-tenant deployment.
- **No signup/organization-creation flow.** New organizations only exist via direct DB/seed access right now (see the isolation test in the commit history) — there's no `POST /organizations` or self-serve signup.
- **Enforcement is manual, not systemic.** Every service method threads `organizationId` through by hand; nothing stops a future PR from adding a new `findMany` and forgetting the filter. A Prisma Client Extension that auto-injects `organizationId` into every query (keyed off request-scoped `AsyncLocalStorage`) would remove that risk — worth doing before this holds real customer data, not required to keep developing against it.

## Notes

- Prisma 7 requires a driver adapter at runtime (no implicit `DATABASE_URL` reads inside `PrismaClient`). See [`src/prisma/prisma.service.ts`](src/prisma/prisma.service.ts) — it wires up `@prisma/adapter-pg` from `process.env.DATABASE_URL`.
- Connection config for the CLI (`migrate`, `db pull`, etc.) lives in `prisma7.config.ts`, not in `schema.prisma` — that's a Prisma 7 change, not a mistake.
- **Generator choice matters.** The schema uses `provider = "prisma-client-js"` (the classic generator, output to `node_modules/@prisma/client`) instead of Prisma 7's new default `"prisma-client"`. The new generator emits ESM-only code (`import.meta.url` at module scope, `.ts`-extension imports) that cannot run under this project's CommonJS build — it broke `nest build`'s output at runtime. Don't switch generators without re-verifying `npm run build && node dist/main.js` actually boots.
- `.env` is gitignored; copy `.env.example` after cloning.

## Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Run the API with file-watch reload |
| `npm run build` / `npm run start:prod` | Compile to `dist/` and run it |
| `npm run seed` | Bootstrap the first organization + admin user |
| `npm run prisma:generate` | Regenerate the Prisma Client |
| `npm run prisma:migrate` | Create/apply a dev migration from schema changes |
| `npm run prisma:studio` | Open Prisma Studio against `DATABASE_URL` |
| `npm run prisma:format` / `prisma:validate` | Format / validate `schema.prisma` |
