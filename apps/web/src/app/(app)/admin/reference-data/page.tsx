import { requireSession } from "@/lib/dal";
import { Card } from "@/components/ui/card";

const SECTIONS: Array<{ title: string; description: string; values: Array<[string, string]> }> = [
  {
    title: "Batch stage",
    description: "Used on Batches, and as “stage at discard” on Discard Logs.",
    values: [
      ["I_INITIATION", "I — Initiation"],
      ["II_MULTIPLICATION", "II — Multiplication"],
      ["III_ROOTING", "III — Rooting"],
      ["IV_ACCLIMATIZATION", "IV — Acclimatization"],
    ],
  },
  {
    title: "Source type",
    description: "Used on Batches (initiation only).",
    values: [
      ["SEED", "Seed"],
      ["EXPLANT", "Explant"],
      ["TISSUE", "Tissue"],
    ],
  },
  {
    title: "Contamination type",
    description: "Used on Contamination Events.",
    values: [
      ["BACTERIAL", "Bacterial"],
      ["FUNGAL", "Fungal"],
      ["VIRAL", "Viral"],
      ["UNKNOWN", "Unknown"],
      ["MIXED", "Mixed"],
    ],
  },
  {
    title: "Action taken",
    description: "Used on Contamination Events.",
    values: [
      ["ISOLATED", "Isolated"],
      ["DISCARDED", "Discarded"],
      ["TREATED", "Treated"],
    ],
  },
  {
    title: "Discard reason",
    description: "Used on Discard Logs.",
    values: [
      ["CONTAMINATION", "Contamination"],
      ["MORTALITY", "Mortality"],
      ["QUALITY", "Quality"],
      ["END_OF_LIFE", "End of life"],
    ],
  },
];

export default async function ReferenceDataPage() {
  await requireSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Reference Data</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          These value sets are fixed in the application code (Postgres enums), not stored in the
          database, so they can&apos;t be edited here — adding a new value requires a code change and a
          schema migration. Species and Locations, by contrast, are database-backed and manageable
          under Admin.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <Card key={section.title} title={section.title}>
          <p className="mb-3 text-sm text-[var(--color-text-muted)]">{section.description}</p>
          <ul className="flex flex-wrap gap-2">
            {section.values.map(([value, label]) => (
              <li
                key={value}
                title={value}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs"
              >
                {label}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
