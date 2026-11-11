"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Phone,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetParam = searchParams.get("target") || "+62 812 3456 7890";
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || searchParams.get("demo") === "true";

  const { user, setUser, refreshSession, showToast } = useHingoStore();

  const [target, setTarget] = useState(targetParam);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, auto-redirect
  useEffect(() => {
    if (user) {
      const cb = searchParams.get("callbackUrl");
      const dest = cb && !cb.includes("/auth/") ? cb : "/account";
      router.replace(dest);
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    setErrorMsg(null);
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal mengirim ulang kode");
        return;
      }
      setCountdown(60);
      showToast("Kode verifikasi baru berhasil dikirim!");
    } catch (e) {
      setErrorMsg("Gagal menghubungi server");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Mohon masukkan 6 digit kode verifikasi secara lengkap");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, otpCode: fullOtp }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshSession();
        showToast("Login berhasil! Mengalihkan ke profil...");
        const targetUrl = searchParams.get("callbackUrl");
        const finalDest = (targetUrl && targetUrl !== "/" && !targetUrl.includes("/auth/"))
          ? targetUrl
          : (data.redirectTo || "/account");
        window.location.href = finalDest;
      } else {
        setErrorMsg(data.error || "Kode verifikasi salah atau telah kedaluwarsa");
      }
    } catch (err: any) {
      setErrorMsg("Gagal menghubungi server database");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
      {/* Banner Mode Demo Eksplisit jika DEMO_MODE aktif */}
      {isDemo && (
        <div className="mb-6 rounded-2xl bg-[#FFFBEB] border-2 border-[#FFC629] p-4 sm:p-5 shadow-sm text-neutral-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] text-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                Mode Demo Aktif
              </span>
              <p className="text-xs sm:text-sm text-neutral-700 mt-0.5">
                Mode demo: gunakan kode yang diberikan penyelenggara (misal: <strong>123456</strong>).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOtp(["1", "2", "3", "4", "5", "6"])}
            className="rounded-xl bg-[#FFC629] px-4 py-2 text-xs font-black text-black shadow-xs hover:bg-[#FFC420] transition active:scale-95 cursor-pointer text-center whitespace-nowrap"
          >
            Isi Demo (123456)
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Panel */}
        <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-10">
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#FFC629] px-3.5 py-1 text-xs font-bold text-black uppercase tracking-wider">
            PRELOVED, RELOVED.
          </div>

          <h2 className="text-4xl font-black text-[#1A1A1A] leading-tight">
            Gear bagus tak harus baru.
          </h2>

          <p className="text-neutral-600 text-sm leading-relaxed">
            Keamanan akun dan transaksi konsinyasimu adalah prioritas utama kami.
            Verifikasi OTP menjamin hanya kamu yang berhak mengakses saldo hasil titip
            jual dan pesanan aktif.
          </p>

          <div className="rounded-2xl bg-white p-5 shadow-xs border border-neutral-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A]">
              <ShieldCheck className="h-4 w-4" />
              <span>Verifikasi Database Terenkripsi</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Kami tidak pernah meminta PIN kartu ATM atau kode rahasia melalui panggilan
              telepon. Waspada terhadap pihak yang mengatasnamakan admin Hingo.
            </p>
          </div>
        </div>

        {/* Right OTP Verification Card */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex flex-col gap-1.5 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
                Verifikasi kode OTP
              </h1>
              <p className="text-sm text-neutral-500">
                Masukkan 6 digit kode yang tersimpan di database untuk target ini.
              </p>
            </div>

            {/* Target Phone Pill */}
            <div className="flex items-center justify-between rounded-xl bg-[#F6F6F4] px-4 py-3 mb-6 border border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                  {target}
                </span>
              </div>
              <Link
                href="/auth/login"
                className="text-xs font-bold text-neutral-500 hover:text-black underline"
              >
                Ubah
              </Link>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Form OTP 6 Boxes */}
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div
                className="flex items-center justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    name={`otp-${idx}`}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-12 w-11 sm:h-14 sm:w-13 rounded-xl border border-neutral-300 text-center text-lg sm:text-xl font-black text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:ring-2 focus:ring-[#FFC629]/30 transition"
                  />
                ))}
              </div>

              {/* Countdown / Resend */}
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {countdown > 0 ? (
                    <span>Kirim ulang dalam {countdown} detik</span>
                  ) : (
                    <span className="text-neutral-700 font-bold">Waktu habis</span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-bold text-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Kirim ulang OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memvalidasi ke database...</span>
                  </>
                ) : (
                  <>
                    <span>Verifikasi & lanjutkan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-neutral-400">Memuat verifikasi OTP...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
