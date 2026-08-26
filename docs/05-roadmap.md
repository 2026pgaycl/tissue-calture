# Implementation Roadmap

## Phase 1 — MVP (foundation + core traceability)

Goal: replace spreadsheets for the two things that matter most day-to-day — knowing what's in the room and being able to trace a contamination back to its source.

- Auth + RBAC (4 roles), user management
- Batch & vessel CRUD with self-referencing lineage, barcode/QR generation and scanning
- Subculture session flow (scan-in, split, scan-out, output labels)
- Media recipe builder + auto-calculated quantities + media batch creation with inventory deduction
- Autoclave batch logging
- Contamination event logging (manual, no analytics yet) + discard logging
- Raw chemical inventory with manual stock adjustment and low-stock flag (no automated alerts yet)
- Basic vessel history / audit log view

**Exit criteria:** a technician can take a jar from scan to subculture to label print without leaving the app; a manager can pull a vessel's full lineage and see every event against it.

## Phase 2 — Operational Depth

- QC root-cause analytics dashboard (contamination rate by media batch/operator/workstation/location, trend over time)
- Multiplier/yield calculator using historical multiplication rates per species/stage
- Automated low-stock alerts (email/in-app) tied to reorder thresholds
- Manual environmental logging per growth room (temp, humidity, PAR, photoperiod)
- Sales order management: customers, orders, line items, fulfillment linked to acclimatized (Stage IV) batches
- Offline-tolerant scan queueing for the tablet PWA
- Exportable reports (CSV/PDF) for contamination, inventory, and production summaries

**Exit criteria:** a lab manager can identify a problem media batch or workstation from the dashboard without manually cross-referencing logs, and a completed order can be fulfilled and dispatched entirely in-app.

## Phase 3 — Advanced Analytics & IoT

- IoT sensor integration for growth rooms via MQTT broker + REST ingestion webhook, replacing manual environmental entry where sensors exist
- Predictive contamination risk scoring (flagging media batches/workstations trending toward failure before a full outbreak)
- Species/recipe-level yield forecasting and capacity planning against pending sales orders
- Multi-site/multi-room support if the lab operates more than one facility
- Full audit/compliance export (for research labs needing chain-of-custody documentation)

**Exit criteria:** environmental data flows in automatically, and the system can proactively flag emerging contamination trends rather than only explaining ones that already happened.

## Cross-Cutting (all phases)

- Automated tests: unit (recipe calculation, lineage queries), integration (subculture session state transitions), e2e (three core flows in [docs/04-ux-workflows.md](04-ux-workflows.md))
- Database migrations versioned via Prisma Migrate from day one
- CI: lint + typecheck + test on every PR
