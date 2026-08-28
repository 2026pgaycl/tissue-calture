"use client";

import { useActionState } from "react";
import { signupAction, type SignupState } from "./actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

const initialState: SignupState = {};

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="Lab / organization name" htmlFor="organizationName">
        <Input id="organizationName" name="organizationName" autoComplete="organization" required />
      </Field>
      <Field label="Your name" htmlFor="adminName">
        <Input id="adminName" name="adminName" autoComplete="name" required />
      </Field>
      <Field label="Your email" htmlFor="adminEmail">
        <Input id="adminEmail" name="adminEmail" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password" htmlFor="adminPassword">
        <Input
          id="adminPassword"
          name="adminPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <FormError message={state.error} />
      <SubmitButton pendingText="Creating your lab…" className="w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
