import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const PROTECTED_PREFIXES = [
  "/cart",
  "/wishlist",
  "/orders",
  "/seller",
  "/chat",
  "/account",
  "/checkout",
  "/admin",
];

const AUTH_PAGES = ["/auth/login", "/auth/verify-otp"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Initialize Supabase client for cookie refresh
  const { supabase, supabaseResponse } = createClient(request);
  const { data: { user: supabaseUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  const isAuthenticated = Boolean(
    request.cookies.get("hingo_user_id")?.value ||
    request.cookies.get("hingo_session")?.value ||
    supabaseUser?.id
  );

  // ATURAN A — JIKA SUDAH LOGIN: Lempar dari halaman login/verify ke /account
  const isAuthPage = AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // ATURAN B — JIKA BELUM LOGIN: Lempar dari halaman privat ke /auth/login
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
      );
    }
  }

  return supabaseResponse;
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
    "/admin/:path*",
    "/admin",
    "/auth/login",
    "/auth/verify-otp",
  ],
};
