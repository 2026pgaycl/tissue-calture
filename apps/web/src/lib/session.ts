import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "tcms_session";

export type Role = "ADMIN" | "LAB_MANAGER" | "LAB_TECHNICIAN" | "MEDIA_PREP_STAFF";

export interface Session {
  token: string;
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

interface DecodedPayload {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

/**
 * Decodes the JWT payload without verifying the signature. This is an optimistic
 * read only (route protection, nav rendering) — every actual API call re-validates
 * the token against the NestJS backend, which is the real trust boundary.
 */
function decodeToken(token: string): DecodedPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(json) as DecodedPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;
  if (payload.exp * 1000 < Date.now()) return null;

  return { token, ...payload };
}

export async function setSessionCookie(token: string) {
  const payload = decodeToken(token);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: payload ? new Date(payload.exp * 1000) : undefined,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
