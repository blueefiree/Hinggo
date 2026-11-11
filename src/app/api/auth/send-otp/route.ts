import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/otp-sender";
import { dispatchWhatsAppOtp } from "@/lib/whatsapp-gateway";
import { prepareSendOtp, hashOtp } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Nomor WhatsApp atau email diperlukan" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes("@");
    const channel = isEmail ? "email" : "whatsapp";

    // 1. Validasi Rate Limit, Lockout, & Persiapan OTP
    const prep = prepareSendOtp(cleanTarget);
    if (!prep.allowed) {
      return NextResponse.json(
        { error: prep.error },
        { status: prep.statusCode || 429 }
      );
    }

    const otpCode = prep.otpCode!;
    const hashed = hashOtp(cleanTarget, otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // 2. Simpan HASH OTP ke Supabase otp_verifications
    try {
      await supabase.from("otp_verifications").insert({
        target: cleanTarget,
        otp_code: hashed,
        channel,
        verified: false,
        expires_at: expiresAt.toISOString(),
      });
    } catch (sbErr) {
      console.warn("Supabase otp_verifications insert fallback:", sbErr);
    }

    // 3. Simpan juga HASH ke Prisma lokal
    try {
      await prisma.otpVerification.updateMany({
        where: { target: cleanTarget, verified: false },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await prisma.otpVerification.create({
        data: {
          target: cleanTarget,
          otpCode: hashed,
          expiresAt,
          verified: false,
        },
      });
    } catch (prismaErr) {
      console.warn("Prisma otpVerification fallback:", prismaErr);
    }

    // 4. Dispatch pengiriman nyata
    let sendResult = { delivered: false, channel: "", info: "" };

    if (isEmail) {
      await supabase.auth.signInWithOtp({ email: cleanTarget }).catch(() => {});
      const emailRes = await sendOtpEmail(cleanTarget, otpCode);
      sendResult = {
        delivered: emailRes.delivered,
        channel: "EMAIL",
        info: emailRes.info || "Email OTP dikirim",
      };
    } else {
      const waRes = await dispatchWhatsAppOtp(cleanTarget, otpCode);
      sendResult = {
        delivered: waRes.delivered,
        channel: waRes.channel,
        info: waRes.info,
      };
    }

    // Hanya log di environment development, TIDAK mencetak kode ke log produksi
    if (process.env.NODE_ENV !== "production" && !prep.isDemo) {
      console.log(`[DEV OTP LOG] Target: ${cleanTarget} | OTP: ${otpCode}`);
    }

    // Respons seragam tanpa membocorkan kode OTP ke client
    return NextResponse.json({
      success: true,
      message: isEmail
        ? `Kode verifikasi telah dikirimkan ke email ${cleanTarget}`
        : `Kode verifikasi telah dikirimkan ke WhatsApp ${cleanTarget}`,
      channel,
      delivered: sendResult.delivered,
      isDemo: prep.isDemo,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json({ error: "Gagal memproses pengiriman kode verifikasi" }, { status: 500 });
  }
}
