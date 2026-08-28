"use client";

import { useActionState } from "react";
import { createSpeciesAction, type FormState } from "./actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const initial: FormState = {};

export function CreateSpeciesForm() {
  const [state, action] = useActionState(createSpeciesAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
      </Field>
      <Field label="Scientific name" htmlFor="scientificName">
        <Input id="scientificName" name="scientificName" />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Input id="notes" name="notes" />
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Add species</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-4">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
