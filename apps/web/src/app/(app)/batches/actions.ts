"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Batch, BatchStage, SourceType } from "@/lib/types";

export interface CreateBatchState {
  error?: string;
}

export async function createBatchAction(
  _prevState: CreateBatchState,
  formData: FormData,
): Promise<CreateBatchState> {
  const speciesId = String(formData.get("speciesId") ?? "");
  const stage = String(formData.get("stage") ?? "") as BatchStage;
  const parentBatchId = String(formData.get("parentBatchId") ?? "").trim();
  const sourceType = String(formData.get("sourceType") ?? "").trim();

  if (!speciesId || !stage) {
    return { error: "Species and stage are required." };
  }

  try {
    await apiFetch<Batch>("/batches", {
      method: "POST",
      body: JSON.stringify({
        speciesId,
        stage,
        parentBatchId: parentBatchId || undefined,
        sourceType: sourceType ? (sourceType as SourceType) : undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to create batch." };
  }

  revalidatePath("/batches");
  return {};
}
