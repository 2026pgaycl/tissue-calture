export interface HelpField {
  label: string;
  example: string;
  note?: string;
}

export interface HelpBlock {
  /** Sub-form or repeatable-row group within a section, e.g. "Adjust stock" or "Components". */
  title: string;
  repeatable?: boolean;
  fields: HelpField[];
}

export interface HelpSection {
  id: string;
  title: string;
  path: string;
  roles: string;
  description: string;
  blocks: HelpBlock[];
  tips: string[];
}

export const SEEDED_REFERENCE = {
  species: ["Banana", "Dendrobium Orchid", "Vanilla", "Potato"],
  locations: ["Cleanroom A", "Growth Room 1", "Greenhouse 1", "Cold Storage"],
  workstations: ["Hood 1", "Hood 2"],
  chemicals: [
    "MS Basal Salts (10x) — 43.4 g/L stock",
    "Sucrose — 300 g/L stock",
    "Agar — 80 g/L stock",
    "BAP (6-Benzylaminopurine) — 1 mg/mL stock",
    "NAA (Naphthaleneacetic acid) — 1 mg/mL stock",
    "Thiamine HCl — 1 mg/mL stock",
  ],
  recipe: "MS Multiplication Medium (MS, pH 5.8)",
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "batches",
    title: "Batches",
    path: "/batches",
    roles: "Admin, Lab Manager, Lab Technician",
    description:
      "Creates a lineage group at a given stage. Vessels belong to a batch; batches can chain into a parent → child lineage tree as a plant moves stage.",
    blocks: [
      {
        title: "New batch",
        fields: [
          { label: "Species", example: "Banana" },
          { label: "Stage", example: "I — Initiation" },
          {
            label: "Source type (initiation only)",
            example: "EXPLANT",
            note: "Only fill this in when Stage is Initiation and there's no parent batch — leave it blank otherwise.",
          },
          {
            label: "Parent batch ID (optional)",
            example: "(leave blank)",
            note: "Leave blank for a brand-new initiation batch. To advance an existing batch to its next stage instead, open that batch's detail page, copy its ID from the page heading or the URL, and paste it here alongside the new Stage.",
          },
        ],
      },
    ],
    tips: [
      "Batch IDs are not barcodes — they identify a lineage group, not a physical container. Find one on a batch's detail page (the URL is /batches/<id>) or in the Batches table.",
      "Creating a batch doesn't create any vessels. Do that next on Vessel Lookup → Register a new vessel.",
    ],
  },
  {
    id: "vessels",
    title: "Vessel Lookup & Registration",
    path: "/vessels",
    roles: "Admin, Lab Manager, Lab Technician (registration); anyone signed in (lookup)",
    description:
      "Look up a vessel by barcode to see its status and history, or register a new physical vessel (jar/tray/tube/bag) against an existing batch.",
    blocks: [
      {
        title: "Register a new vessel",
        fields: [
          { label: "Batch", example: "I — Initiation · (pick any batch from the dropdown)" },
          { label: "Vessel type", example: "JAR" },
          { label: "Location", example: "Growth Room 1" },
        ],
      },
    ],
    tips: [
      "After registering, the success message shows the new vessel's barcode (e.g. VSL-3750B567A6) plus a scannable QR code — that barcode is what every other form's \"Vessel barcode\" field expects.",
      "The 📷 button next to any barcode field opens a live camera scanner; typing the barcode by hand and pressing Enter or Look up works identically.",
    ],
  },
  {
    id: "chemicals",
    title: "Chemicals",
    path: "/media-prep/chemicals",
    roles: "Admin, Lab Manager, Media Prep Staff",
    description: "Raw chemical inventory: stock solutions, salts, sugars, gelling agents — whatever a recipe draws from.",
    blocks: [
      {
        title: "Add chemical",
        fields: [
          { label: "Name", example: "BAP (6-Benzylaminopurine)" },
          { label: "Category", example: "PGR" },
          { label: "Stock concentration", example: "1" },
          { label: "Unit", example: "mg/mL" },
          { label: "Reorder threshold", example: "50" },
          { label: "Supplier", example: "Sigma-Aldrich (optional)" },
        ],
      },
      {
        title: "Adjust stock",
        fields: [
          { label: "Chemical", example: "Sucrose" },
          {
            label: "Quantity (+ receipt / − adjustment)",
            example: "500 to add stock, -50 to record usage/write-off",
          },
        ],
      },
    ],
    tips: [
      "Stock concentration + Unit describe the solution on your shelf (e.g. \"1 mg/mL\" for a PGR stock, \"43.4 g/L\" for a 10x salts stock) — this is the denominator the Recipe calculator divides by.",
      "Quantity in Adjust stock is a delta, not a new total: positive receipts add to stock, negative values subtract.",
    ],
  },
  {
    id: "recipes",
    title: "Media Recipes",
    path: "/media-prep/recipes",
    roles: "Admin, Lab Manager, Media Prep Staff",
    description: "Defines a media formulation — basal media, target pH, and every chemical component — and calculates quantities needed for a given volume.",
    blocks: [
      {
        title: "New recipe",
        fields: [
          { label: "Name", example: "MS Rooting Medium" },
          { label: "Basal media type", example: "MS" },
          { label: "Target pH", example: "5.8" },
        ],
      },
      {
        title: "Components (repeat “+ Add component” per chemical)",
        repeatable: true,
        fields: [
          { label: "Chemical · Concentration · Unit", example: "MS Basal Salts (10x) · 4.34 · g/L" },
          { label: "Chemical · Concentration · Unit", example: "Sucrose · 30 · g/L" },
          { label: "Chemical · Concentration · Unit", example: "Agar · 8 · g/L" },
          { label: "Chemical · Concentration · Unit", example: "NAA · 0.5 · mg/L" },
        ],
      },
      {
        title: "Calculate quantities (on a recipe's detail page)",
        fields: [{ label: "Target volume (L)", example: "1" }],
      },
    ],
    tips: [
      "Match each component's Unit to how that chemical's Stock concentration is expressed: a chemical stocked at \"1 mg/mL\" wants a component concentration in \"mg/L\"; one stocked at \"43.4 g/L\" wants \"g/L\". The formula is (target ÷ stock) × volume — mismatched units give meaningless numbers, not an error.",
      "A real medium usually has 4–6 components: basal salts, sugar, gelling agent, and one or more PGRs/vitamins.",
    ],
  },
  {
    id: "media-batches",
    title: "Media Batches",
    path: "/media-prep/media-batches",
    roles: "Admin, Lab Manager, Media Prep Staff",
    description: "Prepares an actual batch of media from a recipe (deducting chemical stock automatically) and logs its autoclave cycle.",
    blocks: [
      {
        title: "Prepare media batch",
        fields: [
          { label: "Recipe", example: "MS Multiplication Medium" },
          { label: "Target volume (L)", example: "1" },
          { label: "Expiration date", example: "(pick a date ~30 days out)" },
        ],
      },
      {
        title: "Log autoclave cycle (on a media batch's detail page)",
        fields: [
          { label: "Cycle date", example: "(today, e.g. 2026-08-27T09:00)" },
          { label: "Temp (°C)", example: "121" },
          { label: "Pressure (kPa)", example: "103" },
          { label: "Duration (min)", example: "20" },
          { label: "Result", example: "PASS" },
        ],
      },
    ],
    tips: [
      "Preparing a batch immediately deducts every recipe component from chemical stock. If anything doesn't have enough on hand, the form names exactly which chemical and by how much, and blocks creation — nothing is partially deducted.",
      "A media batch only becomes usable (status AVAILABLE) after a PASS autoclave log; a FAIL marks it FAILED_AUTOCLAVE.",
    ],
  },
  {
    id: "workstations",
    title: "Workstations",
    path: "/subculture/workstations",
    roles: "Admin, Lab Manager",
    description: "Laminar-flow hoods used for subculturing sessions.",
    blocks: [
      {
        title: "Add workstation",
        fields: [
          { label: "Name", example: "Hood 3" },
          { label: "Location", example: "Cleanroom A" },
          { label: "Hood type", example: "Class II BSC (optional)" },
        ],
      },
    ],
    tips: ["Only Admin and Lab Manager can add workstations — Lab Technicians use them but don't configure them."],
  },
  {
    id: "subculture-sessions",
    title: "Subculture Sessions",
    path: "/subculture/sessions",
    roles: "Admin, Lab Manager, Lab Technician",
    description: "The scan-in / split / scan-out flow: one or more input vessels fan out into N new output vessels, which become lineage children of the first input vessel.",
    blocks: [
      {
        title: "1. Start session",
        fields: [
          { label: "Workstation", example: "Hood 1" },
          {
            label: "Vessel 1 (barcode)",
            example: "e.g. VSL-3750B567A6",
            note: "Scan or type an existing ACTIVE vessel's barcode, then Look up to resolve it. Use “+ Add input vessel” for a session with more than one input.",
          },
        ],
      },
      {
        title: "2. Complete session",
        fields: [
          {
            label: "Session ID",
            example: "(copied from the “Session started —” message after step 1)",
          },
          { label: "Split ratio", example: "1:4" },
          { label: "Media batch ID (optional)", example: "(paste one if this split uses fresh media)" },
          { label: "Notes", example: "Routine multiplication split" },
          {
            label: "Output vessel row(s)",
            example: "Location: Growth Room 1 · Vessel type: Same as input",
            note: "Click “+ Add output vessel” once per new vessel you're creating — a 1:4 split needs 4 rows.",
          },
        ],
      },
    ],
    tips: [
      "Complete session always needs at least one output row.",
      "Output vessels inherit the same batch as the input vessel — subculturing doesn't advance the stage. To move to the next stage, create a child batch (see Batches above) and register vessels against it separately.",
    ],
  },
  {
    id: "contamination-events",
    title: "Contamination Events",
    path: "/qc/contamination-events",
    roles: "Admin, Lab Manager, Lab Technician",
    description: "Logs a contamination observation against a specific vessel.",
    blocks: [
      {
        title: "Log contamination event",
        fields: [
          { label: "Vessel barcode", example: "e.g. VSL-3750B567A6" },
          { label: "Contamination type", example: "FUNGAL" },
          { label: "Location", example: "Growth Room 1" },
          { label: "Action taken", example: "ISOLATED" },
          { label: "Media batch ID (optional)", example: "(leave blank unless you suspect a specific batch)" },
          { label: "Workstation ID (optional)", example: "(leave blank unless the hood is implicated)" },
          { label: "Root cause notes", example: "White fuzzy growth first observed on day 5, isolated for monitoring." },
        ],
      },
    ],
    tips: [
      "Action “DISCARDED” immediately marks the vessel DISCARDED; “ISOLATED” or “TREATED” mark it CONTAMINATED but keep it tracked and lookupable.",
    ],
  },
  {
    id: "discard-logs",
    title: "Discard Logs",
    path: "/qc/discard-logs",
    roles: "Admin, Lab Manager, Lab Technician",
    description: "Logs a vessel being discarded (contamination, mortality, quality failure, or end-of-life).",
    blocks: [
      {
        title: "Log a discard",
        fields: [
          { label: "Vessel barcode", example: "e.g. VSL-3750B567A6" },
          { label: "Reason", example: "CONTAMINATION" },
          { label: "Stage at discard", example: "II — Multiplication" },
        ],
      },
    ],
    tips: [
      "This always marks the vessel DISCARDED — there's no undo form, so check the confirm card that appears after scanning before you submit.",
    ],
  },
  {
    id: "users",
    title: "Users",
    path: "/users",
    roles: "Admin only",
    description: "Creates lab accounts and manages roles/active status. Not visible in the nav to non-admins.",
    blocks: [
      {
        title: "Add user",
        fields: [
          { label: "Name", example: "Jane Tan" },
          { label: "Email", example: "jane.tan@example.com" },
          { label: "Temporary password", example: "TempPass123! (8+ characters)" },
          { label: "Role", example: "LAB_TECHNICIAN" },
        ],
      },
    ],
    tips: [
      "There's no forced password-reset flow yet — tell new users to change their temporary password after first login.",
      "To change an existing user's role or active status, use the dropdown + checkbox directly on their row in the table, then Save — there's no separate edit page.",
    ],
  },
];
