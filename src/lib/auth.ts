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

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    return user || null;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

