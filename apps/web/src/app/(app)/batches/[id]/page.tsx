import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireSession } from "@/lib/dal";
import type { Batch, PlantSpecies } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineageTree } from "../lineage-tree";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  let batch: Batch;
  let lineage: Batch[];
  let species: PlantSpecies[];
  try {
    [batch, lineage, species] = await Promise.all([
      apiFetch<Batch>(`/batches/${id}`),
      apiFetch<Batch[]>(`/batches/${id}/lineage`),
      apiFetch<PlantSpecies[]>("/plant-species"),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const speciesName = species.find((s) => s.id === batch.speciesId)?.name ?? batch.speciesId;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/batches" className="text-sm text-[var(--color-accent)]">
          ← Batches
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{speciesName}</h1>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">{batch.id}</p>
      </div>

      <Card title="Details">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[var(--color-text-muted)]">Stage</dt>
            <dd>{batch.stage.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Status</dt>
            <dd>
              <Badge tone={batch.status === "ACTIVE" ? "success" : "neutral"}>{batch.status}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Source type</dt>
            <dd>{batch.sourceType ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Created</dt>
            <dd>{new Date(batch.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Lineage">
        <LineageTree rows={lineage} currentId={batch.id} />
      </Card>
    </div>
  );
}
