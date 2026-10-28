"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  UserCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const { user, setRole, refreshSession, showToast } = useHingoStore();
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // If already logged in, auto-redirect to account
  React.useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedOtp(null);

    const target = (authMode === "phone" ? phone : email).trim();
    if (!target) {
      alert("Mohon masukkan nomor HP atau email terlebih dahulu");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedOtp(data.otpCode);
        setTimeout(() => {
          router.push(
            `/auth/verify-otp?target=${encodeURIComponent(target)}&devOtp=${data.otpCode}&callbackUrl=${encodeURIComponent(callbackUrl)}`
          );
        }, 1200);
      } else {
        alert(data.error || "Gagal mengirim OTP");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (persona: "DEMO_USER" | "ADMIN" | "NEW_USER") => {
    setIsLoading(true);
    try {
      if (persona === "ADMIN") {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "user-admin", role: "ADMIN" }),
        });
        await refreshSession();
        setRole("ADMIN");
        router.push("/admin");
      } else {
        const testTarget =
          persona === "DEMO_USER"
            ? "+62 812 9999 8888"
            : `+62 8${Date.now().toString().slice(-9)}`;

        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: testTarget,
            otpCode: "123456",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshSession();
          showToast("Berhasil masuk!");
          router.push(callbackUrl);
        } else {
          alert(data.error || "Gagal login otomatis");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
      <div className="mx-auto max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC629] font-black text-2xl text-[#1A1A1A] shadow-xs transition group-hover:scale-105">
              H
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
            Masuk ke Hingo
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Gunakan Nomor HP atau Email terdaftar untuk verifikasi OTP instan.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F6F4] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("phone")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                authMode === "phone"
                  ? "bg-white text-black shadow-xs font-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>Nomor HP</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("email")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                authMode === "email"
                  ? "bg-white text-black shadow-xs font-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {authMode === "phone" ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Nomor Handphone (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] py-3 pl-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-[#FFC629] focus:bg-white"
                  />
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1.5 block">
                  Kode verifikasi 6 digit akan dikirim via SMS / WhatsApp.
                </span>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Alamat Email Aktif
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: nama@domain.com"
                    className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] py-3 pl-4 pr-10 text-sm font-bold text-neutral-900 outline-none transition focus:border-[#FFC629] focus:bg-white"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1.5 block">
                  Link & kode verifikasi OTP akan dikirim ke inbox email.
                </span>
              </div>
            )}

            {generatedOtp && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Kode OTP dikirim: <strong>{generatedOtp}</strong></span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  Mengarahkan...
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <>
                  <span>Kirim Kode OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Panel */}
          <div className="mt-6 pt-5 border-t border-neutral-200">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 mb-2.5 block">
              ⚡ Quick Demo Login (Tanpa Menunggu SMS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("DEMO_USER")}
                className="flex flex-col items-start p-2.5 rounded-xl border border-amber-300 bg-[#FFFBEB] hover:bg-amber-100 transition text-left cursor-pointer"
              >
                <span className="font-bold text-xs text-[#92400E]">Akun Pengguna Baru</span>
                <span className="text-[10px] text-neutral-600">Mulai dari 0 di Database</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("ADMIN")}
                className="flex flex-col items-start p-2.5 rounded-xl border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 transition text-left cursor-pointer"
              >
                <span className="font-bold text-xs text-neutral-900">Admin Hingo</span>
                <span className="text-[10px] text-neutral-600">Panel Kurator & Escrow</span>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-700 leading-relaxed">
              <strong className="text-neutral-900">Baru di Hingo?</strong> Tidak perlu daftar terpisah.
              Nomor atau email baru otomatis membuat akun setelah OTP berhasil diverifikasi di database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Memuat halaman login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
