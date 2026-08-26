"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";

/**
 * Opens the device camera and decodes a barcode/QR code from the live video feed using
 * @zxing/browser (works across Chrome/Firefox/Safari, unlike the native BarcodeDetector API
 * which Safari/Firefox still don't ship). Calls `onDetected` once with the decoded text and
 * stops the camera immediately — this is a single-shot scan, not a continuous reader.
 */
export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest callbacks without making the mount effect below re-run on every render.
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result, _err, controls) => {
          if (cancelled || !result) return;
          controls.stop();
          onDetectedRef.current(result.getText());
        },
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access and try again."
            : "Couldn't access a camera on this device.",
        );
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-[var(--color-surface)] p-4">
        <p className="text-sm font-medium">Scan a barcode</p>
        {error ? (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        ) : (
          <video
            ref={videoRef}
            className="aspect-square w-full rounded-md bg-black object-cover"
            muted
            autoPlay
            playsInline
          />
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
