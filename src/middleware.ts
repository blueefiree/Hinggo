import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/orders",
  "/seller",
  "/chat",
  "/account",
  "/checkout",
  "/cart",
  "/wishlist",
  "/admin",
];

function isSessionValid(sessionCookie?: string, userIdCookie?: string): boolean {
  if (sessionCookie && sessionCookie.includes(".")) {
    try {
      const parts = sessionCookie.split(".");
      if (parts.length === 2) {
        const jsonStr = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(jsonStr);
        if (payload && payload.exp && Date.now() < payload.exp) {
          return true;
        }
        return false;
      }
    } catch {
      return false;
    }
  }

  const tokenOrId = sessionCookie || userIdCookie;
  return Boolean(tokenOrId && tokenOrId !== "user-naya" && tokenOrId.length > 5);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie = request.cookies.get("hingo_session")?.value;
  const userIdCookie = request.cookies.get("hingo_user_id")?.value;

  const isAuthenticated = isSessionValid(sessionCookie, userIdCookie);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = pathname === "/auth/login" || pathname === "/auth/verify-otp";

  // 1. Kalo baru (belum login) mengakses halaman privat, suruh login (redirect ke halaman login)
  if (isProtected && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // 2. Kalo lama (sesi aktif / sudah login) membuka halaman login, langsung arahkan ke akun/dashboard
  if (isAuthRoute && isAuthenticated) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const dest = (callbackUrl && !callbackUrl.includes("/auth/")) ? callbackUrl : "/account";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/orders/:path*",
    "/orders",
    "/seller/:path*",
    "/seller",
    "/chat/:path*",
    "/chat",
    "/account/:path*",
    "/account",
    "/checkout/:path*",
    "/checkout",
    "/cart/:path*",
    "/cart",
    "/wishlist/:path*",
    "/wishlist",
    "/admin/:path*",
    "/admin",
    "/auth/login",
    "/auth/verify-otp",
  ],
};
