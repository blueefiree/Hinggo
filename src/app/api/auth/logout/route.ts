import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hingo_session")?.value;
    const userId = cookieStore.get("hingo_user_id")?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      }).catch(() => {});
    }

    if (userId) {
      await prisma.session.deleteMany({
        where: { userId },
      }).catch(() => {});
    }

    // Call Supabase signOut
    await supabase.auth.signOut().catch(() => {});

    // Delete cookies
    cookieStore.delete("hingo_session");
    cookieStore.delete("hingo_user_id");
    cookieStore.delete("hingo_user_email");

    return NextResponse.json({ success: true, message: "Berhasil keluar dari akun" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true, message: "Logged out" });
  }
}

export async function GET() {
  return POST();
}

