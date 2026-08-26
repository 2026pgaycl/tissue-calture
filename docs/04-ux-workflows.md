# UX Workflow Plan

Three core flows, designed mobile-first for tablets with attached/embedded barcode scanners used inside the cleanroom.

## A. Media Prep Flow (Media Prep Staff)

```mermaid
flowchart TD
    A[Dashboard: low-stock alerts + expiring media] --> B[Select recipe]
    B --> C[Enter target volume]
    C --> D[Auto-calculated chemical quantities shown]
    D --> E{Stock sufficient?}
    E -- No --> F[Block: flag insufficient chemical, link to reorder]
    E -- Yes --> G[Confirm prep: creates media_batch, deducts inventory]
    G --> H[Print media batch barcode label]
    H --> I[Autoclave: log temp/pressure/duration/operator]
    I --> J{Pass?}
    J -- Yes --> K[Status: available, expiration date set]
    J -- No --> L[Status: failed_autoclave, batch excluded from use]
```

**Key screens**
1. **Recipe picker** — searchable list, shows basal media type and last-used date.
2. **Volume + calculation** — single numeric input drives a live-computed table (chemical, concentration, required qty, current stock, sufficient ✓/✗).
3. **Confirmation** — one tap commits the media batch and prints/generates the barcode label.
4. **Autoclave log** — form tied to the just-created batch; pass/fail gates whether the batch becomes usable.

## B. Subculturing Session Flow (Lab Technician, laminar flow hood)

```mermaid
flowchart TD
    A[Start session: select workstation, auto-fill operator] --> B[Scan input vessel barcode]
    B --> C[Vessel detail confirmed: batch, species, stage, media]
    C --> D[Enter split ratio / output vessel count]
    D --> E[System suggests output stage based on current stage]
    E --> F[Print N output vessel barcodes]
    F --> G[Scan each new output vessel to confirm placement]
    G --> H{More input vessels this session?}
    H -- Yes --> B
    H -- No --> I[Complete session]
    I --> J[Session logged: audit trail + yield vs. historical multiplication rate]
```

**Key screens**
1. **Session start** — workstation dropdown (defaults to last used), operator auto-filled from login.
2. **Scan-in** — full-screen camera/scanner target; on match, shows a confirmation card (species, stage, days in culture, media batch) before proceeding — prevents acting on the wrong vessel.
3. **Split & output** — numeric split ratio input; live yield projection ("expected 8–12 vessels based on last 20 sessions for this species/stage").
4. **Label + scan-out** — batch-prints output labels; each is scanned once to confirm physical placement, closing the loop between the system and the physical jar.
5. **Session summary** — read-only recap before submit; edits require reopening.

## C. QC Contamination Logging Flow (Lab Technician / Lab Manager)

```mermaid
flowchart TD
    A[Scan or search affected vessel] --> B[Vessel context auto-populated: batch, media batch, workstation, location, operator history]
    B --> C[Select contamination type: bacterial / fungal / viral / unknown / mixed]
    C --> D[Select action: isolate / discard / treat]
    D --> E[Add notes / optional photo]
    E --> F[Submit contamination_event]
    F --> G{Action = discard?}
    G -- Yes --> H[Auto-create discard_log, vessel status → discarded]
    G -- No --> I[Vessel status → contaminated, remains tracked]
    F --> J[Dashboard updates: root-cause analytics refresh]
```

**Key screens**
1. **Scan/search** — same scan-first pattern as subculturing, so technicians never hand-type vessel IDs mid-contamination-response.
2. **Auto-populated context panel** — media batch, workstation, and preparing/operating staff are shown read-only, since these are exactly the dimensions root-cause analytics slice on.
3. **Type + action form** — minimal required taps; type and action are the two fields analytics depend on most.
4. **QC Analytics Dashboard** (Lab Manager+) — filterable charts: contamination rate by media batch, by workstation, by operator, by location, over time; flags outlier media batches (e.g., a single autoclave run correlating with a contamination spike) for investigation.

## Shared Interaction Principles

- **Scan-first, type-second** — every flow that touches a physical vessel starts with a scan; manual ID entry is a fallback, not the default.
- **Confirm-before-context** — after any scan, show a confirmation card of what was matched before allowing state-changing actions, to catch mis-scans.
- **Large touch targets, high contrast** — cleanroom tablets are often operated with gloved hands under bright task lighting.
- **Offline tolerance (Phase 2+)** — scan events queue locally and sync when connectivity returns, since cleanrooms/growth rooms may have poor Wi-Fi.
