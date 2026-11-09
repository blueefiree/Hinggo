import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      const cookieStore = await cookies();
      cookieStore.delete("hingo_session");
      cookieStore.delete("hingo_user_id");
    }
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
          emailVerified: true,
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

    // Create session in database
    const sessionToken = crypto.randomUUID();
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Browser";
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        userAgent,
        expiresAt,
      },
    });

    cookieStore.set("hingo_session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    cookieStore.set("hingo_user_id", user.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hingo_session")?.value;

  if (sessionToken) {
    // Delete session from DB
    await prisma.session.deleteMany({
      where: { token: sessionToken },
    }).catch(() => {});
  }

  cookieStore.delete("hingo_session");
  cookieStore.delete("hingo_user_id");
  return NextResponse.json({ success: true, message: "Logged out" });
}
