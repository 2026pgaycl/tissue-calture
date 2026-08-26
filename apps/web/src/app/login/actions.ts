"use server";

import { redirect } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { setSessionCookie } from "@/lib/session";

export interface LoginState {
  error?: string;
}

interface LoginResponse {
  accessToken: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  let token: string;
  try {
    const result = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    token = result.accessToken;
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 401 ? "Invalid email or password." : err.message };
    }
    return { error: "Could not reach the API. Is it running?" };
  }

  await setSessionCookie(token);
  redirect("/dashboard");
}
