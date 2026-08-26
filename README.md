# Tissue Culture Management System (TCMS)

A production/research management platform for plant tissue culture laboratories: batch and container lineage tracking, media preparation, cleanroom subculturing logs, contamination/QC, environmental monitoring, and inventory/order fulfillment.

## Status

Architecture & design phase. No application code yet — see [`docs/05-roadmap.md`](docs/05-roadmap.md) for the phased build plan starting with Phase 1 (MVP).

## Recommended Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (React), TypeScript, responsive for tablet/mobile barcode scanning in the cleanroom |
| Backend | Node.js + TypeScript (NestJS), REST API |
| Database | PostgreSQL (self-referencing lineage trees, strong relational integrity) |
| ORM | Prisma |
| Auth | JWT sessions + Role-Based Access Control (RBAC) |
| IoT ingestion (Phase 3) | MQTT broker + REST webhook fallback |

## Documentation Index

1. [Architecture Overview & RBAC](docs/01-architecture-overview.md) — modules, system diagram, roles/permissions
2. [Database Schema / ERD](docs/02-database-schema.md) — entities, relationships, lineage model, table definitions
3. [API Specification](docs/03-api-specification.md) — REST endpoint architecture by module
4. [UX Workflows](docs/04-ux-workflows.md) — Media Prep, Subculturing Session, QC Contamination Logging
5. [Implementation Roadmap](docs/05-roadmap.md) — Phase 1 MVP → Phase 3 Advanced Analytics/IoT
