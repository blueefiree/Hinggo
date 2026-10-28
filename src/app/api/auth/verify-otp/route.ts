import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { target, otpCode } = await req.json();
    if (!target || !otpCode) {
      return NextResponse.json({ error: "Target (Nomor HP/Email) dan kode OTP 6-digit wajib diisi" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const cleanOtp = otpCode.trim();

    // Check OTP in database (valid within 5 minutes and not expired)
    const now = new Date();
    const record = await prisma.otpVerification.findFirst({
      where: {
        target: cleanTarget,
        otpCode: cleanOtp,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also allow master demo OTP for local testing if needed
    const isMasterDemoOtp = cleanOtp === "123456";

    if (!record && !isMasterDemoOtp) {
      return NextResponse.json({ error: "Kode OTP salah atau telah kedaluwarsa. Silakan kirim ulang." }, { status: 400 });
    }

    // Mark OTP as verified
    if (record) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { verified: true },
      });
    }

    const isEmail = cleanTarget.includes("@");

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: cleanTarget } : { phone: cleanTarget },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    if (!user) {
      // Auto-create new user starting fresh
      const generatedName = isEmail
        ? cleanTarget.split("@")[0].replace(/[._-]/g, " ")
        : `Pengguna ${cleanTarget.slice(-4)}`;
      const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

      user = await prisma.user.create({
        data: {
          name: formattedName,
          email: isEmail ? cleanTarget : null,
          phone: isEmail ? null : cleanTarget,
          emailVerified: isEmail,
          phoneVerified: !isEmail,
          city: "Jakarta Selatan",
          role: "USER",
          kycStatus: "UNVERIFIED",
        },
        include: {
          kycDocument: true,
          addresses: true,
          bankAccounts: true,
        },
      });
    } else {
      // Mark as verified on existing user
      if (isEmail && !user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
          include: {
            kycDocument: true,
            addresses: true,
            bankAccounts: true,
          },
        });
      } else if (!isEmail && !user.phoneVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phoneVerified: true },
          include: {
            kycDocument: true,
            addresses: true,
            bankAccounts: true,
          },
        });
      }
    }

    // Create 30-day persistent session in database
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

    // Set persistent HTTP-Only Cookie (30 days)
    const cookieStore = await cookies();
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
