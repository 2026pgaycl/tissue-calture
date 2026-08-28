"use server";

import { apiFetch, ApiError } from "@/lib/api";

export interface FormState {
  barcode?: string;
  error?: string;
}

export async function generateLabelAction(_prev: FormState, _formData: FormData): Promise<FormState> {
  try {
    const result = await apiFetch<{ barcode: string }>("/vessels/generate-label");
    return { barcode: result.barcode };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to generate label." };
  }
}
