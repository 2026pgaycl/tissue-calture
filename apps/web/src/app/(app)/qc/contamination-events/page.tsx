import { apiFetch } from "@/lib/api";
import { requireSession } from "@/lib/dal";
import type { ContaminationEvent, Location } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateEventForm } from "./create-event-form";

export default async function ContaminationEventsPage() {
  await requireSession();
  const [events, locations] = await Promise.all([
    apiFetch<ContaminationEvent[]>("/contamination-events"),
    apiFetch<Location[]>("/locations"),
  ]);
  const locationById = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Contamination Events</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Root-cause analytics (Phase 2) will slice this log by media batch, workstation, and
          location.
        </p>
      </div>

      <Card title="Log contamination event">
        <CreateEventForm locations={locations} />
      </Card>

      <Card title={`${events.length} event${events.length === 1 ? "" : "s"}`}>
        <DataTable
          rows={events}
          rowKey={(e) => e.id}
          emptyMessage="No contamination events logged."
          columns={[
            { header: "Type", cell: (e) => <Badge tone="danger">{e.contaminationType}</Badge> },
            { header: "Location", cell: (e) => locationById.get(e.locationId) ?? e.locationId },
            { header: "Action", cell: (e) => e.actionTaken },
            { header: "Detected", cell: (e) => new Date(e.detectedAt).toLocaleString() },
            { header: "Notes", cell: (e) => e.rootCauseNotes ?? "—" },
          ]}
        />
      </Card>
    </div>
  );
}
