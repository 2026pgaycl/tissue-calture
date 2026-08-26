"use server";

import { apiFetch, ApiError } from "@/lib/api";
import type { BatchStage, DiscardLog, DiscardReason } from "@/lib/types";

export interface FormState {
  error?: string;
  logged?: DiscardLog;
}

export async function createDiscardLogAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const vesselId = String(formData.get("vesselId") ?? "");
  const reason = String(formData.get("reason") ?? "") as DiscardReason;
  const stageAtDiscard = String(formData.get("stageAtDiscard") ?? "") as BatchStage;

  if (!vesselId || !reason || !stageAtDiscard) {
    return { error: "Vessel, reason, and stage are required." };
  }

  try {
    const logged = await apiFetch<DiscardLog>("/discard-logs", {
      method: "POST",
      body: JSON.stringify({ vesselId, reason, stageAtDiscard }),
    });
    return { logged };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to log discard." };
  }
}
