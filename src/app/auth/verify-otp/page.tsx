"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Phone,
  RotateCcw,
} from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["4", "8", "2", "1", "", ""]);
  const [countdown, setCountdown] = useState(42);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/auth/verify-identity");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
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
              <span>Verifikasi WhatsApp Terenkripsi</span>
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
                Verifikasi nomor HP
              </h1>
              <p className="text-sm text-neutral-500">
                Masukkan 6 digit kode yang kami kirim melalui WhatsApp.
              </p>
            </div>

            {/* Target Phone Pill */}
            <div className="flex items-center justify-between rounded-xl bg-[#F6F6F4] px-4 py-3 mb-6 border border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">
                  +62 812 3456 7890
                </span>
              </div>
              <Link
                href="/auth/login"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
              >
                Ubah
              </Link>
            </div>

            {/* 6-box OTP Form */}
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div className="flex justify-between gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 sm:h-14 w-10 sm:w-12 rounded-xl border border-neutral-300 text-center text-xl font-black text-[#1A1A1A] outline-none transition focus:border-[#FFC629] focus:bg-[#FFFBEB] focus:ring-2 focus:ring-[#FFC629]/40"
                  />
                ))}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
              >
                <span>Verifikasi & lanjutkan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Resend & Countdown */}
            <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-neutral-500">
              {countdown > 0 ? (
                <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>
                    Belum menerima kode? Kirim ulang dalam{" "}
                    <strong className="text-neutral-900">
                      00:{countdown < 10 ? `0${countdown}` : countdown}
                    </strong>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(42)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Kirim ulang kode OTP sekarang
                </button>
              )}
              <span className="text-[11px] text-neutral-400">
                Kode berlaku selama 5 menit
              </span>
            </div>

            {/* Routing Guidance Box */}
            <div className="mt-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs text-neutral-700 leading-relaxed">
              <strong className="text-black block mb-1">
                Alur setelah verifikasi berhasil:
              </strong>
              <div className="flex flex-col gap-1 text-[11px]">
                <p>• <strong>Akun lama:</strong> Langsung kembali ke keranjang / belanja.</p>
                <p>• <strong>Akun baru:</strong> Verifikasi identitas (KYC) untuk pencairan dana & perlindungan transaksi.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
