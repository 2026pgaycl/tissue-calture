"use client";

import { useActionState } from "react";
import { createBatchAction, type CreateBatchState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { PlantSpecies } from "@/lib/types";

const STAGES = [
  ["I_INITIATION", "I — Initiation"],
  ["II_MULTIPLICATION", "II — Multiplication"],
  ["III_ROOTING", "III — Rooting"],
  ["IV_ACCLIMATIZATION", "IV — Acclimatization"],
] as const;

const SOURCE_TYPES = ["SEED", "EXPLANT", "TISSUE"] as const;

const initialState: CreateBatchState = {};

export function CreateBatchForm({ species }: { species: PlantSpecies[] }) {
  const [state, action] = useActionState(createBatchAction, initialState);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Species" htmlFor="speciesId">
        <Select id="speciesId" name="speciesId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Stage" htmlFor="stage">
        <Select id="stage" name="stage" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {STAGES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Source type (initiation only)" htmlFor="sourceType">
        <Select id="sourceType" name="sourceType" defaultValue="">
          <option value="">—</option>
          {SOURCE_TYPES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Parent batch ID (optional)" htmlFor="parentBatchId">
        <Input id="parentBatchId" name="parentBatchId" placeholder="uuid" />
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Create batch</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
