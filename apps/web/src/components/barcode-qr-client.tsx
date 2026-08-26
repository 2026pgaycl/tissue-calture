"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * Client-side counterpart to `BarcodeQr` (which is a Server Component and can't be imported
 * into a "use client" file) — for showing a scannable code right after a client-driven form
 * submission, e.g. a "vessel registered" success state, without a page reload.
 */
export function ClientBarcodeQr({ value, size = 128 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1 }).catch(() => {});
    }
  }, [value, size]);

  return <canvas ref={canvasRef} className="rounded-md border border-[var(--color-border)] bg-white p-2" />;
}
