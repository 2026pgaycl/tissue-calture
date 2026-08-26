import type { Session } from "@/lib/session";
import { logoutAction } from "@/app/(app)/actions";

const ROLE_LABELS: Record<Session["role"], string> = {
  ADMIN: "Admin",
  LAB_MANAGER: "Lab Manager",
  LAB_TECHNICIAN: "Lab Technician",
  MEDIA_PREP_STAFF: "Media Prep Staff",
};

export function Header({ session }: { session: Session }) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3">
      <div className="text-sm">
        <span className="font-medium">{session.email}</span>
        <span className="ml-2 text-[var(--color-text-muted)]">{ROLE_LABELS[session.role]}</span>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
