import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Batch, PaginatedResult, PlantSpecies } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateBatchForm } from "./create-batch-form";

const STATUS_TONE = { ACTIVE: "success", COMPLETED: "neutral", DISCARDED: "danger" } as const;

export default async function BatchesPage() {
  const session = await requireSession();

  const [{ data: batches }, species] = await Promise.all([
    apiFetch<PaginatedResult<Batch>>("/batches?pageSize=50"),
    apiFetch<PlantSpecies[]>("/plant-species"),
  ]);
  const speciesById = new Map(species.map((s) => [s.id, s.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Batches</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Lineage groups from initiation through acclimatization.
        </p>
      </div>

      {hasRole(session, "ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN") && (
        <Card title="New batch">
          <CreateBatchForm species={species} />
        </Card>
      )}

      <Card title={`${batches.length} batch${batches.length === 1 ? "" : "es"}`}>
        <DataTable
          rows={batches}
          rowKey={(b) => b.id}
          emptyMessage="No batches yet. Create one above."
          columns={[
            {
              header: "Species",
              cell: (b) => speciesById.get(b.speciesId) ?? b.speciesId,
            },
            { header: "Stage", cell: (b) => b.stage.replace(/_/g, " ") },
            {
              header: "Status",
              cell: (b) => <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>,
            },
            { header: "Created", cell: (b) => new Date(b.createdAt).toLocaleDateString() },
            {
              header: "",
              cell: (b) => (
                <Link href={`/batches/${b.id}`} className="text-[var(--color-accent)]">
                  View →
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
