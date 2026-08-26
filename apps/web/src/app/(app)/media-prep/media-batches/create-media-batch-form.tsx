"use client";

import { useActionState } from "react";
import { createMediaBatchAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { MediaRecipe } from "@/lib/types";

const initial: FormState = {};

export function CreateMediaBatchForm({ recipes }: { recipes: MediaRecipe[] }) {
  const [state, action] = useActionState(createMediaBatchAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Recipe" htmlFor="recipeId">
        <Select id="recipeId" name="recipeId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Target volume (L)" htmlFor="targetVolumeL">
        <Input id="targetVolumeL" name="targetVolumeL" type="number" step="any" required />
      </Field>
      <Field label="Expiration date" htmlFor="expirationDate">
        <Input id="expirationDate" name="expirationDate" type="date" required />
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Prepare batch</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-2">
        <FormError message={state.error} />
        {state.insufficient && state.insufficient.length > 0 && (
          <ul className="rounded-md bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {state.insufficient.map((item) => (
              <li key={item.chemicalId}>
                {item.chemicalName}: need {item.qty.toFixed(3)}, have {item.available}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
