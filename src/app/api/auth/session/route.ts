import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Session API error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, role } = await req.json();
    const cookieStore = await cookies();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    if (!user && userId === "user-admin") {
      user = await prisma.user.upsert({
        where: { id: "user-admin" },
        update: {},
        create: {
          id: "user-admin",
          name: "Admin Hingo",
          email: "admin@hingo.id",
          phone: "+6281200000001",
          city: "Jakarta Selatan",
          role: "ADMIN",
          phoneVerified: true,
          kycStatus: "VERIFIED",
        },
        include: {
          kycDocument: true,
          addresses: true,
          bankAccounts: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    cookieStore.set("hingo_session", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set("hingo_user_id", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("hingo_session");
  cookieStore.delete("hingo_user_id");
  return NextResponse.json({ success: true, message: "Logged out" });
}
