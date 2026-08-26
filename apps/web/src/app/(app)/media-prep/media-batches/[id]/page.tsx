import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { MediaBatch } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutoclaveForm } from "./autoclave-form";

export default async function MediaBatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  let batch: MediaBatch;
  try {
    batch = await apiFetch<MediaBatch>(`/media-batches/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/media-prep/media-batches" className="text-sm text-[var(--color-accent)]">
          ← Media Batches
        </Link>
        <h1 className="mt-1 font-mono text-xl font-semibold">{batch.barcode}</h1>
      </div>

      <Card title="Details">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[var(--color-text-muted)]">Status</dt>
            <dd>
              <Badge tone={batch.status === "AVAILABLE" ? "success" : "warn"}>{batch.status.replace(/_/g, " ")}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Volume</dt>
            <dd>{batch.targetVolumeL} L</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Prepared</dt>
            <dd>{new Date(batch.preparedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-muted)]">Expires</dt>
            <dd>{new Date(batch.expirationDate).toLocaleDateString()}</dd>
          </div>
        </dl>
      </Card>

      {hasRole(session, "ADMIN", "LAB_MANAGER", "MEDIA_PREP_STAFF") && (
        <Card title="Log autoclave cycle">
          <AutoclaveForm mediaBatchId={batch.id} />
        </Card>
      )}
    </div>
  );
}
