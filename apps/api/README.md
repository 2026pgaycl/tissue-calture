# @tcms/api

Prisma schema and data layer for the Tissue Culture Management System. Mirrors [`docs/02-database-schema.md`](../../docs/02-database-schema.md) — update both together.

## Setup

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL for your local Postgres
npm run prisma:generate
```

## Apply the schema to a database

Once `DATABASE_URL` in `.env` points at a running PostgreSQL instance:

```bash
npx prisma migrate deploy   # applies prisma/migrations/20260826222338_init
```

For further schema changes during development, use `npm run prisma:migrate` (wraps `prisma migrate dev`) instead of hand-editing SQL.

## Notes

- Prisma 7 requires a driver adapter at runtime (no more implicit `DATABASE_URL` reads inside `PrismaClient`). See [`src/lib/prisma.ts`](src/lib/prisma.ts) — it wires up `@prisma/adapter-pg` from `process.env.DATABASE_URL`.
- Connection config for the CLI (`migrate`, `db pull`, etc.) lives in `prisma7.config.ts`, not in `schema.prisma` — that's a Prisma 7 change, not a mistake.
- `generated/prisma` (the generated client) and `.env` are gitignored; regenerate with `npm run prisma:generate` after cloning or after any schema change.

## Scripts

| Script | Purpose |
|---|---|
| `npm run prisma:generate` | Regenerate the Prisma Client into `generated/prisma` |
| `npm run prisma:migrate` | Create/apply a dev migration from schema changes |
| `npm run prisma:studio` | Open Prisma Studio against `DATABASE_URL` |
| `npm run prisma:format` | Format `schema.prisma` |
| `npm run prisma:validate` | Validate `schema.prisma` without a DB connection |
