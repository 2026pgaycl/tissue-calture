"use client";

import { useActionState, useState } from "react";
import { completeSessionAction, type CompleteSessionState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton, Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { DataTable } from "@/components/ui/data-table";
import type { Location } from "@/lib/types";

const VESSEL_TYPES = ["JAR", "TRAY", "TUBE", "BAG"] as const;
const initial: CompleteSessionState = {};
let rowKeySeq = 0;

export function CompleteSessionForm({ locations }: { locations: Location[] }) {
  const [state, action] = useActionState(completeSessionAction, initial);
  const [rows, setRows] = useState<number[]>([rowKeySeq++]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Session ID" htmlFor="sessionId">
          <Input id="sessionId" name="sessionId" placeholder="uuid" required />
        </Field>
        <Field label="Split ratio" htmlFor="splitRatio">
          <Input id="splitRatio" name="splitRatio" placeholder="1:4" required />
        </Field>
        <Field label="Media batch ID (optional)" htmlFor="mediaBatchId">
          <Input id="mediaBatchId" name="mediaBatchId" placeholder="uuid" />
        </Field>
        <Field label="Notes" htmlFor="notes">
          <Input id="notes" name="notes" />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Output vessels</p>
        {rows.map((key, i) => (
          <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_auto]">
            <Select name="outputLocationId" required defaultValue="">
              <option value="" disabled>
                Location…
              </option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <Select name="outputVesselType" defaultValue="">
              <option value="">Same as input</option>
              {VESSEL_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
              disabled={rows.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => setRows((r) => [...r, rowKeySeq++])}>
          + Add output vessel
        </Button>
      </div>

      <FormError message={state.error} />
      {state.outputVessels && (
        <DataTable
          rows={state.outputVessels}
          rowKey={(v) => v.id}
          columns={[
            { header: "Barcode", cell: (v) => <span className="font-mono text-xs">{v.barcode}</span> },
            { header: "Type", cell: (v) => v.vesselType },
          ]}
        />
      )}
      <div>
        <SubmitButton>Complete session</SubmitButton>
      </div>
    </form>
  );
}
