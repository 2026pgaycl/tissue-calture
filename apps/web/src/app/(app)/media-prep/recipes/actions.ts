"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { MediaRecipe } from "@/lib/types";

export interface CreateRecipeState {
  error?: string;
}

export async function createRecipeAction(
  _prev: CreateRecipeState,
  formData: FormData,
): Promise<CreateRecipeState> {
  const name = String(formData.get("name") ?? "").trim();
  const basalMediaType = String(formData.get("basalMediaType") ?? "").trim();
  const targetPh = Number(formData.get("targetPh"));
  const chemicalIds = formData.getAll("chemicalId").map(String);
  const concentrations = formData.getAll("concentration").map(Number);
  const units = formData.getAll("unit").map(String);

  if (!name || !basalMediaType || Number.isNaN(targetPh)) {
    return { error: "Name, basal media type, and target pH are required." };
  }

  const components = chemicalIds
    .map((chemicalId, i) => ({ chemicalId, concentration: concentrations[i], unit: units[i] }))
    .filter((c) => c.chemicalId && !Number.isNaN(c.concentration) && c.unit);

  if (components.length === 0) {
    return { error: "Add at least one component." };
  }

  try {
    await apiFetch<MediaRecipe>("/recipes", {
      method: "POST",
      body: JSON.stringify({ name, basalMediaType, targetPh, components }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create recipe." };
  }

  revalidatePath("/media-prep/recipes");
  return {};
}

export interface CalculationRow {
  chemicalId: string;
  chemicalName: string;
  unit: string;
  requiredQty: number;
  currentStockQty: number;
  sufficient: boolean;
}

export interface CalculateState {
  error?: string;
  rows?: CalculationRow[];
}

export async function calculateRecipeAction(
  recipeId: string,
  _prev: CalculateState,
  formData: FormData,
): Promise<CalculateState> {
  const targetVolumeL = Number(formData.get("targetVolumeL"));
  if (Number.isNaN(targetVolumeL) || targetVolumeL <= 0) {
    return { error: "Enter a target volume in liters." };
  }

  try {
    const rows = await apiFetch<CalculationRow[]>(`/recipes/${recipeId}/calculate`, {
      method: "POST",
      body: JSON.stringify({ targetVolumeL }),
    });
    return { rows };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Calculation failed." };
  }
}
