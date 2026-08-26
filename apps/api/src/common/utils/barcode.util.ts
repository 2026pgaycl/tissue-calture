import { randomBytes } from "crypto";

export function generateBarcode(prefix: string): string {
  return `${prefix}-${randomBytes(5).toString("hex").toUpperCase()}`;
}
