# API Specification

REST/JSON, versioned under `/api/v1`. Bearer JWT auth on every route except `/auth/login`. Each route lists the minimum role required (see [RBAC matrix](01-architecture-overview.md#3-roles--permissions-rbac)).

## Auth

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/login` | any | Email/password → JWT |
| POST | `/auth/refresh` | authenticated | Refresh token |
| GET | `/auth/me` | authenticated | Current user + role |

## Users (Admin)

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/users` | admin | List users |
| POST | `/users` | admin | Create user |
| PATCH | `/users/:id` | admin | Update role/active status |

## Batch & Container Tracking

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/batches` | technician+ | List/filter batches (species, stage, status) |
| POST | `/batches` | technician+ | Create batch (initiation or child of parent_batch_id) |
| GET | `/batches/:id` | technician+ | Batch detail |
| GET | `/batches/:id/lineage` | technician+ | Full ancestor/descendant tree |
| GET | `/vessels/:id` | technician+ | Vessel detail (by UUID or scanned barcode) |
| GET | `/vessels/lookup/:barcode` | technician+ | Resolve a scanned barcode to a vessel |
| POST | `/vessels` | technician+ | Register a new vessel (initiation only; subculture output is created via `/subculture-sessions`) |
| PATCH | `/vessels/:id/status` | technician+ | Update status (active/discarded/transferred) |
| GET | `/vessels/:id/history` | technician+ | Full audit log of events for a vessel |

## Media Preparation

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/chemicals` | media_prep+ | List raw chemicals & stock levels |
| POST | `/chemicals` | media_prep+ | Add chemical |
| PATCH | `/chemicals/:id/stock` | media_prep+ | Manual stock adjustment (creates `inventory_transactions` row) |
| GET | `/recipes` | media_prep+ | List recipes |
| POST | `/recipes` | media_prep+ | Create recipe with components |
| POST | `/recipes/:id/calculate` | media_prep+ | Given target volume, return computed chemical quantities |
| GET | `/media-batches` | media_prep+ | List media batches (status, expiration) |
| POST | `/media-batches` | media_prep+ | Create media batch from a recipe → auto-deducts chemical stock |
| POST | `/media-batches/:id/autoclave-log` | media_prep+ | Log autoclave cycle (temp/pressure/duration/result) |

## Cleanroom & Subculturing

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/workstations` | technician+ | List workstations |
| POST | `/subculture-sessions` | technician+ | Open a session (workstation, operator, input vessel(s)) |
| PATCH | `/subculture-sessions/:id/complete` | technician+ | Close session: register N output vessels, split ratio |
| GET | `/subculture-sessions/:id/yield-projection` | technician+ | Historical multiplication-rate projection for the batch/species |

## Contamination & QC

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/contamination-events` | technician+ | Log a contamination event |
| GET | `/contamination-events` | technician+ | List/filter (type, media batch, workstation, location, date range) |
| GET | `/qc/analytics/root-cause` | manager+ | Aggregated contamination rate by media batch / operator / workstation / location |
| GET | `/qc/analytics/mortality-rate` | manager+ | Discard/mortality rate by stage, species, time period |
| POST | `/discard-logs` | technician+ | Log a discard event |

## Environmental Monitoring

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/locations` | technician+ | List rooms/locations |
| POST | `/environmental-logs` | technician+ | Manual reading entry |
| POST | `/environmental-logs/ingest` | service (IoT) | Webhook/MQTT-bridge ingestion endpoint, API-key auth |
| GET | `/locations/:id/environmental-logs` | technician+ | Time series for a location |

## Inventory & Orders

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/inventory/low-stock` | media_prep+ | Chemicals/items below reorder threshold |
| GET | `/customers` | manager+ | List customers |
| POST | `/customers` | manager+ | Create customer |
| GET | `/sales-orders` | manager+ | List/filter orders |
| POST | `/sales-orders` | manager+ | Create order with line items |
| POST | `/sales-orders/:id/fulfillments` | manager+ | Link vessel(s) to a line item and mark dispatched |

## Conventions

- Pagination: `?page=&pageSize=` on all list endpoints, response envelope `{ data, meta: { total, page, pageSize } }`.
- Filtering: query params per listed filter dimension; unknown params ignored.
- Errors: standard `{ error: { code, message, details? } }`, HTTP status matches semantics (400/401/403/404/409/422).
- All mutating endpoints return the full updated resource.
- Barcode scans in the cleanroom UI resolve through `/vessels/lookup/:barcode` before any mutating call — the barcode itself is never a foreign key.
