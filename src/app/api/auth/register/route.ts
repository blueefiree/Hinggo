import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password, whatsapp, role = "USER" } = await req.json();

    if (!name || !email || !password || !whatsapp) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi (Nama, Email, WhatsApp, Kata Sandi)." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: randomUUID(),
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      phone: whatsapp,
      whatsapp: whatsapp,
      role: role === "ADMIN" ? "ADMIN" : "USER",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from("users").insert(newUser).select().single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Gagal membuat akun." },
        { status: 500 }
      );
    }

    const token = createSessionToken(data);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
