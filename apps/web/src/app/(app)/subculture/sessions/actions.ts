"use server";

import { apiFetch, ApiError } from "@/lib/api";
import type { SubcultureSession, Vessel, VesselType } from "@/lib/types";

export interface StartSessionState {
  error?: string;
  session?: SubcultureSession & { sessionVessels: unknown[] };
}

export async function startSessionAction(
  _prev: StartSessionState,
  formData: FormData,
): Promise<StartSessionState> {
  const workstationId = String(formData.get("workstationId") ?? "");
  const inputVesselIds = formData.getAll("inputVesselIds").map(String).filter(Boolean);

  if (!workstationId || inputVesselIds.length === 0) {
    return { error: "Workstation and at least one resolved input vessel are required." };
  }

  try {
    const session = await apiFetch<StartSessionState["session"]>("/subculture-sessions", {
      method: "POST",
      body: JSON.stringify({ workstationId, inputVesselIds }),
    });
    return { session };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to start session." };
  }
}

export interface CompleteSessionState {
  error?: string;
  outputVessels?: Vessel[];
}

export async function completeSessionAction(
  _prev: CompleteSessionState,
  formData: FormData,
): Promise<CompleteSessionState> {
  const sessionId = String(formData.get("sessionId") ?? "");
  const splitRatio = String(formData.get("splitRatio") ?? "").trim();
  const mediaBatchId = String(formData.get("mediaBatchId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const locationIds = formData.getAll("outputLocationId").map(String);
  const vesselTypes = formData.getAll("outputVesselType").map(String);

  if (!sessionId || !splitRatio) {
    return { error: "Session ID and split ratio are required." };
  }

  const outputs = locationIds
    .map((locationId, i) => ({
      locationId,
      vesselType: vesselTypes[i] ? (vesselTypes[i] as VesselType) : undefined,
    }))
    .filter((o) => o.locationId);

  if (outputs.length === 0) {
    return { error: "Add at least one output vessel location." };
  }

  try {
    const result = await apiFetch<{ outputVessels: Vessel[] }>(`/subculture-sessions/${sessionId}/complete`, {
      method: "PATCH",
      body: JSON.stringify({
        splitRatio,
        outputs,
        mediaBatchId: mediaBatchId || undefined,
        notes: notes || undefined,
      }),
    });
    return { outputVessels: result.outputVessels };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to complete session." };
  }
}
