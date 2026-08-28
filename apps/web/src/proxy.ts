import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep in sync with SESSION_COOKIE in lib/session.ts. Inlined (rather than imported) so this
// file's bundle doesn't pull in `next/headers`/`server-only` — this is only an optimistic
// check; the NestJS API is the real trust boundary on every request.
const SESSION_COOKIE = "tcms_session";
const PUBLIC_ROUTES = ["/login", "/signup", "/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!isPublic && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Excludes Next.js internals plus any request for a static file (by extension) — anything
  // under public/ (logo.png, favicon.ico, etc.) must stay servable with no session, or Next's
  // image optimizer ends up trying to decode the redirect HTML as image bytes.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?)$).*)"],
};
