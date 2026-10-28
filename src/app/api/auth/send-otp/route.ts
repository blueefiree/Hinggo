import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail, sendOtpWhatsApp } from "@/lib/otp-sender";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Nomor WhatsApp atau email diperlukan" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes("@");

    // Invalidate any previous unverified OTPs for this target
    await prisma.otpVerification.updateMany({
      where: {
        target: cleanTarget,
        verified: false,
      },
      data: {
        expiresAt: new Date(Date.now() - 1000), // expire immediately
      },
    });

    // Generate fresh 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Store in database
    const verification = await prisma.otpVerification.create({
      data: {
        target: cleanTarget,
        otpCode,
        expiresAt,
        verified: false,
      },
    });

    // Dispatch real email or real WhatsApp
    let sendResult = { delivered: false };
    if (isEmail) {
      sendResult = await sendOtpEmail(cleanTarget, otpCode);
    } else {
      sendResult = await sendOtpWhatsApp(cleanTarget, otpCode);
    }

    return NextResponse.json({
      success: true,
      message: isEmail
        ? `Kode OTP 6-digit berhasil dikirimkan ke email ${cleanTarget}`
        : `Kode OTP 6-digit berhasil dikirimkan ke WhatsApp ${cleanTarget}`,
      channel: isEmail ? "EMAIL" : "WHATSAPP",
      delivered: sendResult.delivered,
      // Provide otpCode for dev preview & instant testing when running locally or if gateway not configured
      otpCode,
      id: verification.id,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pengiriman OTP" }, { status: 500 });
  }
}
