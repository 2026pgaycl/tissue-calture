"use client";

import { useActionState, useEffect, useState } from "react";
import { generateLabelAction, type FormState, type GeneratedLabel } from "./actions";
import { Field, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { ClientBarcodeQr } from "@/components/barcode-qr-client";

const VESSEL_TYPES = ["JAR", "TRAY", "TUBE", "BAG"] as const;
const initial: FormState = {};

export function GenerateLabelsPanel() {
  const [state, action] = useActionState(generateLabelAction, initial);
  const [labels, setLabels] = useState<GeneratedLabel[]>([]);

  useEffect(() => {
    if (state.label) {
      setLabels((prev) =>
        prev.some((l) => l.barcode === state.label!.barcode) ? prev : [...prev, state.label!],
      );
    }
  }, [state.label]);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field label="Vessel type" htmlFor="vesselType">
          <Select id="vesselType" name="vesselType" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {VESSEL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <SubmitButton pendingText="Generating…">Generate new label</SubmitButton>
        {labels.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              Print labels
            </button>
            <button
              type="button"
              onClick={() => setLabels([])}
              className="text-sm text-[var(--color-text-muted)] hover:underline"
            >
              Clear
            </button>
          </>
        )}
      </form>

      <FormError message={state.error} />

      {labels.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {labels.map((label) => (
            <div
              key={label.barcode}
              className="flex flex-col items-center gap-2 rounded-md border border-[var(--color-border)] p-3 text-center"
            >
              <ClientBarcodeQr value={label.barcode} size={96} />
              <span className="font-mono text-xs">{label.barcode}</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {label.vesselType} · {label.year} · #{label.sequenceNumber}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
