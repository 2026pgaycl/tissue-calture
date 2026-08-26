import { requireSession } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { NAV_GROUPS } from "@/components/shell/nav-items";

export default async function DashboardPage() {
  const session = await requireSession();
  const modules = NAV_GROUPS.flatMap((g) => g.items).filter(
    (item) => item.href !== "/dashboard" && (!item.roles || item.roles.includes(session.role)),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Signed in as {session.email} ({session.role.replace("_", " ").toLowerCase()})
        </p>
      </div>
      <Card title="Modules">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {modules.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md border border-[var(--color-border)] px-4 py-3 text-sm hover:border-[var(--color-accent)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
