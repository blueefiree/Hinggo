import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get("hingo_session")?.value ||
      cookieStore.get("hingo_user_id")?.value;

    if (!sessionToken || sessionToken === "user-naya") {
      return null;
    }

    // 1. Primary: Look up persistent session in Session table
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
      // Check if session has not expired
      if (session.expiresAt > new Date()) {
        return session.user;
      } else {
        // Expired session: clean up
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }
    }

    // 2. Fallback: Direct User ID (for admin or legacy sessions)
    const directUser = await prisma.user.findUnique({
      where: { id: sessionToken },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    return directUser || null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
