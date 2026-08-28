"use client";

import { useActionState, useEffect, useState } from "react";
import { generateLabelAction, type FormState } from "./actions";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { ClientBarcodeQr } from "@/components/barcode-qr-client";

const initial: FormState = {};

export function GenerateLabelsPanel() {
  const [state, action] = useActionState(generateLabelAction, initial);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (state.barcode) {
      setLabels((prev) => (prev.includes(state.barcode!) ? prev : [...prev, state.barcode!]));
    }
  }, [state.barcode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <form action={action}>
          <SubmitButton pendingText="Generating…">Generate new label</SubmitButton>
        </form>
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
      </div>

      <FormError message={state.error} />

      {labels.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {labels.map((barcode) => (
            <div
              key={barcode}
              className="flex flex-col items-center gap-2 rounded-md border border-[var(--color-border)] p-3 text-center"
            >
              <ClientBarcodeQr value={barcode} size={96} />
              <span className="font-mono text-xs">{barcode}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
