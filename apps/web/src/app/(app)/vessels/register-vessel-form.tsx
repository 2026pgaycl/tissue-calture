"use client";

import { useActionState } from "react";
import { registerVesselAction, type RegisterVesselState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { Batch, Location } from "@/lib/types";

const VESSEL_TYPES = ["JAR", "TRAY", "TUBE", "BAG"] as const;

const initialState: RegisterVesselState = {};

export function RegisterVesselForm({ batches, locations }: { batches: Batch[]; locations: Location[] }) {
  const [state, action] = useActionState(registerVesselAction, initialState);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Batch" htmlFor="batchId">
        <Select id="batchId" name="batchId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.stage.replace(/_/g, " ")} · {b.id.slice(0, 8)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Vessel type" htmlFor="vesselType">
        <Select id="vesselType" name="vesselType" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {VESSEL_TYPES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Location" htmlFor="locationId">
        <Select id="locationId" name="locationId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Register vessel</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <FormError message={state.error} />
        {state.createdBarcode && (
          <p className="rounded-md bg-[#e6f4ec] px-3 py-2 text-sm text-[var(--color-accent)]">
            Registered — barcode <span className="font-mono">{state.createdBarcode}</span>
          </p>
        )}
      </div>
    </form>
  );
}
