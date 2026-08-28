"use server";

import { apiFetch, ApiError } from "@/lib/api";
import type { VesselType } from "@/lib/types";

export interface GeneratedLabel {
  barcode: string;
  vesselType: VesselType;
  year: number;
  sequenceNumber: number;
}

export interface FormState {
  label?: GeneratedLabel;
  error?: string;
}

export async function generateLabelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const vesselType = String(formData.get("vesselType") ?? "");

  if (!vesselType) {
    return { error: "Select a vessel type first." };
  }

  try {
    const label = await apiFetch<GeneratedLabel>(
      `/vessels/generate-label?vesselType=${encodeURIComponent(vesselType)}`,
    );
    return { label };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to generate label." };
  }
}
