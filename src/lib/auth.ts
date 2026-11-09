import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hingo_session")?.value;
    const userId = cookieStore.get("hingo_user_id")?.value;

    const tokenOrId = sessionToken || userId;
    if (!tokenOrId || tokenOrId === "user-naya") {
      return null;
    }

    // 1. Primary: Look up persistent session in Prisma Session table
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

        if (session) {
          if (session.expiresAt > new Date()) {
            return session.user;
          } else {
            await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
          }
        }
      } catch (err) {
        // Prisma fallback
      }
    }

    // 2. Fallback: Direct User ID in Prisma
    const targetUserId = userId || sessionToken;
    if (targetUserId) {
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
      } catch (err) {
        // Prisma fallback
      }

      // 3. Cloud Fallback: Look up user in Supabase public.users (with 1500ms safety timeout)
      try {
        const fetchSb = async () => {
          const { data: sbUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", targetUserId)
            .single();

          if (!sbUser) return null;

          return {
            id: sbUser.id,
            name: sbUser.name,
            phone: sbUser.phone,
            email: sbUser.email,
            city: sbUser.city || "Jakarta Selatan",
            avatarUrl: sbUser.avatar_url,
            bio: sbUser.bio,
            role: sbUser.role || "USER",
            phoneVerified: Boolean(sbUser.phone_verified),
            emailVerified: Boolean(sbUser.email_verified),
            kycStatus: sbUser.kyc_status || "UNVERIFIED",
            createdAt: sbUser.created_at,
            addresses: [],
            bankAccounts: [],
            kycDocument: null,
          };
        };

        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const result = await Promise.race([fetchSb(), timeout]);
        if (result) return result as any;
      } catch (sbErr) {
        // Safe fallback
      }
    }

    return null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
