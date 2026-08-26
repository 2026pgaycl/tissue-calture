"use client";

import { useActionState } from "react";
import { updateUserAction, type FormState } from "./actions";
import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import type { User } from "@/lib/types";

const ROLES = ["ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN", "MEDIA_PREP_STAFF"] as const;
const initial: FormState = {};

export function UserRow({ user }: { user: User }) {
  const boundAction = updateUserAction.bind(null, user.id);
  const [state, action] = useActionState(boundAction, initial);

  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      <td className="py-2 pr-4">{user.name}</td>
      <td className="py-2 pr-4">{user.email}</td>
      <td className="py-2 pr-4">
        <form action={action} className="flex items-center gap-2">
          <Select name="role" defaultValue={user.role} className="w-40">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <input type="checkbox" name="active" defaultChecked={user.active} />
            Active
          </label>
          <SubmitButton variant="secondary" pendingText="…">
            Save
          </SubmitButton>
        </form>
        {state.error && <p className="mt-1 text-xs text-[var(--color-danger)]">{state.error}</p>}
      </td>
      <td className="py-2 pr-4 text-[var(--color-text-muted)]">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}
