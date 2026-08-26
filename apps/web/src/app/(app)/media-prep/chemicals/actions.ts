"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Chemical, ChemicalCategory } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createChemicalAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ChemicalCategory;
  const stockConcentration = Number(formData.get("stockConcentration"));
  const unit = String(formData.get("unit") ?? "").trim();
  const reorderThreshold = Number(formData.get("reorderThreshold"));
  const supplier = String(formData.get("supplier") ?? "").trim();

  if (!name || !category || !unit || Number.isNaN(stockConcentration) || Number.isNaN(reorderThreshold)) {
    return { error: "Fill in name, category, stock concentration, unit, and reorder threshold." };
  }

  try {
    await apiFetch<Chemical>("/chemicals", {
      method: "POST",
      body: JSON.stringify({
        name,
        category,
        stockConcentration,
        unit,
        reorderThreshold,
        supplier: supplier || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to add chemical." };
  }

  revalidatePath("/media-prep/chemicals");
  return {};
}

export async function adjustStockAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const chemicalId = String(formData.get("chemicalId") ?? "");
  const quantity = Number(formData.get("quantity"));

  if (!chemicalId || Number.isNaN(quantity) || quantity === 0) {
    return { error: "Pick a chemical and enter a non-zero quantity." };
  }

  try {
    await apiFetch<Chemical>(`/chemicals/${chemicalId}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to adjust stock." };
  }

  revalidatePath("/media-prep/chemicals");
  return {};
}
