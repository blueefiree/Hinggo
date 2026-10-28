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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const sessionCookie =
      request.cookies.get("hingo_session")?.value ||
      request.cookies.get("hingo_user_id")?.value;

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
  ],
};

