"use client";

import { useState, useTransition } from "react";
import { resolveVesselByBarcode, type ResolvedVessel } from "@/lib/actions/vessels";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Scan-first vessel input: types/scans a barcode, resolves it via the API, and shows a
 * confirmation card before the value is usable — the "confirm-before-context" pattern from
 * docs/04-ux-workflows.md. The surrounding <form> still submits the real vessel UUID via a
 * hidden input named `name`; nothing about the receiving Server Action needs to change.
 */
export function VesselBarcodeField({
  name,
  label,
  onRemove,
}: {
  name: string;
  label: string;
  onRemove?: () => void;
}) {
  const [barcode, setBarcode] = useState("");
  const [resolved, setResolved] = useState<ResolvedVessel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fieldId = `barcode-${name}-${label}`;

  function lookup() {
    if (!barcode.trim()) return;
    startTransition(async () => {
      const result = await resolveVesselByBarcode(barcode);
      setResolved(result.vessel ?? null);
      setError(result.vessel ? null : (result.error ?? "Not found."));
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field label={label} htmlFor={fieldId}>
            <Input
              id={fieldId}
              value={barcode}
              onChange={(e) => {
                setBarcode(e.target.value);
                setResolved(null);
                setError(null);
              }}
              onBlur={lookup}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  lookup();
                }
              }}
              placeholder="VSL-XXXXXXXXXX"
              autoComplete="off"
            />
          </Field>
        </div>
        <Button type="button" variant="secondary" onClick={lookup} disabled={isPending || !barcode.trim()}>
          {isPending ? "…" : "Look up"}
        </Button>
        {onRemove && (
          <Button type="button" variant="secondary" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {resolved && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-[#e6f4ec] px-3 py-1.5 text-xs text-[var(--color-accent)]">
          <span>✓ {resolved.vessel.barcode}</span>
          <Badge tone="neutral">{resolved.batch.stage.replace(/_/g, " ")}</Badge>
          <Badge tone={resolved.vessel.status === "ACTIVE" ? "success" : "warn"}>
            {resolved.vessel.status.replace(/_/g, " ")}
          </Badge>
        </div>
      )}
      <input type="hidden" name={name} value={resolved?.vessel.id ?? ""} />
    </div>
  );
}
