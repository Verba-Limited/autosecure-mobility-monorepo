import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const token = request.cookies.get("autosecure_supplier_access_token")?.value;

  console.log(`[PROXY DEBUG] Middleware checking route: ${pathname}`, {
    isAuthRoute,
    hasCookieToken: Boolean(token),
    cookieValue: token ? `${token.slice(0, 15)}...` : null,
  });

  if (token && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    console.log(`[PROXY DEBUG] Redirecting authenticated user away from auth route (${pathname}) to /`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
