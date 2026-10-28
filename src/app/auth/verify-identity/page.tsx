"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileCheck,
  Lock,
  ArrowRight,
  Headphones,
  Check,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { user, setUser } = useHingoStore();

  const isVerified = user?.kycStatus === "VERIFIED";
  const isPending = user?.kycStatus === "PENDING_REVIEW";
  const needsForm = user?.kycStatus === "UNVERIFIED" || user?.kycStatus === "REJECTED";

  const [fullName, setFullName] = useState(user?.name || "");
  const [nik, setNik] = useState("");
  const [ktpFileName, setKtpFileName] = useState("");
  const [selfieFileName, setSelfieFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFeedback("Nama lengkap sesuai KTP wajib diisi");
      return;
    }
    const cleanNik = nik.replace(/\D/g, "");
    if (cleanNik.length !== 16) {
      setFeedback("Nomor NIK harus terdiri dari tepat 16 digit angka");
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/auth/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullNameKtp: fullName.trim(),
          nikNumber: cleanNik,
          ktpFileName,
          selfieFileName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: fullName.trim(),
            kycStatus: "PENDING_REVIEW",
            kycDocument: {
              fullNameKtp: fullName.trim(),
              maskedNik: `•••• •••• •••• ${cleanNik.slice(-4)}`,
              ktpFileName,
              ktpFileSize: "1.8 MB",
              selfieFileName,
              selfieFileSize: "2.1 MB",
              uploadedAt: new Date().toLocaleDateString("id-ID"),
              status: "PENDING_REVIEW",
            },
          };
        });
      } else {
        setFeedback(data.error || "Gagal mengirim verifikasi identitas");
      }
    } catch (e: any) {
      setFeedback("Gagal menghubungi server database");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Eyebrow & Title */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
          AKUN PENGGUNA / VERIFIKASI IDENTITAS (KYC)
        </span>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Kenalan dulu, biar lebih aman.
          </h1>

          {/* 3-Step Pills */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                isVerified || isPending
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <Check className="h-3 w-3" /> 1 Dokumen KTP
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 ${
                isVerified || isPending
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <Check className="h-3 w-3" /> 2 Selfie Wajah
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 shadow-xs ${
                isVerified
                  ? "bg-emerald-600 text-white"
                  : "bg-[#FFC629] text-black"
              }`}
            >
              {isVerified ? "✓ Terverifikasi" : "3 Peninjauan"}
            </span>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {isVerified ? (
        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <strong className="font-bold text-emerald-900">
              Identitas terverifikasi resmi —{" "}
            </strong>
            Akun {user.name} telah lolos verifikasi identitas (KYC) oleh kurator Hingo.
            Kamu memiliki akses penuh untuk bertransaksi beli gear dan titip jual tanpa batasan saldo.
          </div>
        </div>
      ) : isPending ? (
        <div className="mt-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <strong className="font-bold text-[#1A1A1A]">
              Identitas sedang ditinjau —{" "}
            </strong>
            Dokumen {user.name} sudah diterima di database Hingo. Peninjauan
            oleh tim verifikasi Hingo biasanya selesai maksimal <strong>1 × 24 jam</strong>.
            Status akun akan otomatis terbarui.
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <strong className="font-bold text-amber-900">
              Identitas belum terverifikasi —{" "}
            </strong>
            Lengkapi formulir KTP dan swafoto wajah di bawah untuk mengaktifkan rekening bersama dan pencairan saldo penjualan.
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Uploads */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">
              Data sesuai kartu identitas
            </h2>

            {feedback && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nama lengkap sesuai KTP
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isVerified}
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-sm font-semibold text-[#1A1A1A] bg-[#F6F6F4] outline-none focus:border-[#FFC629] disabled:opacity-75"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    NIK {isVerified ? "(disamarkan demi privasi)" : "(16 digit)"}
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    disabled={isVerified}
                    maxLength={16}
                    placeholder="Contoh: 3273012345670842"
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-sm font-mono font-semibold text-neutral-800 bg-[#F6F6F4] outline-none focus:border-[#FFC629] disabled:opacity-75"
                    required
                  />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. KTP */}
                <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-[#FAF9F5] p-5 flex flex-col items-center text-center justify-between min-h-[190px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-neutral-700 mb-3">
                      <FileCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      1. Foto Dokumen KTP
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">
                      {ktpFileName} (1.8 MB)
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1">
                    ✓ Berhasil diunggah
                  </span>
                </div>

                {/* 2. Selfie */}
                <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-[#FAF9F5] p-5 flex flex-col items-center text-center justify-between min-h-[190px]">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-neutral-700 mb-3">
                      <Camera className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      2. Swafoto Wajah (Selfie)
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">
                      {selfieFileName} (2.1 MB)
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1">
                    ✓ Berhasil diunggah
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {needsForm && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan ke database...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Dokumen Verifikasi Identitas</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Account Status & Help */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Box */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              STATUS AKUN ANDA
            </span>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-xs text-neutral-600">Nama Pengguna</span>
              <span className="text-xs font-bold text-[#1A1A1A]">{user?.name || "Pengguna"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-xs text-neutral-600">Verifikasi NIK</span>
              <span className="text-xs font-mono font-bold text-[#1A1A1A]">
                {user?.kycDocument?.maskedNik || "•••• •••• •••• 0842"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-xs text-neutral-600">Status KYC</span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isVerified
                    ? "bg-emerald-100 text-emerald-800"
                    : isPending
                    ? "bg-amber-100 text-amber-900"
                    : "bg-neutral-100 text-neutral-700"
                }`}
              >
                {isVerified ? "Terverifikasi" : isPending ? "Sedang Ditinjau" : "Belum Lengkap"}
              </span>
            </div>

            <div className="rounded-2xl bg-[#F6F6F4] p-3 text-xs text-neutral-600 leading-relaxed">
              <Lock className="h-4 w-4 text-neutral-500 inline mr-1 -mt-0.5" />
              Data KTP dan foto selfie kamu disimpan aman di database dan hanya digunakan untuk validasi pencairan dana escrow Hingo.
            </div>

            <Link
              href="/"
              className="mt-2 w-full text-center rounded-xl bg-[#1A1A1A] text-white py-3 text-xs font-bold hover:bg-neutral-800 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>

          {/* Support Widget */}
          <div className="rounded-3xl border border-[#FDE68A] bg-[#FFFBEB] p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-amber-700" />
              <span className="text-sm font-bold text-[#1A1A1A]">Punya kendala KYC?</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Jika KTP rusak atau kamera buram, tim verifikasi kami siap membantumu via WhatsApp atau Pusat Bantuan.
            </p>
            <Link
              href="/chat/support"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Hubungi CS Mira</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
