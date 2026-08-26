import "server-only";
import { redirect } from "next/navigation";
import { getSession, type Session, type Role } from "./session";

/** Redirects to /login if there's no valid (optimistic) session. Call at the top of protected pages/layouts. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export function hasRole(session: Session, ...roles: Role[]): boolean {
  return roles.includes(session.role);
}
