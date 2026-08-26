import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { MediaBatch, MediaRecipe } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateMediaBatchForm } from "./create-media-batch-form";

const STATUS_TONE = {
  AVAILABLE: "success",
  DEPLETED: "neutral",
  EXPIRED: "warn",
  FAILED_AUTOCLAVE: "danger",
} as const;

export default async function MediaBatchesPage() {
  const session = await requireSession();
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER", "MEDIA_PREP_STAFF");

  const [batches, recipes] = await Promise.all([
    apiFetch<MediaBatch[]>("/media-batches"),
    canManage ? apiFetch<MediaRecipe[]>("/recipes") : Promise.resolve<MediaRecipe[]>([]),
  ]);
  const recipeById = new Map(recipes.map((r) => [r.id, r.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Media Batches</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Preparing a batch deducts chemical stock automatically.
        </p>
      </div>

      {canManage && (
        <Card title="Prepare media batch">
          <CreateMediaBatchForm recipes={recipes} />
        </Card>
      )}

      <Card title={`${batches.length} batch${batches.length === 1 ? "" : "es"}`}>
        <DataTable
          rows={batches}
          rowKey={(b) => b.id}
          emptyMessage="No media batches yet."
          columns={[
            { header: "Barcode", cell: (b) => <span className="font-mono text-xs">{b.barcode}</span> },
            { header: "Recipe", cell: (b) => recipeById.get(b.recipeId) ?? b.recipeId },
            { header: "Volume (L)", cell: (b) => b.targetVolumeL },
            { header: "Status", cell: (b) => <Badge tone={STATUS_TONE[b.status]}>{b.status.replace(/_/g, " ")}</Badge> },
            { header: "Expires", cell: (b) => new Date(b.expirationDate).toLocaleDateString() },
            {
              header: "",
              cell: (b) => (
                <Link href={`/media-prep/media-batches/${b.id}`} className="text-[var(--color-accent)]">
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
