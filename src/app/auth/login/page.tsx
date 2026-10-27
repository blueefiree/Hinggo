"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [email, setEmail] = useState("naya.putri@example.com");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/auth/verify-otp");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Panel (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-10">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#FFC629] px-3.5 py-1 text-xs font-bold text-black uppercase tracking-wider">
            PRELOVED, RELOVED.
          </div>

          <h2 className="text-4xl font-black text-[#1A1A1A] leading-tight">
            Gear bagus tak harus baru.
          </h2>

          <p className="text-neutral-600 text-sm leading-relaxed">
            Komputer dan gear kesayanganmu punya nilai lebih. Hingo menghubungkan
            komunitas antusias peripheral dengan sistem kurasi fisik ketat dan proteksi
            rekening bersama resmi.
          </p>

          {/* Photo Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-neutral-100 p-3">
            <img
              src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"
              alt="Mechanical Keyboard Preloved"
              className="h-56 w-full rounded-xl object-cover"
            />
            <div className="mt-3 flex items-center justify-between text-xs px-2">
              <span className="font-bold text-[#1A1A1A]">Keychron K2 V2 · Preloved Mulus</span>
              <span className="font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                Lolos Uji Fisik
              </span>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="rounded-2xl bg-white/90 p-4 border border-[#FDE68A] flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              <strong className="text-black">Satu akun, banyak kesempatan</strong> — Belanja
              atau titip jual. Kami pasarkan gear-mu lewat Instagram, Facebook, dan TikTok
              hingga terkirim ke pembeli.
            </p>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col gap-1.5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
                Masuk atau daftar
              </h1>
              <p className="text-sm text-neutral-500">
                Mulai dengan nomor HP, email, atau akun Google.
              </p>
            </div>

            {/* Pill Toggle */}
            <div className="flex rounded-xl bg-[#F6F6F4] p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode("phone")}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                  authMode === "phone"
                    ? "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B] shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Nomor HP (WhatsApp)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("email")}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
                  authMode === "email"
                    ? "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B] shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Alamat Email
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {authMode === "phone" ? (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nomor WhatsApp Aktif
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812 3456 7890"
                      className="w-full rounded-xl border border-neutral-300 py-3 pl-11 pr-4 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:ring-2 focus:ring-[#FFC629]/30"
                      required
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Kode OTP 6 digit akan dikirim melalui pesan WhatsApp resmi Hingo.
                  </p>

                  <button
                    type="submit"
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
                  >
                    <span>Kirim OTP ke nomor HP</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full rounded-xl border border-neutral-300 py-3 pl-11 pr-4 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:ring-2 focus:ring-[#FFC629]/30"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Tautan verifikasi instan atau kode 6 digit dikirim ke inbox-mu.
                  </p>

                  <button
                    type="submit"
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 py-3.5 text-sm font-bold text-white shadow-xs transition active:scale-[0.99]"
                  >
                    <span>Kirim OTP ke email</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400 font-medium">atau masuk dengan</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => router.push("/auth/verify-otp")}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white py-3 px-4 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Info Box */}
            <div className="mt-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-700 leading-relaxed">
                <strong className="text-neutral-900">Baru di Hingo?</strong> Tidak perlu daftar terpisah.
                Nomor atau email baru otomatis membuat akun setelah OTP berhasil diverifikasi.
                Kamu lalu dapat melanjutkan verifikasi identitas (KYC) demi keamanan bersama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
