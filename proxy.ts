import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin pages, NOT the login page or API
  if (pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/login") &&
      !pathname.startsWith("/admin/_next") &&
      !pathname.endsWith(".svg") &&
      !pathname.endsWith(".ico")) {

    const password = request.cookies.get("admin_token")?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword && password !== adminPassword) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
