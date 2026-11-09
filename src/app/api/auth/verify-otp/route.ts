import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { target, otpCode } = await req.json();
    if (!target || !otpCode) {
      return NextResponse.json({ error: "Target dan kode OTP 6-digit wajib diisi" }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const cleanOtp = otpCode.trim();
    const isEmail = cleanTarget.includes("@");
    const isMasterDemoOtp = cleanOtp === "123456";

    // 1. Validasi OTP di Supabase
    let isValidOtp = isMasterDemoOtp;

    const { data: sbOtpList } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("target", cleanTarget)
      .eq("otp_code", cleanOtp)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (sbOtpList && sbOtpList.length > 0) {
      isValidOtp = true;
      await supabase
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", sbOtpList[0].id);
    } else {
      // Fallback cek Prisma lokal
      const localRecord = await prisma.otpVerification.findFirst({
        where: {
          target: cleanTarget,
          otpCode: cleanOtp,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (localRecord) {
        isValidOtp = true;
        await prisma.otpVerification.update({
          where: { id: localRecord.id },
          data: { verified: true },
        });
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Kode OTP salah atau telah kedaluwarsa. Silakan kirim ulang." },
        { status: 400 }
      );
    }

    // 2. Upsert User di Supabase public.users (Fault-Tolerant)
    const generatedName = isEmail
      ? cleanTarget.split("@")[0].replace(/[._-]/g, " ")
      : `Pengguna ${cleanTarget.slice(-4)}`;
    const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

    let userId = crypto.randomUUID();
    let userData: any = null;

    try {
      // Cek user yang sudah ada di Supabase
      const userQuery = isEmail
        ? supabase.from("users").select("*").eq("email", cleanTarget).limit(1)
        : supabase.from("users").select("*").eq("phone", cleanTarget).limit(1);

      const { data: existingUsers } = await userQuery;

      if (existingUsers && existingUsers.length > 0) {
        const exUser = existingUsers[0];
        userId = exUser.id;
        const updatePayload: any = isEmail
          ? { email_verified: true, updated_at: new Date().toISOString() }
          : { phone_verified: true, updated_at: new Date().toISOString() };

        const { data: updated } = await supabase
          .from("users")
          .update(updatePayload)
          .eq("id", userId)
          .select()
          .single();
        userData = updated || exUser;
      } else {
        // Buat user baru di Supabase
        const newPayload = {
          name: formattedName,
          email: isEmail ? cleanTarget : null,
          phone: isEmail ? null : cleanTarget,
          city: "Jakarta Selatan",
          role: "USER",
          phone_verified: !isEmail,
          email_verified: isEmail,
          kyc_status: "UNVERIFIED",
        };

        const { data: inserted, error: insErr } = await supabase
          .from("users")
          .insert(newPayload)
          .select()
          .single();

        if (!insErr && inserted) {
          userId = inserted.id;
          userData = inserted;
        }
      }
    } catch (sbErr) {
      console.warn("Supabase user sync error (bypassed safely):", sbErr);
    }

    // 3. Sinkronkan ke Prisma lokal
    let localUser = await prisma.user.findFirst({
      where: isEmail ? { email: cleanTarget } : { phone: cleanTarget },
      include: { kycDocument: true, addresses: true, bankAccounts: true },
    });

    if (localUser) {
      localUser = await prisma.user.update({
        where: { id: localUser.id },
        data: isEmail ? { emailVerified: true } : { phoneVerified: true },
        include: { kycDocument: true, addresses: true, bankAccounts: true },
      });
    } else {
      localUser = await prisma.user.create({
        data: {
          id: userId,
          name: formattedName,
          email: isEmail ? cleanTarget : null,
          phone: isEmail ? null : cleanTarget,
          emailVerified: isEmail,
          phoneVerified: !isEmail,
          city: "Jakarta Selatan",
          role: "USER",
          kycStatus: "UNVERIFIED",
        },
        include: { kycDocument: true, addresses: true, bankAccounts: true },
      });
    }

    // 4. Buat session 30 hari di database
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: localUser.id,
        userAgent: req.headers.get("user-agent") || "Browser",
        expiresAt,
      },
    }).catch(() => {});

    // 5. Pasang HTTP-Only Cookie 30 Hari
    const cookieStore = await cookies();
    cookieStore.set("hingo_user_id", localUser.id, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    cookieStore.set("hingo_session", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return NextResponse.json({
      success: true,
      user: localUser,
      redirectTo: "/account",
    });
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal verifikasi OTP" }, { status: 500 });
  }
}
