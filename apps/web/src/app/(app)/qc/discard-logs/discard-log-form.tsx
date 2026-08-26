"use client";

import { useActionState } from "react";
import { createDiscardLogAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const REASONS = ["CONTAMINATION", "MORTALITY", "QUALITY", "END_OF_LIFE"] as const;
const STAGES = [
  ["I_INITIATION", "I — Initiation"],
  ["II_MULTIPLICATION", "II — Multiplication"],
  ["III_ROOTING", "III — Rooting"],
  ["IV_ACCLIMATIZATION", "IV — Acclimatization"],
] as const;
const initial: FormState = {};

export function DiscardLogForm() {
  const [state, action] = useActionState(createDiscardLogAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Vessel ID" htmlFor="vesselId">
        <Input id="vesselId" name="vesselId" placeholder="uuid" required />
      </Field>
      <Field label="Reason" htmlFor="reason">
        <Select id="reason" name="reason" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Stage at discard" htmlFor="stageAtDiscard">
        <Select id="stageAtDiscard" name="stageAtDiscard" required defaultValue="">
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
      <div className="flex items-end">
        <SubmitButton className="w-full">Log discard</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-2">
        <FormError message={state.error} />
        {state.logged && (
          <p className="rounded-md bg-[#e6f4ec] px-3 py-2 text-sm text-[var(--color-accent)]">
            Discard logged and vessel marked DISCARDED.
          </p>
        )}
      </div>
    </form>
  );
}
