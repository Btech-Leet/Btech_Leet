import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const adminPaths = ["/admin"];
const authPaths = ["/dashboard", "/profile", "/saved"];
const guestOnlyPaths = ["/auth/login", "/auth/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  // Admin protection
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login?redirect=" + pathname, req.url));
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Auth-required paths
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login?redirect=" + pathname, req.url));
    }
  }

  // Guest-only paths (redirect logged-in users)
  if (guestOnlyPaths.some((p) => pathname.startsWith(p))) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

export { proxy as middleware };
