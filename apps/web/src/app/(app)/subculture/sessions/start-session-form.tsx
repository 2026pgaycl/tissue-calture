"use client";

import { useActionState } from "react";
import { startSessionAction, type StartSessionState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { Workstation } from "@/lib/types";

const initial: StartSessionState = {};

export function StartSessionForm({ workstations }: { workstations: Workstation[] }) {
  const [state, action] = useActionState(startSessionAction, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <Field label="Input vessel ID(s)" htmlFor="inputVesselIds">
          <Input
            id="inputVesselIds"
            name="inputVesselIds"
            placeholder="uuid1, uuid2…"
            required
          />
        </Field>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Find a vessel&apos;s ID via Vessel Lookup. Comma or space separated for multiple.
      </p>
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
