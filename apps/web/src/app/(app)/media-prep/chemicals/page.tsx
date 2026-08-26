import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Chemical } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CreateChemicalForm, AdjustStockForm } from "./chemical-forms";

export default async function ChemicalsPage() {
  const session = await requireSession();
  const chemicals = await apiFetch<Chemical[]>("/chemicals");
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER", "MEDIA_PREP_STAFF");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Chemicals</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Raw stock: salts, vitamins, PGRs, gelling agents, sugars.
        </p>
      </div>

      {canManage && (
        <Card title="Add chemical">
          <CreateChemicalForm />
        </Card>
      )}

      <Card title={`${chemicals.length} chemical${chemicals.length === 1 ? "" : "s"}`}>
        <DataTable
          rows={chemicals}
          rowKey={(c) => c.id}
          emptyMessage="No chemicals recorded yet."
          columns={[
            { header: "Name", cell: (c) => c.name },
            { header: "Category", cell: (c) => c.category.replace(/_/g, " ") },
            { header: "Stock conc.", cell: (c) => `${c.stockConcentration} ${c.unit}` },
            {
              header: "Current qty",
              cell: (c) => (
                <span className="flex items-center gap-2">
                  {c.currentStockQty}
                  {c.currentStockQty <= c.reorderThreshold && <Badge tone="warn">Low stock</Badge>}
                </span>
              ),
            },
            { header: "Reorder at", cell: (c) => c.reorderThreshold },
            { header: "Supplier", cell: (c) => c.supplier ?? "—" },
          ]}
        />
      </Card>

      {canManage && chemicals.length > 0 && (
        <Card title="Adjust stock">
          <AdjustStockForm chemicals={chemicals} />
        </Card>
      )}
    </div>
  );
}
