import { requireSession, hasRole } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { GenerateLabelsPanel } from "./generate-labels-panel";

export default async function VesselLabelsPage() {
  const session = await requireSession();

  if (!hasRole(session, "ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN")) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-text-muted)]">
          Generating vessel labels is restricted to admins, lab managers, and lab technicians.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Vessel Labels</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Pre-print blank vessel labels with a unique barcode and QR code, ready to affix to a physical
          container before it&apos;s scanned in and registered via Vessel Lookup or a subculture session.
        </p>
      </div>

      <Card title="Generate labels">
        <GenerateLabelsPanel />
      </Card>
    </div>
  );
}
