"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { PlantSpecies } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createSpeciesAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const scientificName = String(formData.get("scientificName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  try {
    await apiFetch<PlantSpecies>("/plant-species", {
      method: "POST",
      body: JSON.stringify({
        name,
        scientificName: scientificName || undefined,
        notes: notes || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create species." };
  }

  revalidatePath("/admin/species");
  return {};
}
