import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Location, Workstation } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CreateWorkstationForm } from "./create-workstation-form";

export default async function WorkstationsPage() {
  const session = await requireSession();
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER");

  const [workstations, locations] = await Promise.all([
    apiFetch<Workstation[]>("/workstations"),
    apiFetch<Location[]>("/locations"),
  ]);
  const locationById = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Workstations</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Laminar flow hoods used for subculturing.</p>
      </div>

      {canManage && (
        <Card title="Add workstation">
          <CreateWorkstationForm locations={locations} />
        </Card>
      )}

      <Card title={`${workstations.length} workstation${workstations.length === 1 ? "" : "s"}`}>
        <DataTable
          rows={workstations}
          rowKey={(w) => w.id}
          emptyMessage="No workstations yet."
          columns={[
            { header: "Name", cell: (w) => w.name },
            { header: "Location", cell: (w) => locationById.get(w.locationId) ?? w.locationId },
            { header: "Hood type", cell: (w) => w.hoodType ?? "—" },
          ]}
        />
      </Card>
    </div>
  );
}
