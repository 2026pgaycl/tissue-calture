import { requireSession } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { DiscardLogForm } from "./discard-log-form";

export default async function DiscardLogsPage() {
  await requireSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Discard Logs</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Logging a discard marks the vessel DISCARDED. Look up a vessel&apos;s full history on
          the Vessel Lookup page.
        </p>
      </div>
      <Card title="Log a discard">
        <DiscardLogForm />
      </Card>
    </div>
  );
}
