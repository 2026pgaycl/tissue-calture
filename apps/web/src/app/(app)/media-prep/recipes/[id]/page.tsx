import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { requireSession, hasRole } from "@/lib/dal";
import type { MediaRecipe } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CalculateForm } from "./calculate-form";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;

  let recipe: MediaRecipe;
  try {
    recipe = await apiFetch<MediaRecipe>(`/recipes/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/media-prep/recipes" className="text-sm text-[var(--color-accent)]">
          ← Recipes
        </Link>
        <h1 className="mt-1 text-xl font-semibold">{recipe.name}</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {recipe.basalMediaType} · target pH {recipe.targetPh}
        </p>
      </div>

      <Card title="Components">
        <DataTable
          rows={recipe.components}
          rowKey={(c) => c.id}
          columns={[
            { header: "Chemical", cell: (c) => c.chemical.name },
            { header: "Concentration", cell: (c) => `${c.concentration} ${c.unit}` },
            { header: "Stock conc.", cell: (c) => `${c.chemical.stockConcentration} ${c.chemical.unit}` },
          ]}
        />
      </Card>

      {hasRole(session, "ADMIN", "LAB_MANAGER", "MEDIA_PREP_STAFF") && (
        <Card title="Calculate quantities for a media batch">
          <CalculateForm recipeId={recipe.id} />
        </Card>
      )}
    </div>
  );
}
