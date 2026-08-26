"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Workstation } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createWorkstationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const locationId = String(formData.get("locationId") ?? "");
  const hoodType = String(formData.get("hoodType") ?? "").trim();

  if (!name || !locationId) {
    return { error: "Name and location are required." };
  }

  try {
    await apiFetch<Workstation>("/workstations", {
      method: "POST",
      body: JSON.stringify({ name, locationId, hoodType: hoodType || undefined }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create workstation." };
  }

  revalidatePath("/subculture/workstations");
  return {};
}
