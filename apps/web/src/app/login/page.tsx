import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h1 className="mb-1 text-lg font-semibold">TCMS</h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Tissue Culture Management System
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
