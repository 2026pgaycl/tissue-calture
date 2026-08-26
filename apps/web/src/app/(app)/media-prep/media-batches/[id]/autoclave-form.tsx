"use client";

import { useActionState } from "react";
import { logAutoclaveAction, type FormState } from "../actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const initial: FormState = {};

export function AutoclaveForm({ mediaBatchId }: { mediaBatchId: string }) {
  const boundAction = logAutoclaveAction.bind(null, mediaBatchId);
  const [state, action] = useActionState(boundAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Cycle date" htmlFor="cycleDate">
        <Input id="cycleDate" name="cycleDate" type="datetime-local" required />
      </Field>
      <Field label="Temp (°C)" htmlFor="temperatureC">
        <Input id="temperatureC" name="temperatureC" type="number" step="any" required />
      </Field>
      <Field label="Pressure (kPa)" htmlFor="pressureKpa">
        <Input id="pressureKpa" name="pressureKpa" type="number" step="any" required />
      </Field>
      <Field label="Duration (min)" htmlFor="durationMin">
        <Input id="durationMin" name="durationMin" type="number" required />
      </Field>
      <Field label="Result" htmlFor="result">
        <Select id="result" name="result" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option value="PASS">Pass</option>
          <option value="FAIL">Fail</option>
        </Select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-5">
        <FormError message={state.error} />
      </div>
      <SubmitButton>Log cycle</SubmitButton>
    </form>
  );
}
