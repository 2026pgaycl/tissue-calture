"use client";

import { useActionState } from "react";
import { createUserAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const ROLES = ["ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN", "MEDIA_PREP_STAFF"] as const;
const initial: FormState = {};

export function CreateUserForm() {
  const [state, action] = useActionState(createUserAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Temporary password" htmlFor="password">
        <Input id="password" name="password" type="password" minLength={8} required />
      </Field>
      <Field label="Role" htmlFor="role">
        <Select id="role" name="role" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <SubmitButton className="w-full">Create user</SubmitButton>
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <FormError message={state.error} />
      </div>
    </form>
  );
}
