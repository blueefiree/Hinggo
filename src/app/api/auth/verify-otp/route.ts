import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { target, otpCode } = await req.json();
    if (!target || !otpCode) {
      return NextResponse.json({ error: "Target dan kode OTP wajib diisi" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const cleanOtp = otpCode.trim();

    // Find the latest OTP verification for this target
    const record = await prisma.otpVerification.findFirst({
      where: {
        target: cleanTarget,
        otpCode: cleanOtp,
      },
      orderBy: { createdAt: "desc" },
    });

    // Also support default demo code 123456
    const isMasterDemoOtp = cleanOtp === "123456";

    if (!record && !isMasterDemoOtp) {
      return NextResponse.json({ error: "Kode OTP salah atau telah kadaluarsa" }, { status: 400 });
    }

    if (record) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { verified: true },
      });
    }

    // Check if user exists by phone or email
    const isEmail = cleanTarget.includes("@");
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: cleanTarget } : { phone: cleanTarget },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    if (!user) {
      // Auto-create new user starting fresh from 0
      const generatedName = isEmail ? cleanTarget.split("@")[0] : `Pengguna ${cleanTarget.slice(-4)}`;
      user = await prisma.user.create({
        data: {
          name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
          email: isEmail ? cleanTarget : `${cleanTarget.replace(/\D/g, "")}@phone.hingo.id`,
          phone: isEmail ? `+628${Date.now().toString().slice(-9)}` : cleanTarget,
          city: "Jakarta Selatan",
          role: "USER",
          phoneVerified: true,
          kycStatus: "UNVERIFIED",
        },
        include: {
          kycDocument: true,
          addresses: true,
          bankAccounts: true,
        },
      });
    }

    // Set session cookies
    const cookieStore = await cookies();
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

    return NextResponse.json({
      success: true,
      user,
      redirectTo: "/",
    });
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal verifikasi OTP" }, { status: 500 });
  }
}
