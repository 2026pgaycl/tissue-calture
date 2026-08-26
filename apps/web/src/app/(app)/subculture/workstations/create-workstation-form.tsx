"use client";

import { useActionState } from "react";
import { createWorkstationAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import type { Location } from "@/lib/types";

const initial: FormState = {};

export function CreateWorkstationForm({ locations }: { locations: Location[] }) {
  const [state, action] = useActionState(createWorkstationAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
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
      <Field label="Hood type" htmlFor="hoodType">
        <Input id="hoodType" name="hoodType" placeholder="Class II BSC" />
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Add workstation</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
