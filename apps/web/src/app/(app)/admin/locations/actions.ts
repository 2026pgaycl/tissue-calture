"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Location } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createLocationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");

  if (!name || !type) {
    return { error: "Name and type are required." };
  }

  try {
    await apiFetch<Location>("/locations", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create location." };
  }

  revalidatePath("/admin/locations");
  return {};
}
