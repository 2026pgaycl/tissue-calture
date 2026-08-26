"use client";

import { useActionState, useState } from "react";
import { createRecipeAction, type CreateRecipeState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton, Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { Chemical } from "@/lib/types";

const initial: CreateRecipeState = {};
let rowKeySeq = 0;

export function CreateRecipeForm({ chemicals }: { chemicals: Chemical[] }) {
  const [state, action] = useActionState(createRecipeAction, initial);
  const [rows, setRows] = useState<number[]>([rowKeySeq++]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" required />
        </Field>
        <Field label="Basal media type" htmlFor="basalMediaType">
          <Input id="basalMediaType" name="basalMediaType" placeholder="MS, WPM, B5…" required />
        </Field>
        <Field label="Target pH" htmlFor="targetPh">
          <Input id="targetPh" name="targetPh" type="number" step="0.01" required />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Components</p>
        {rows.map((key, i) => (
          <div key={key} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <Select name="chemicalId" required defaultValue="">
              <option value="" disabled>
                Chemical…
              </option>
              {chemicals.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input name="concentration" type="number" step="any" placeholder="Concentration" required />
            <Input name="unit" placeholder="mg/L" required />
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
          + Add component
        </Button>
      </div>

      <FormError message={state.error} />
      <div>
        <SubmitButton>Create recipe</SubmitButton>
      </div>
    </form>
  );
}
