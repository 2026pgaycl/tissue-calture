"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";

type Status = "requesting" | "needsTap" | "playing" | "error";

/**
 * Opens the device camera and decodes a barcode/QR code from the live video feed using
 * @zxing/browser (works across Chrome/Firefox/Safari, unlike the native BarcodeDetector API
 * which Safari/Firefox still don't ship). Calls `onDetected` once with the decoded text and
 * stops the camera immediately — this is a single-shot scan, not a continuous reader.
 *
 * We manage getUserMedia and video.play() ourselves rather than handing that to
 * @zxing/browser's `decodeFromConstraints`: their internal play() call happens a few async
 * hops away from the button tap that opened this modal, and on browsers with a stricter
 * autoplay policy that gets silently blocked — their own code catches the rejection with only
 * a `console.warn`, so nothing ever reaches our error state. Symptom: a permanently black
 * video box with no error message. Managing play() ourselves lets us catch that and fall back
 * to a "tap to start" affordance, which is a fresh user gesture and satisfies the policy.
 */
export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (text: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [status, setStatus] = useState<Status>("requesting");
  const [error, setError] = useState<string | null>(null);

  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  function startDecoding() {
    const video = videoRef.current;
    if (!video) return;
    new BrowserMultiFormatReader()
      .decodeFromVideoElement(video, (result, _err, controls) => {
        if (!result) return;
        controls.stop();
        onDetectedRef.current(result.getText());
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch(() => {
        // Video is visibly playing at this point; decoding just didn't start. Leave it be —
        // the user can still Cancel and retry rather than seeing a dead-end error.
      });
  }

  async function attemptPlay() {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setStatus("playing");
      startDecoding();
    } catch {
      setStatus("needsTap");
    }
  }

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        void attemptPlay();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setError(
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access and try again."
            : "Couldn't access a camera on this device.",
        );
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg bg-[var(--color-surface)] p-4">
        <p className="text-sm font-medium">Scan a barcode</p>
        {status === "error" ? (
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        ) : (
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {status === "requesting" && (
              <p className="absolute inset-0 flex items-center justify-center text-xs text-white/70">
                Requesting camera…
              </p>
            )}
            {status === "needsTap" && (
              <button
                type="button"
                onClick={attemptPlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white"
              >
                Tap to start camera
              </button>
            )}
          </div>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
