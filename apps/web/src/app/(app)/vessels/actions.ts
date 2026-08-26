"use server";

import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import type { Vessel, VesselType } from "@/lib/types";

export interface RegisterVesselState {
  error?: string;
  createdBarcode?: string;
}

export async function registerVesselAction(
  _prevState: RegisterVesselState,
  formData: FormData,
): Promise<RegisterVesselState> {
  const batchId = String(formData.get("batchId") ?? "");
  const vesselType = String(formData.get("vesselType") ?? "") as VesselType;
  const locationId = String(formData.get("locationId") ?? "");

  if (!batchId || !vesselType || !locationId) {
    return { error: "Batch, vessel type, and location are required." };
  }

  try {
    const vessel = await apiFetch<Vessel>("/vessels", {
      method: "POST",
      body: JSON.stringify({ batchId, vesselType, locationId }),
    });
    revalidatePath("/vessels");
    return { createdBarcode: vessel.barcode };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : "Failed to register vessel." };
  }
}
