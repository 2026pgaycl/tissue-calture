import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HELP_SECTIONS, SEEDED_REFERENCE } from "./content";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Help: Filling In Each Form</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Field-by-field example data for every module. Where a form references another record
          (a batch, a vessel barcode, a session), the example explains where to find a real one.
        </p>
      </div>

      <Card title="Jump to a module">
        <nav className="flex flex-wrap gap-2">
          {HELP_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm hover:border-[var(--color-accent)]"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </Card>

      <Card title="Reference data already in this system">
        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
          If this instance was set up from the project's seed script, these already exist — the
          examples below use them, so you can copy them as-is instead of inventing new records.
        </p>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-text-muted)]">Plant species</dt>
            <dd>{SEEDED_REFERENCE.species.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Locations</dt>
            <dd>{SEEDED_REFERENCE.locations.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Workstations</dt>
            <dd>{SEEDED_REFERENCE.workstations.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Sample recipe</dt>
            <dd>{SEEDED_REFERENCE.recipe}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--color-text-muted)]">Chemicals</dt>
            <dd>
              <ul className="mt-1 list-inside list-disc">
                {SEEDED_REFERENCE.chemicals.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Nothing here yet? Run <code className="font-mono">npm run seed</code> in{" "}
          <code className="font-mono">apps/api</code>.
        </p>
      </Card>

      {HELP_SECTIONS.map((section) => (
        <Card key={section.id}>
          <div id={section.id} className="scroll-mt-6">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{section.title}</h2>
              <Link href={section.path} className="text-sm text-[var(--color-accent)]">
                Open this page →
              </Link>
            </div>
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">
              Access: <Badge tone="neutral">{section.roles}</Badge>
            </p>
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">{section.description}</p>

            <div className="flex flex-col gap-4">
              {section.blocks.map((block) => (
                <div key={block.title}>
                  <p className="mb-2 text-sm font-medium">{block.title}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                          <th className="whitespace-nowrap py-1.5 pr-4 font-medium">Field</th>
                          <th className="whitespace-nowrap py-1.5 pr-4 font-medium">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.fields.map((field, i) => (
                          <tr key={`${field.label}-${i}`} className="border-b border-[var(--color-border)] last:border-0">
                            <td className="py-1.5 pr-4 align-top whitespace-nowrap">{field.label}</td>
                            <td className="py-1.5 pr-4 align-top">
                              <span className="font-mono text-xs">{field.example}</span>
                              {field.note && (
                                <p className="mt-1 max-w-prose text-xs text-[var(--color-text-muted)]">
                                  {field.note}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {section.tips.length > 0 && (
              <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-[var(--color-text-muted)]">
                {section.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
