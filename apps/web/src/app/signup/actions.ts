"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { setSessionCookie } from "@/lib/session";

export interface SignupState {
  error?: string;
}

interface SignupResponse {
  accessToken: string;
}

export async function signupAction(_prevState: SignupState, formData: FormData): Promise<SignupState> {
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim();
  const adminPassword = String(formData.get("adminPassword") ?? "");

  if (!organizationName || !adminName || !adminEmail || !adminPassword) {
    return { error: "All fields are required." };
  }
  if (adminPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let token: string;
  try {
    const result = await apiFetch<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ organizationName, adminName, adminEmail, adminPassword }),
      auth: false,
    });
    token = result.accessToken;
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 409 ? "That email is already in use." : err.message };
    }
    return { error: "Could not reach the API. Is it running?" };
  }

  await setSessionCookie(token);
  redirect("/dashboard");
}
