"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { ContaminationAction, ContaminationEvent, ContaminationType } from "@/lib/types";

export interface FormState {
  error?: string;
}

export async function createContaminationEventAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const vesselId = String(formData.get("vesselId") ?? "");
  const contaminationType = String(formData.get("contaminationType") ?? "") as ContaminationType;
  const locationId = String(formData.get("locationId") ?? "");
  const actionTaken = String(formData.get("actionTaken") ?? "") as ContaminationAction;
  const mediaBatchId = String(formData.get("mediaBatchId") ?? "").trim();
  const workstationId = String(formData.get("workstationId") ?? "").trim();
  const rootCauseNotes = String(formData.get("rootCauseNotes") ?? "").trim();

  if (!vesselId || !contaminationType || !locationId || !actionTaken) {
    return { error: "Vessel, contamination type, location, and action are required." };
  }

  try {
    await apiFetch<ContaminationEvent>("/contamination-events", {
      method: "POST",
      body: JSON.stringify({
        vesselId,
        contaminationType,
        locationId,
        actionTaken,
        mediaBatchId: mediaBatchId || undefined,
        workstationId: workstationId || undefined,
        rootCauseNotes: rootCauseNotes || undefined,
      }),
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to log contamination event." };
  }

  revalidatePath("/qc/contamination-events");
  return {};
}
