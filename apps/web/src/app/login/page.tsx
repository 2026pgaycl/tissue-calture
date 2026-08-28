import Image from "next/image";
import Link from "next/link";
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
      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Image
          src="/logo.png"
          alt="Asia Digital Frontend Venture"
          width={1920}
          height={1280}
          className="h-auto w-full"
          priority
        />
        <div className="p-6">
          <h1 className="mb-1 text-lg font-semibold">TCMS</h1>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">
            Tissue Culture Management System
          </p>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            New lab?{" "}
            <Link href="/signup" className="text-[var(--color-accent)] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
