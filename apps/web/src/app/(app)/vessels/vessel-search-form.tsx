"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "@/components/barcode-scanner";

export function VesselSearchForm({ initialBarcode }: { initialBarcode: string }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const router = useRouter();

  function handleScanned(text: string) {
    setScannerOpen(false);
    router.push(`/vessels?barcode=${encodeURIComponent(text)}`);
  }

  return (
    <>
      <form action="/vessels" className="flex items-end gap-3">
        <div className="flex-1">
          <Field label="Barcode" htmlFor="barcode">
            <Input
              id="barcode"
              name="barcode"
              defaultValue={initialBarcode}
              placeholder="VSL-XXXXXXXXXX"
              autoFocus
              autoComplete="off"
            />
          </Field>
        </div>
        <Button type="button" variant="secondary" onClick={() => setScannerOpen(true)} title="Scan with camera">
          📷 Scan
        </Button>
        <Button type="submit">Look up</Button>
      </form>
      {scannerOpen && <BarcodeScanner onDetected={handleScanned} onClose={() => setScannerOpen(false)} />}
    </>
  );
}
