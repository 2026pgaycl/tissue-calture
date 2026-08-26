"use client";

import { useActionState } from "react";
import { createChemicalAction, adjustStockAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { Chemical } from "@/lib/types";

const CATEGORIES = ["MACRO_SALT", "MICRO_SALT", "VITAMIN", "PGR", "GELLING_AGENT", "SUGAR", "OTHER"] as const;
const initial: FormState = {};

export function CreateChemicalForm() {
  const [state, action] = useActionState(createChemicalAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
      </Field>
      <Field label="Category" htmlFor="category">
        <Select id="category" name="category" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Stock concentration" htmlFor="stockConcentration">
        <Input id="stockConcentration" name="stockConcentration" type="number" step="any" required />
      </Field>
      <Field label="Unit" htmlFor="unit">
        <Input id="unit" name="unit" placeholder="mg/mL" required />
      </Field>
      <Field label="Reorder threshold" htmlFor="reorderThreshold">
        <Input id="reorderThreshold" name="reorderThreshold" type="number" step="any" required />
      </Field>
      <Field label="Supplier" htmlFor="supplier">
        <Input id="supplier" name="supplier" />
      </Field>
      <div className="sm:col-span-2 lg:col-span-6">
        <FormError message={state.error} />
      </div>
      <SubmitButton>Add chemical</SubmitButton>
    </form>
  );
}

export function AdjustStockForm({ chemicals }: { chemicals: Chemical[] }) {
  const [state, action] = useActionState(adjustStockAction, initial);
  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Field label="Chemical" htmlFor="chemicalId">
        <Select id="chemicalId" name="chemicalId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {chemicals.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Quantity (+ receipt / − adjustment)" htmlFor="quantity">
        <Input id="quantity" name="quantity" type="number" step="any" required />
      </Field>
      <div className="flex items-end gap-3">
        <SubmitButton>Apply</SubmitButton>
      </div>
      <div className="sm:col-span-3">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
