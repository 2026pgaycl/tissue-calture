import "server-only";
import { getSession } from "./session";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Attach the current session's bearer token. Default true. Set false for /auth/login. */
  auth?: boolean;
}

/** Matches the NestJS API's error envelope: { error: { code, message, details? } }. */
interface ErrorEnvelope {
  error: { code: string; message: string; details?: unknown };
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (auth) {
    const session = await getSession();
    if (!session) {
      throw new ApiError(401, "Not authenticated");
    }
    requestHeaders.set("Authorization", `Bearer ${session.token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const envelope = body as ErrorEnvelope | null;
    throw new ApiError(
      res.status,
      envelope?.error?.message ?? `Request failed with status ${res.status}`,
      envelope?.error?.code,
      envelope?.error?.details,
    );
  }

  return body as T;
}
