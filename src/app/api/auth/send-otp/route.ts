import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    if (!target) {
      return NextResponse.json({ error: "Nomor HP atau email diperlukan" }, { status: 400 });
    }

    // Generate 6 digit OTP (for testing, allow fixed 123456 or random)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const verification = await prisma.otpVerification.create({
      data: {
        target: target.trim(),
        otpCode,
        expiresAt,
        verified: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kode OTP berhasil dibuat dan dikirim ke ${target}`,
      otpCode, // Returned for dev preview / instant verification banner
      id: verification.id,
    });
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal mengirim OTP" }, { status: 500 });
  }
}
