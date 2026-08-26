"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { AutoclaveResult, MediaBatch } from "@/lib/types";

export interface InsufficientStock {
  chemicalId: string;
  chemicalName: string;
  qty: number;
  available: number;
}

export interface FormState {
  error?: string;
  insufficient?: InsufficientStock[];
}

export async function createMediaBatchAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const recipeId = String(formData.get("recipeId") ?? "");
  const targetVolumeL = Number(formData.get("targetVolumeL"));
  const expirationDate = String(formData.get("expirationDate") ?? "");

  if (!recipeId || Number.isNaN(targetVolumeL) || !expirationDate) {
    return { error: "Recipe, target volume, and expiration date are required." };
  }

  try {
    await apiFetch<MediaBatch>("/media-batches", {
      method: "POST",
      body: JSON.stringify({ recipeId, targetVolumeL, expirationDate }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      const details = err.details as { insufficient?: InsufficientStock[] } | undefined;
      return { error: err.message, insufficient: details?.insufficient };
    }
    return { error: "Failed to create media batch." };
  }

  revalidatePath("/media-prep/media-batches");
  return {};
}

export async function logAutoclaveAction(
  mediaBatchId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const cycleDate = String(formData.get("cycleDate") ?? "");
  const temperatureC = Number(formData.get("temperatureC"));
  const pressureKpa = Number(formData.get("pressureKpa"));
  const durationMin = Number(formData.get("durationMin"));
  const result = String(formData.get("result") ?? "") as AutoclaveResult;

  if (!cycleDate || Number.isNaN(temperatureC) || Number.isNaN(pressureKpa) || Number.isNaN(durationMin) || !result) {
    return { error: "All autoclave fields are required." };
  }

  try {
    await apiFetch(`/media-batches/${mediaBatchId}/autoclave-log`, {
      method: "POST",
      body: JSON.stringify({ cycleDate, temperatureC, pressureKpa, durationMin, result }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to log autoclave cycle." };
  }

  revalidatePath(`/media-prep/media-batches/${mediaBatchId}`);
  return {};
}
