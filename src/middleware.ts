import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/cart",
  "/wishlist",
  "/orders",
  "/seller",
  "/chat",
  "/account",
  "/checkout",
];

const AUTH_PAGES = ["/auth/login", "/auth/verify-otp"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie =
    request.cookies.get("hingo_session")?.value ||
    request.cookies.get("hingo_user_id")?.value;

  // Auto-redirect already logged-in users away from /auth/login and /auth/verify-otp
  const isAuthPage = AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Protect private pages
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!sessionCookie) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/cart",
    "/wishlist/:path*",
    "/wishlist",
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
    "/auth/login",
    "/auth/verify-otp",
  ],
};
