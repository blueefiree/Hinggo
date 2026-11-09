import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/orders",
  "/seller",
  "/chat",
  "/account",
  "/checkout",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("hingo_session")?.value ||
    request.cookies.get("hingo_user_id")?.value;

  const isAuthenticated = Boolean(sessionCookie && sessionCookie !== "user-naya");

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Jika belum login mencoba membuka halaman privat, arahkan ke login
  if (isProtected && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
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
    "/admin/:path*",
    "/admin",
  ],
};
