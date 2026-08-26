import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { Chemical, MediaRecipe } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CreateRecipeForm } from "./create-recipe-form";

export default async function RecipesPage() {
  const session = await requireSession();
  const canManage = hasRole(session, "ADMIN", "LAB_MANAGER", "MEDIA_PREP_STAFF");

  const [recipes, chemicals] = await Promise.all([
    apiFetch<MediaRecipe[]>("/recipes"),
    canManage ? apiFetch<Chemical[]>("/chemicals") : Promise.resolve<Chemical[]>([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Media Recipes</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Basal media, PGRs, vitamins, and gelling agents, with auto-calculated quantities.
        </p>
      </div>

      {canManage && (
        <Card title="New recipe">
          <CreateRecipeForm chemicals={chemicals} />
        </Card>
      )}

      <Card title={`${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`}>
        <DataTable
          rows={recipes}
          rowKey={(r) => r.id}
          emptyMessage="No recipes yet."
          columns={[
            { header: "Name", cell: (r) => r.name },
            { header: "Basal media", cell: (r) => r.basalMediaType },
            { header: "Target pH", cell: (r) => r.targetPh },
            { header: "Components", cell: (r) => r.components.length },
            {
              header: "",
              cell: (r) => (
                <Link href={`/media-prep/recipes/${r.id}`} className="text-[var(--color-accent)]">
                  View →
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
