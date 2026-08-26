"use client";

import { useActionState } from "react";
import { createContaminationEventAction, type FormState } from "./actions";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { VesselBarcodeField } from "@/components/vessel-barcode-field";
import type { Location } from "@/lib/types";

const TYPES = ["BACTERIAL", "FUNGAL", "VIRAL", "UNKNOWN", "MIXED"] as const;
const ACTIONS = ["ISOLATED", "DISCARDED", "TREATED"] as const;
const initial: FormState = {};

export function CreateEventForm({ locations }: { locations: Location[] }) {
  const [state, action] = useActionState(createContaminationEventAction, initial);

  return (
    <form action={action} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <VesselBarcodeField name="vesselId" label="Vessel barcode" />
      <Field label="Contamination type" htmlFor="contaminationType">
        <Select id="contaminationType" name="contaminationType" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Location" htmlFor="locationId">
        <Select id="locationId" name="locationId" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Action taken" htmlFor="actionTaken">
        <Select id="actionTaken" name="actionTaken" required defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Media batch ID (optional)" htmlFor="mediaBatchId">
        <Input id="mediaBatchId" name="mediaBatchId" placeholder="uuid" />
      </Field>
      <Field label="Workstation ID (optional)" htmlFor="workstationId">
        <Input id="workstationId" name="workstationId" placeholder="uuid" />
      </Field>
      <div className="sm:col-span-2 lg:col-span-3">
        <Field label="Root cause notes" htmlFor="rootCauseNotes">
          <Input id="rootCauseNotes" name="rootCauseNotes" />
        </Field>
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <FormError message={state.error} />
      </div>
      <SubmitButton>Log event</SubmitButton>
    </form>
  );
}
