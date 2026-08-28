import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
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
          <h1 className="mb-1 text-lg font-semibold">Create your lab&apos;s account</h1>
          <p className="mb-6 text-sm text-[var(--color-text-muted)]">
            Sets up a new organization on TCMS and signs you in as its first admin.
          </p>
          <SignupForm />
          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
