import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Location } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CreateLocationForm } from "./create-location-form";

export default async function LocationsPage() {
  const session = await requireSession();
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER");

  const locations = await apiFetch<Location[]>("/locations");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Locations</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Physical locations used across vessels, workstations, and contamination events.
        </p>
      </div>

      {canManage && (
        <Card title="Add location">
          <CreateLocationForm />
        </Card>
      )}

      <Card title={`${locations.length} location${locations.length === 1 ? "" : "s"}`}>
        <DataTable
          rows={locations}
          rowKey={(l) => l.id}
          emptyMessage="No locations yet."
          columns={[
            { header: "Name", cell: (l) => l.name },
            { header: "Type", cell: (l) => l.type.replace(/_/g, " ") },
          ]}
        />
      </Card>
    </div>
  );
}
