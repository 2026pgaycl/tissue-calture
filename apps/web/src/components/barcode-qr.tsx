import QRCode from "qrcode";

/**
 * Renders a barcode/ID as a scannable QR code — entirely server-side (no client JS), since
 * `qrcode`'s toDataURL runs fine in a Server Component and just needs an <img>. This is what
 * makes camera scanning actually testable without a physical printed label: pull this up on
 * one screen, scan it with `BarcodeScanner` on another.
 */
export async function BarcodeQr({ value, size = 160 }: { value: string; size?: number }) {
  const dataUrl = await QRCode.toDataURL(value, { width: size, margin: 1 });
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data: URI, not an optimizable asset
    <img
      src={dataUrl}
      alt={`QR code encoding ${value}`}
      width={size}
      height={size}
      className="rounded-md border border-[var(--color-border)] bg-white p-2"
    />
  );
}
