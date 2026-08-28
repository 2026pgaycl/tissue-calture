import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { PlantSpecies } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CreateSpeciesForm } from "./create-species-form";

export default async function SpeciesPage() {
  const session = await requireSession();
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER");

  const species = await apiFetch<PlantSpecies[]>("/plant-species");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Species</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Plant species tracked across batches.</p>
      </div>

      {canManage && (
        <Card title="Add species">
          <CreateSpeciesForm />
        </Card>
      )}

      <Card title={`${species.length} species`}>
        <DataTable
          rows={species}
          rowKey={(s) => s.id}
          emptyMessage="No species yet."
          columns={[
            { header: "Name", cell: (s) => s.name },
            { header: "Scientific name", cell: (s) => s.scientificName ?? "—" },
            { header: "Notes", cell: (s) => s.notes ?? "—" },
          ]}
        />
      </Card>
    </div>
  );
}
