"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Role, User } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  try {
    await apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create user." };
  }

  revalidatePath("/users");
  return {};
}

export async function updateUserAction(
  userId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const role = String(formData.get("role") ?? "") as Role;
  const active = formData.get("active") === "on";

  try {
    await apiFetch<User>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role, active }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to update user." };
  }

  revalidatePath("/users");
  return {};
}
