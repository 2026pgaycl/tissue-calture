import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { User } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { CreateUserForm } from "./create-user-form";
import { UserRow } from "./user-row";

export default async function UsersPage() {
  const session = await requireSession();

  if (!hasRole(session, "ADMIN")) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">
          User management is restricted to administrators.
        </p>
      </Card>
    );
  }

  const users = await apiFetch<User[]>("/users");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Admin, Lab Manager, Lab Technician, Media Prep Staff.</p>
      </div>

      <Card title="Add user">
        <CreateUserForm />
      </Card>

      <Card title={`${users.length} user${users.length === 1 ? "" : "s"}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Name</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Email</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Role / Active</th>
                <th className="whitespace-nowrap py-2 pr-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
