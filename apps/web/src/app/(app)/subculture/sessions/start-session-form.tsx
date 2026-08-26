"use client";

import { useActionState, useState } from "react";
import { startSessionAction, type StartSessionState } from "./actions";
import { Field, Select } from "@/components/ui/field";
import { SubmitButton, Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { VesselBarcodeField } from "@/components/vessel-barcode-field";
import type { Workstation } from "@/lib/types";

const initial: StartSessionState = {};
let rowKeySeq = 0;

export function StartSessionForm({ workstations }: { workstations: Workstation[] }) {
  const [state, action] = useActionState(startSessionAction, initial);
  const [rows, setRows] = useState<number[]>([rowKeySeq++]);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="sm:w-64">
        <Field label="Workstation" htmlFor="workstationId">
          <Select id="workstationId" name="workstationId" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {workstations.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Input vessels (scan in)</p>
        {rows.map((key, i) => (
          <VesselBarcodeField
            key={key}
            name="inputVesselIds"
            label={`Vessel ${i + 1}`}
            onRemove={rows.length > 1 ? () => setRows((r) => r.filter((_, idx) => idx !== i)) : undefined}
          />
        ))}
        <div>
          <Button type="button" variant="secondary" onClick={() => setRows((r) => [...r, rowKeySeq++])}>
            + Add input vessel
          </Button>
        </div>
      </div>

      <FormError message={state.error} />
      {state.session && (
        <p className="rounded-md bg-[#e6f4ec] px-3 py-2 text-sm text-[var(--color-accent)]">
          Session started —{" "}
          <span className="font-mono">{(state.session as { id: string }).id}</span>. Use it below to
          complete the session.
        </p>
      )}
      <div>
        <SubmitButton>Start session</SubmitButton>
      </div>
    </form>
  );
}
