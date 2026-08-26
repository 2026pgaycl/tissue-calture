import { apiFetch } from "@/lib/api";
import { requireSession } from "@/lib/dal";
import type { Location, Workstation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StartSessionForm } from "./start-session-form";
import { CompleteSessionForm } from "./complete-session-form";

export default async function SubcultureSessionsPage() {
  await requireSession();
  const [workstations, locations] = await Promise.all([
    apiFetch<Workstation[]>("/workstations"),
    apiFetch<Location[]>("/locations"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Subculture Sessions</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Scan in, split, and scan out. A session groups a laminar-flow-hood pass: one or more
          input vessels producing N output vessels as lineage children.
        </p>
      </div>

      <Card title="1. Start session">
        <StartSessionForm workstations={workstations} />
      </Card>

      <Card title="2. Complete session">
        <CompleteSessionForm locations={locations} />
      </Card>
    </div>
  );
}
