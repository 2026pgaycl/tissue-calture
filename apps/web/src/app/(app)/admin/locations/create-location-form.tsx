"use client";

import { useActionState } from "react";
import { createLocationAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const LOCATION_TYPES = ["CLEANROOM", "GROWTH_ROOM", "GREENHOUSE", "STORAGE"] as const;
const initial: FormState = {};

export function CreateLocationForm() {
  const [state, action] = useActionState(createLocationAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
      </Field>
      <Field label="Type" htmlFor="type">
        <Select id="type" name="type" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {LOCATION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Add location</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
