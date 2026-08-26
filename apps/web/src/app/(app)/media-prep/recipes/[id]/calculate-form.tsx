"use client";

import { useActionState } from "react";
import { calculateRecipeAction, type CalculateState } from "../actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

const initial: CalculateState = {};

export function CalculateForm({ recipeId }: { recipeId: string }) {
  const boundAction = calculateRecipeAction.bind(null, recipeId);
  const [state, action] = useActionState(boundAction, initial);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex items-end gap-3">
        <div className="w-48">
          <Field label="Target volume (L)" htmlFor="targetVolumeL">
            <Input id="targetVolumeL" name="targetVolumeL" type="number" step="any" required />
          </Field>
        </div>
        <SubmitButton>Calculate</SubmitButton>
      </form>
      <FormError message={state.error} />
      {state.rows && (
        <DataTable
          rows={state.rows}
          rowKey={(r) => r.chemicalId}
          columns={[
            { header: "Chemical", cell: (r) => r.chemicalName },
            { header: "Required", cell: (r) => `${r.requiredQty.toFixed(3)} ${r.unit}` },
            { header: "In stock", cell: (r) => r.currentStockQty },
            {
              header: "Status",
              cell: (r) => (
                <Badge tone={r.sufficient ? "success" : "danger"}>
                  {r.sufficient ? "Sufficient" : "Insufficient"}
                </Badge>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
