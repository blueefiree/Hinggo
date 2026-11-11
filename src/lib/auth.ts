import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { requireEnv } from "@/lib/env";

function getSessionSecret(): string {
  return requireEnv("SESSION_SECRET");
}

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
    .createHmac("sha256", getSessionSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(data)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

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
export async function ensureSupabaseUser(user: {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  role?: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kycStatus?: string | null;
}) {
  if (!user || !user.id || user.id === "user-naya") return;
  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("users").insert({
        id: user.id,
        name: user.name || "Pengguna Hingo",
        email: user.email || null,
        phone: user.phone || null,
        city: user.city || "Jakarta Selatan",
        role: user.role || "USER",
        phone_verified: Boolean(user.phoneVerified),
        email_verified: Boolean(user.emailVerified),
        kyc_status: user.kycStatus || "UNVERIFIED",
      });
    }
  } catch (e) {
    console.warn("ensureSupabaseUser fallback:", e);
  }
}

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

    if (!sessionToken || !sessionToken.includes(".")) {
      return null;
    }

    const payload = verifySessionToken(sessionToken);
    if (!payload || !payload.userId) {
      return null;
    }

    // Ambil detail profil user dari database lokal Prisma untuk relasi (addresses, bankAccounts, kycDocument)
    let userFromDb: any = null;
    try {
      userFromDb = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          kycDocument: true,
          addresses: true,
          bankAccounts: true,
        },
      });
    } catch {}

    if (userFromDb) {
      return {
        ...userFromDb,
        role: payload.role || userFromDb.role || "USER",
      };
    }

    // Jika di Prisma lokal belum ada (misal di serverless Vercel), cek Supabase users
    try {
      const { data: sbUsers } = await supabase
        .from("users")
        .select("*")
        .eq("id", payload.userId)
        .limit(1);

      if (sbUsers && sbUsers.length > 0) {
        const su = sbUsers[0];
        return {
          id: su.id,
          name: su.name || payload.name,
          email: su.email || payload.email || null,
          phone: su.phone || payload.phone || null,
          city: su.city || payload.city || "Jakarta Selatan",
          role: payload.role || su.role || "USER",
          emailVerified: Boolean(su.email_verified ?? payload.emailVerified),
          phoneVerified: Boolean(su.phone_verified ?? payload.phoneVerified),
          kycStatus: su.kyc_status || payload.kycStatus || "UNVERIFIED",
          avatarUrl: su.avatar_url || payload.avatarUrl || null,
          bio: su.bio || payload.bio || null,
          createdAt: su.created_at ? new Date(su.created_at) : new Date(),
          addresses: [],
          bankAccounts: [],
          kycDocument: null,
        };
      }
    } catch {}

    // Fallback ke data payload terverifikasi
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
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
