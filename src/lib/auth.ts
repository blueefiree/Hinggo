import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_SECRET = process.env.SESSION_SECRET || "hinggo-secret-session-key-2026";

export interface SessionPayload {
  userId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string;
  role: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kycStatus?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt?: string;
  exp: number;
}

export function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
  durationMs = 30 * 24 * 60 * 60 * 1000 // 30 days
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    city: payload.city || "Jakarta Selatan",
    role: payload.role || "USER",
    phoneVerified: Boolean(payload.phoneVerified),
    emailVerified: Boolean(payload.emailVerified),
    kycStatus: payload.kycStatus || "UNVERIFIED",
    exp: Date.now() + durationMs,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hingo_session")?.value;
    const userId = cookieStore.get("hingo_user_id")?.value;

    const tokenOrId = sessionToken || userId;
    if (!tokenOrId || tokenOrId === "user-naya") {
      return null;
    }

    // 1. Primary: Verified Signed Session Token (Instant, 0 network hops, 100% resilient across lambdas)
    if (sessionToken && sessionToken.includes(".")) {
      const payload = verifySessionToken(sessionToken);
      if (payload) {
        // Coba perkaya relasi dari Prisma (alamat, rekening, kyc, dsb) jika database lokal aktif
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: {
              kycDocument: true,
              addresses: true,
              bankAccounts: true,
            },
          });
          if (dbUser) {
            return dbUser;
          }
        } catch {
          // Instance serverless baru / SQLite ephemeral, gunakan payload tepercaya
        }

        // Return user tepercaya dari session payload
        return {
          id: payload.userId,
          name: payload.name,
          phone: payload.phone || null,
          email: payload.email || null,
          city: payload.city || "Jakarta Selatan",
          role: payload.role || "USER",
          phoneVerified: Boolean(payload.phoneVerified),
          emailVerified: Boolean(payload.emailVerified),
          kycStatus: payload.kycStatus || "UNVERIFIED",
          avatarUrl: payload.avatarUrl || null,
          bio: payload.bio || null,
          createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
          addresses: [],
          bankAccounts: [],
          kycDocument: null,
        };
      }
    }

    // 2. Fallback: Cek Session DB Prisma (untuk token UUID lama jika ada)
    if (sessionToken) {
      try {
        const session = await prisma.session.findUnique({
          where: { token: sessionToken },
          include: {
            user: {
              include: {
                kycDocument: true,
                addresses: true,
                bankAccounts: true,
              },
            },
          },
        });

        if (session && session.expiresAt > new Date()) {
          return session.user;
        }
      } catch (err) {}
    }

    // 3. Fallback: Cek Direct User ID di Prisma
    const targetUserId = userId || (sessionToken && !sessionToken.includes(".") ? sessionToken : null);
    if (targetUserId && targetUserId !== "user-naya") {
      try {
        const directUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          include: {
            kycDocument: true,
            addresses: true,
            bankAccounts: true,
          },
        });

        if (directUser) {
          return directUser;
        }
      } catch (err) {}
    }

    return null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
