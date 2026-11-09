import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

/**
 * Memastikan record User secara fisik tersimpan di database Prisma SQLite lokal.
 * Mencegah error 'Foreign key constraint violated' saat pembuatan barang titipan, alamat, atau pesanan.
 */
export async function ensurePrismaUser(user: {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  role?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kycStatus?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}) {
  if (!user || !user.id || user.id === "user-naya") return null;
  try {
    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });
    if (existing) return existing;

    const emailNorm = user.email?.trim()?.toLowerCase() || null;
    const phoneNorm = user.phone?.trim() || null;

    if (emailNorm || phoneNorm) {
      const match = await prisma.user.findFirst({
        where: {
          OR: [
            ...(emailNorm ? [{ email: emailNorm }] : []),
            ...(phoneNorm ? [{ phone: phoneNorm }] : []),
          ],
        },
        include: {
          kycDocument: true,
          addresses: true,
          bankAccounts: true,
        },
      });
      if (match) return match;
    }

    return await prisma.user.create({
      data: {
        id: user.id,
        name: user.name || "Pengguna Hingo",
        email: emailNorm,
        phone: phoneNorm,
        city: user.city || "Jakarta Selatan",
        role: user.role || "USER",
        phoneVerified: Boolean(user.phoneVerified),
        emailVerified: Boolean(user.emailVerified),
        kycStatus: user.kycStatus || "UNVERIFIED",
        avatarUrl: user.avatarUrl || null,
        bio: user.bio || null,
      },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });
  } catch (err) {
    console.warn("ensurePrismaUser fallback:", err);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hingo_session")?.value;
    const userId = cookieStore.get("hingo_user_id")?.value;
    const userEmail = cookieStore.get("hingo_user_email")?.value;

    const tokenOrIdOrEmail = sessionToken || userId || userEmail;
    if (!tokenOrIdOrEmail || tokenOrIdOrEmail === "user-naya") {
      return null;
    }

    // ====================================================================
    // ATURAN 1: RESOLUSI UTAMA BERBASIS EMAIL PENGGUNA (Anti-Hilang saat refresh)
    // ====================================================================
    if (userEmail && userEmail.includes("@")) {
      const normEmail = userEmail.trim().toLowerCase();
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: normEmail },
          include: {
            kycDocument: true,
            addresses: true,
            bankAccounts: true,
          },
        });
        if (dbUser) {
          return dbUser;
        }
      } catch (err) {
        console.warn("Prisma user by email lookup error:", err);
      }

      // Cek Supabase jika di Prisma lokal belum ada (Sinkronisasi cloud ke lokal)
      try {
        const { data: sbUsers } = await supabase
          .from("users")
          .select("*")
          .eq("email", normEmail)
          .limit(1);

        if (sbUsers && sbUsers.length > 0) {
          const su = sbUsers[0];
          const ensured = await ensurePrismaUser({
            id: su.id || crypto.randomUUID(),
            name: su.name || normEmail.split("@")[0],
            email: normEmail,
            phone: su.phone || null,
            city: su.city || "Jakarta Selatan",
            role: su.role || "USER",
            emailVerified: Boolean(su.email_verified),
            phoneVerified: Boolean(su.phone_verified),
            kycStatus: su.kyc_status || "UNVERIFIED",
            avatarUrl: su.avatar_url || null,
          });

          if (ensured) return ensured;

          return {
            id: su.id || `user-${Date.now()}`,
            name: su.name || normEmail.split("@")[0],
            email: normEmail,
            phone: su.phone || null,
            city: su.city || "Jakarta Selatan",
            role: su.role || "USER",
            emailVerified: true,
            phoneVerified: Boolean(su.phone_verified),
            kycStatus: su.kyc_status || "UNVERIFIED",
            avatarUrl: su.avatar_url || null,
            bio: null,
            createdAt: new Date(),
            addresses: [],
            bankAccounts: [],
            kycDocument: null,
          };
        }
      } catch (sbErr) {
        console.warn("Supabase user by email lookup bypassed:", sbErr);
      }
    }

    // ====================================================================
    // RESOLUSI KEDUA: VERIFIED SIGNED SESSION TOKEN (30 Hari)
    // ====================================================================
    if (sessionToken && sessionToken.includes(".")) {
      const payload = verifySessionToken(sessionToken);
      if (payload) {
        const targetEmail = payload.email?.trim()?.toLowerCase();
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                ...(targetEmail ? [{ email: targetEmail }] : []),
                { id: payload.userId },
              ],
            },
            include: {
              kycDocument: true,
              addresses: true,
              bankAccounts: true,
            },
          });
          if (dbUser) {
            return dbUser;
          }
        } catch {}

        // Pastikan user ini tersimpan secara fisik di Prisma SQLite
        const ensured = await ensurePrismaUser({
          id: payload.userId,
          name: payload.name,
          email: payload.email || (payload.phone ? `${payload.phone.replace(/\D/g, "")}@wa.hingo.id` : null),
          phone: payload.phone || null,
          city: payload.city || "Jakarta Selatan",
          role: payload.role || "USER",
          phoneVerified: Boolean(payload.phoneVerified),
          emailVerified: Boolean(payload.emailVerified),
          kycStatus: payload.kycStatus || "UNVERIFIED",
          avatarUrl: payload.avatarUrl || null,
          bio: payload.bio || null,
        });

        if (ensured) return ensured;

        // Return user tepercaya dari session payload
        return {
          id: payload.userId,
          name: payload.name,
          phone: payload.phone || null,
          email: payload.email || (payload.phone ? `${payload.phone.replace(/\D/g, "")}@wa.hingo.id` : null),
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

    // ====================================================================
    // RESOLUSI KETIGA: FALLBACK DIRECT USER ID DI PRISMA
    // ====================================================================
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
      } catch {}
    }

    return null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
