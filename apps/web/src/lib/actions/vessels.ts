"use server";

import { apiFetch, ApiError } from "@/lib/api";
import type { Batch, Vessel } from "@/lib/types";

export interface ResolvedVessel {
  vessel: Vessel;
  batch: Pick<Batch, "id" | "stage" | "status" | "speciesId">;
}

export interface ResolveVesselState {
  vessel?: ResolvedVessel;
  error?: string;
}

/**
 * Resolves a scanned/typed barcode to a vessel (+ its batch, for the confirm-before-context
 * card) via GET /vessels/lookup/:barcode. Called directly from client components — not tied
 * to a <form>'s useActionState — so a barcode can be resolved before the surrounding form
 * (which still submits the real vessel UUID) is ever touched.
 */
export async function resolveVesselByBarcode(barcode: string): Promise<ResolveVesselState> {
  const trimmed = barcode.trim();
  if (!trimmed) {
    return { error: "Enter a barcode." };
  }

  try {
    const vessel = await apiFetch<Vessel>(`/vessels/lookup/${encodeURIComponent(trimmed)}`);
    const batch = await apiFetch<Batch>(`/batches/${vessel.batchId}`);
    return { vessel: { vessel, batch } };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { error: `No vessel matches barcode "${trimmed}".` };
    }
    return { error: err instanceof ApiError ? err.message : "Lookup failed." };
  }
}
