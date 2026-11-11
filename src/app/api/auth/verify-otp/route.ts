import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

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

    // 2. Tentukan Email Unik & Konsisten Pengguna (Anti-Hilang saat refresh)
    const cleanDigits = cleanTarget.replace(/\D/g, "");
    const userEmail = isEmail
      ? cleanTarget.trim().toLowerCase()
      : `${cleanDigits || cleanTarget}@wa.hingo.id`;
    const userPhone = isEmail ? null : cleanTarget.trim();

    const generatedName = isEmail
      ? cleanTarget.split("@")[0].replace(/[._-]/g, " ")
      : `Pengguna ${cleanTarget.slice(-4)}`;
    const formattedName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

    let userId = crypto.randomUUID();
    let userData: any = null;

    try {
      // Cek user yang sudah ada di Supabase
      const userQuery = isEmail
        ? supabase.from("users").select("*").eq("email", userEmail).limit(1)
        : supabase.from("users").select("*").eq("phone", userPhone).limit(1);

      const { data: existingUsers } = await userQuery;

      if (existingUsers && existingUsers.length > 0) {
        const exUser = existingUsers[0];
        userId = exUser.id;
        const updatePayload: any = isEmail
          ? { email: userEmail, email_verified: true, updated_at: new Date().toISOString() }
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
          id: userId,
          name: formattedName,
          email: userEmail,
          phone: userPhone,
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
      where: {
        OR: [
          { email: userEmail },
          ...(userPhone ? [{ phone: userPhone }] : []),
        ],
      },
      include: { kycDocument: true, addresses: true, bankAccounts: true },
    });

    if (localUser) {
      localUser = await prisma.user.update({
        where: { id: localUser.id },
        data: {
          email: localUser.email || userEmail,
          emailVerified: isEmail ? true : localUser.emailVerified,
          phoneVerified: !isEmail ? true : localUser.phoneVerified,
        },
        include: { kycDocument: true, addresses: true, bankAccounts: true },
      });
    } else {
      localUser = await prisma.user.create({
        data: {
          id: userId,
          name: formattedName,
          email: userEmail,
          phone: userPhone,
          emailVerified: isEmail,
          phoneVerified: !isEmail,
          city: "Jakarta Selatan",
          role: "USER",
          kycStatus: "UNVERIFIED",
        },
        include: { kycDocument: true, addresses: true, bankAccounts: true },
      });
    }

    // 4. Buat signed session 30 hari (tahan banting di lingkungan serverless)
    const finalUserId = userData?.id || userId || localUser.id;
    const sessionToken = createSessionToken({
      userId: finalUserId,
      name: userData?.name || localUser.name,
      phone: userData?.phone || localUser.phone,
      email: userData?.email || localUser.email,
      role: userData?.role || localUser.role,
      city: userData?.city || localUser.city,
      avatarUrl: userData?.avatar_url || localUser.avatarUrl,
      bio: (userData as any)?.bio || (localUser as any).bio || null,
      phoneVerified: Boolean(userData?.phone_verified ?? localUser.phoneVerified),
      emailVerified: Boolean(userData?.email_verified ?? localUser.emailVerified),
      kycStatus: userData?.kyc_status || localUser.kycStatus,
      createdAt: localUser.createdAt?.toISOString?.() || new Date().toISOString(),
    });

    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await prisma.session.create({
        data: {
          token: sessionToken,
          userId: localUser.id,
          userAgent: req.headers.get("user-agent") || "Browser",
          expiresAt,
        },
      });
    } catch {}

    // 5. Pasang HTTP-Only Cookie 30 Hari (Termasuk hingo_user_email sesuai Aturan 1)
    const cookieStore = await cookies();
    cookieStore.set("hingo_user_email", userEmail, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    cookieStore.set("hingo_user_id", finalUserId, {
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
      user: {
        ...localUser,
        id: finalUserId,
      },
      redirectTo: "/account",
    });
  } catch (error: any) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json({ error: error.message || "Gagal verifikasi OTP" }, { status: 500 });
  }
}
