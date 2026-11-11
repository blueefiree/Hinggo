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

async function verifySessionTokenEdge(
  sessionToken?: string
): Promise<{ isValid: boolean; role?: string; userId?: string }> {
  if (!sessionToken || !sessionToken.includes(".")) {
    return { isValid: false };
  }

  try {
    const [data, signature] = sessionToken.split(".");
    if (!data || !signature) return { isValid: false };

    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.trim() === "") return { isValid: false };

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    const bytes = new Uint8Array(sigBuf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) {
      return { isValid: false };
    }

    const jsonStr = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(jsonStr);

    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return { isValid: false };
    }

    return {
      isValid: true,
      role: payload.role || "USER",
      userId: payload.userId,
    };
  } catch {
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const sessionCookie = request.cookies.get("hingo_session")?.value;
  const session = await verifySessionTokenEdge(sessionCookie);

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthRoute = pathname === "/auth/login" || pathname === "/auth/verify-otp";

  // 1. Proteksi Khusus Admin: Wajib login DAN Wajib role ADMIN
  if (isAdminRoute) {
    if (!session.isValid) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
      );
    }
    if (session.role !== "ADMIN") {
      // User biasa mengakses /admin -> Ditolak (redirect ke /account dengan notifikasi akses ditolak)
      return NextResponse.redirect(
        new URL("/account?error=unauthorized_admin", request.url)
      );
    }
    return NextResponse.next();
  }

  // 2. Proteksi Halaman Privat
  if (isProtected && !session.isValid) {
    const callbackUrl = encodeURIComponent(pathname + search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // 3. Pengguna yang sudah login membuka halaman auth login -> langsung ke dashboard
  if (isAuthRoute && session.isValid) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const dest = callbackUrl && !callbackUrl.includes("/auth/") ? callbackUrl : "/account";
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
