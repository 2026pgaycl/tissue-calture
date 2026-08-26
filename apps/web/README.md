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

## Scan-first vessel fields

Subculture sessions, contamination events, and discard logs all reference a vessel — but the API's `/subculture-sessions`, `/contamination-events`, and `/discard-logs` endpoints take a vessel **UUID**, not a barcode. [`VesselBarcodeField`](src/components/vessel-barcode-field.tsx) bridges that: type or scan a barcode, it resolves via `resolveVesselByBarcode` ([`src/lib/actions/vessels.ts`](src/lib/actions/vessels.ts)) against `GET /vessels/lookup/:barcode`, shows a confirm-before-context card (stage + status, per [`docs/04-ux-workflows.md`](../../docs/04-ux-workflows.md)'s scan-first pattern), and only then populates a hidden input with the real UUID for the enclosing form to submit. Resolution fires on blur or Enter — no separate "confirm" step to click through when typing/scanning normally. The subculture start-session form uses a repeatable list of these (one per input vessel, same dynamic-rows pattern as the recipe builder), since a session can fan in from more than one vessel.

## Camera barcode scanning

The 📷 button next to every barcode field (`VesselBarcodeField` and the Vessel Lookup search bar) opens [`BarcodeScanner`](src/components/barcode-scanner.tsx) — a camera overlay that decodes a QR/barcode from the live video feed via `@zxing/browser`'s `BrowserMultiFormatReader`, requesting the rear (`facingMode: "environment"`) camera on phones/tablets. It's a single-shot scan: first successful decode stops the camera and fills the field, and the camera stream is always torn down on close/unmount (component cleanup calls `controls.stop()` — leaving a camera running is the classic bug here). `NotAllowedError` (permission denied) and "no camera found" get distinct, visible error states rather than an infinite spinner.

Chrome/Edge ship a native `BarcodeDetector` API that could do this decode without a library, but Safari and Firefox don't implement it — `@zxing/browser` works everywhere `getUserMedia` does, which is the actual constraint for a real cleanroom tablet deployment.

**Closing the loop without physical labels:** since nothing prints real barcode labels in this scaffold, vessels are also rendered as scannable QR codes — [`BarcodeQr`](src/components/barcode-qr.tsx) (a Server Component, `qrcode`'s `toDataURL` run server-side, zero client JS) on the Vessel Lookup result, and [`ClientBarcodeQr`](src/components/barcode-qr-client.tsx) (`qrcode`'s `toCanvas`, since a `"use client"` file can't import an async Server Component) on the vessel-registration success state. Pull a vessel's QR up on one screen/device and scan it with another to test the flow end-to-end.

Requires a secure context (`https://` or `localhost`) — `getUserMedia` refuses to run otherwise, so this will silently need HTTPS once deployed anywhere but local dev.

## Known gaps in this pass

- Create forms don't reset after a successful submission (values persist, which is occasionally convenient for entering several similar rows, but isn't a deliberate design decision).

## Stack notes (Next.js 16)

This scaffold was built against `next@16`, not `next@15` — some conventions changed:

- `middleware.ts` → `proxy.ts`, exported function renamed `middleware` → `proxy`.
- `cookies()`/`headers()` are async-only (no more sync compat mode).
- Turbopack is the default bundler for both `dev` and `build`.

`node_modules/next/dist/docs/` ships version-matched docs — check there before assuming an older API still applies.
