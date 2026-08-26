# @tcms/web

Next.js 16 (App Router, React 19.2) frontend for the Tissue Culture Management System, talking to [`@tcms/api`](../api).

## Setup

```bash
npm install
cp .env.example .env.local   # point API_BASE_URL at your running API
npm run dev
```

Requires `@tcms/api` running (see [apps/api/README.md](../api/README.md)) and seeded with an admin user (`npm run seed` in `apps/api`) to log in.

## How auth works

- Login posts to the NestJS API's `/auth/login`, and the returned JWT is stored in an **httpOnly** cookie (`tcms_session`) set server-side — never exposed to client JS. See [`src/lib/session.ts`](src/lib/session.ts).
- Every Server Component/Action reads that cookie and forwards it as a `Bearer` header via [`src/lib/api.ts`](src/lib/api.ts)'s `apiFetch`. The NestJS API is the real trust boundary — it re-validates the token and role on every request.
- [`src/proxy.ts`](src/proxy.ts) (Next 16 renamed `middleware.ts` → `proxy.ts`) does an **optimistic** cookie-presence check to redirect unauthenticated users before a page even renders. [`src/app/(app)/layout.tsx`](<src/app/(app)/layout.tsx>) does the real check via `requireSession()` ([`src/lib/dal.ts`](src/lib/dal.ts)).
- Role-gating: `hasRole(session, ...)` conditionally renders admin/manager-only forms; the API enforces the same roles server-side regardless of what the UI shows.

## Module structure

Mirrors the API's modules — see [`src/components/shell/nav-items.ts`](src/components/shell/nav-items.ts) for the nav, and [`docs/03-api-specification.md`](../../docs/03-api-specification.md) at the repo root for the endpoints each page calls.

| Route | Notes |
|---|---|
| `/batches`, `/batches/[id]` | List + create; detail page renders the self-referencing lineage tree |
| `/vessels` | Barcode lookup (the scan-first flow) + vessel registration |
| `/media-prep/chemicals` | List/create + manual stock adjustment |
| `/media-prep/recipes`, `/recipes/[id]` | Recipe builder (dynamic component rows) + quantity calculator |
| `/media-prep/media-batches`, `/media-batches/[id]` | Prepare a batch (auto-deducts stock) + autoclave logging |
| `/subculture/workstations` | List/create |
| `/subculture/sessions` | Start session (scan-in) / complete session (split + scan-out) |
| `/qc/contamination-events` | Log + list |
| `/qc/discard-logs` | Log only — no list endpoint on the API (matches the Phase 1 scope) |
| `/users` | Admin only |

**Not built here** (Phase 2 per [`docs/05-roadmap.md`](../../docs/05-roadmap.md), since the API doesn't expose them yet): QC analytics dashboard, yield projection, environmental logging, sales orders.

## Known gaps in this pass

- Subculture sessions and contamination logging take a raw **vessel UUID**, not a scanned barcode — the API's `/subculture-sessions` and `/contamination-events` endpoints take vessel IDs directly. Resolving a scanned barcode to a UUID client-side (via `/vessels/lookup/:barcode`) before submit is the natural next step for the real scan-first workflow in [`docs/04-ux-workflows.md`](../../docs/04-ux-workflows.md).
- No camera-based barcode scanning yet — `Vessel Lookup` and the ID fields are text input for now.
- Create forms don't reset after a successful submission (values persist, which is occasionally convenient for entering several similar rows, but isn't a deliberate design decision).

## Stack notes (Next.js 16)

This scaffold was built against `next@16`, not `next@15` — some conventions changed:

- `middleware.ts` → `proxy.ts`, exported function renamed `middleware` → `proxy`.
- `cookies()`/`headers()` are async-only (no more sync compat mode).
- Turbopack is the default bundler for both `dev` and `build`.

`node_modules/next/dist/docs/` ships version-matched docs — check there before assuming an older API still applies.
