import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Batch, Location, PaginatedResult, Vessel, VesselHistory } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { RegisterVesselForm } from "./register-vessel-form";

const STATUS_TONE = {
  ACTIVE: "success",
  CONTAMINATED: "danger",
  DISCARDED: "neutral",
  TRANSFERRED_GREENHOUSE: "warn",
} as const;

export default async function VesselsPage({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string }>;
}) {
  const session = await requireSession();
  const { barcode } = await searchParams;

  let vessel: Vessel | null = null;
  let history: VesselHistory | null = null;
  let lookupError: string | null = null;

  if (barcode) {
    try {
      vessel = await apiFetch<Vessel>(`/vessels/lookup/${encodeURIComponent(barcode)}`);
      history = await apiFetch<VesselHistory>(`/vessels/${vessel.id}/history`);
    } catch (err) {
      lookupError = err instanceof ApiError ? err.message : "Lookup failed.";
    }
  }

  const canRegister = hasRole(session, "ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN");
  const [batches, locations] = canRegister
    ? await Promise.all([
        apiFetch<PaginatedResult<Batch>>("/batches?pageSize=100").then((r) => r.data),
        apiFetch<Location[]>("/locations"),
      ])
    : [[], []];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Vessel Lookup</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Scan or type a vessel barcode to pull up its current state and full history.
        </p>
      </div>

      <Card>
        <form action="/vessels" className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="Barcode" htmlFor="barcode">
              <Input id="barcode" name="barcode" defaultValue={barcode ?? ""} placeholder="VSL-XXXXXXXXXX" autoFocus />
            </Field>
          </div>
          <Button type="submit">Look up</Button>
        </form>
      </Card>

      {lookupError && (
        <Card>
          <p className="text-sm text-[var(--color-danger)]">{lookupError}</p>
        </Card>
      )}

      {vessel && (
        <Card title={vessel.barcode}>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[var(--color-text-muted)]">Status</dt>
              <dd>
                <Badge tone={STATUS_TONE[vessel.status]}>{vessel.status.replace(/_/g, " ")}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Type</dt>
              <dd>{vessel.vesselType}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Batch</dt>
              <dd>
                <Link href={`/batches/${vessel.batchId}`} className="text-[var(--color-accent)]">
                  {vessel.batchId.slice(0, 8)}…
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">Registered</dt>
              <dd>{new Date(vessel.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          {history && (
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-[var(--color-text-muted)]">Subculture events</dt>
                <dd>{history.sessionVessels.length}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Contamination events</dt>
                <dd>{history.contaminationEvents.length}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Discard logs</dt>
                <dd>{history.discardLogs.length}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-muted)]">Fulfillments</dt>
                <dd>{history.fulfillments.length}</dd>
              </div>
            </div>
          )}
        </Card>
      )}

      {canRegister && (
        <Card title="Register a new vessel">
          <RegisterVesselForm batches={batches} locations={locations} />
        </Card>
      )}
    </div>
  );
}
