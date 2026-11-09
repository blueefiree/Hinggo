import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/otp-sender";
import { dispatchWhatsAppOtp } from "@/lib/whatsapp-gateway";

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    if (!target || typeof target !== "string") {
      return NextResponse.json({ error: "Nomor WhatsApp atau email diperlukan" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes("@");
    const channel = isEmail ? "email" : "whatsapp";

    // Generate fresh 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 1. Simpan ke tabel public.otp_verifications di Supabase
    try {
      await supabase.from("otp_verifications").insert({
        target: cleanTarget,
        otp_code: otpCode,
        channel,
        verified: false,
        expires_at: expiresAt.toISOString(),
      });
    } catch (sbErr) {
      console.warn("Supabase otp_verifications insert fallback:", sbErr);
    }

    // 2. Simpan juga ke Prisma lokal untuk sinkronisasi hybrid
    try {
      await prisma.otpVerification.updateMany({
        where: { target: cleanTarget, verified: false },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      await prisma.otpVerification.create({
        data: {
          target: cleanTarget,
          otpCode,
          expiresAt,
          verified: false,
        },
      });
    } catch (prismaErr) {
      console.warn("Prisma otpVerification fallback:", prismaErr);
    }

    // 3. Dispatch real message
    let sendResult = { delivered: false, channel: "", info: "" };

    if (isEmail) {
      // Kirim via Supabase Auth & Nodemailer
      await supabase.auth.signInWithOtp({ email: cleanTarget }).catch(() => {});
      const emailRes = await sendOtpEmail(cleanTarget, otpCode);
      sendResult = {
        delivered: emailRes.delivered,
        channel: "EMAIL",
        info: emailRes.info || "Email OTP dikirim",
      };
    } else {
      // Kirim via Baileys WhatsApp Web QR / Fonnte
      const waRes = await dispatchWhatsAppOtp(cleanTarget, otpCode);
      sendResult = {
        delivered: waRes.delivered,
        channel: waRes.channel,
        info: waRes.info,
      };
    }

    return NextResponse.json({
      success: true,
      message: isEmail
        ? `Kode OTP 6-digit berhasil dikirimkan ke email ${cleanTarget}`
        : `Kode OTP 6-digit berhasil dikirimkan ke WhatsApp ${cleanTarget}`,
      channel,
      delivered: sendResult.delivered,
      deliveryInfo: sendResult.info,
      otpCode, // Tersedia untuk auto-fill & pengujian instan
      devOtpCode: otpCode,
    });
  } catch (error: any) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses pengiriman OTP" }, { status: 500 });
  }
}
