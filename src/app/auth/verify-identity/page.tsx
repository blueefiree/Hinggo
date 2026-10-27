"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function VerifyIdentityPage() {
  const { user } = useHingoStore();
  const [fullName, setFullName] = useState(user.kycDocument.fullNameKtp);
  const [nik, setNik] = useState(user.kycDocument.maskedNik);
  const [ktpUploaded, setKtpUploaded] = useState(true);
  const [selfieUploaded, setSelfieUploaded] = useState(true);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Eyebrow & Title */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
          AKUN BARU / VERIFIKASI IDENTITAS
        </span>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Kenalan dulu, biar lebih aman.
          </h1>

          {/* 3-Step Pills */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1">
              <Check className="h-3 w-3" /> 1 Dokumen KTP
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1">
              <Check className="h-3 w-3" /> 2 Selfie Wajah
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[#FFC629] text-black px-3 py-1 shadow-xs">
              3 Peninjauan
            </span>
          </div>
        </div>
      </div>

      {/* Cream Status Banner */}
      <div className="mt-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
          <strong className="font-bold text-[#1A1A1A]">
            Identitas sedang ditinjau —{" "}
          </strong>
          Dokumen Naya sudah diterima, tetapi akun belum terverifikasi penuh. Peninjauan
          oleh tim verifikasi Hingo biasanya selesai maksimal <strong>1 × 24 jam</strong>.
          Kami akan mengirimkan notifikasi pembaruan langsung lewat WhatsApp.
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Uploads */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-5">
              Data sesuai kartu identitas
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Nama lengkap sesuai KTP
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-sm font-semibold text-[#1A1A1A] bg-[#F6F6F4] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  NIK (disamarkan demi privasi)
                </label>
                <input
                  type="text"
                  value={nik}
                  readOnly
                  className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-sm font-mono font-semibold text-neutral-600 bg-[#F6F6F4] outline-none"
                />
              </div>
            </div>

            {/* Upload Section 1: KTP */}
            <div className="border-t border-neutral-100 pt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-[#1A1A1A]">
                  1. Foto dokumen e-KTP asli
                </label>
                <StatusBadge label="Berhasil diunggah" variant="verified" size="sm" />
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Pastikan tulisan NIK, nama, dan foto terlihat jelas tanpa pantulan kilap lampu.
              </p>

              {ktpUploaded && (
                <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F4] border border-neutral-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xs">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">
                        {user.kycDocument.ktpFileName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {user.kycDocument.ktpFileSize} · Diunggah {user.kycDocument.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Silakan pilih file foto e-KTP baru.")}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    Ganti foto
                  </button>
                </div>
              )}
            </div>

            {/* Upload Section 2: Selfie */}
            <div className="border-t border-neutral-100 pt-6 mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-[#1A1A1A]">
                  2. Foto selfie wajah
                </label>
                <StatusBadge label="Berhasil diunggah" variant="verified" size="sm" />
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Foto wajah tanpa kacamata hitam, topi, atau masker untuk pencocokan biometrik.
              </p>

              {selfieUploaded && (
                <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F4] border border-neutral-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-xs">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">
                        {user.kycDocument.selfieFileName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {user.kycDocument.selfieFileSize} · Diunggah {user.kycDocument.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Silakan ambil ulang foto selfie.")}
                    className="text-xs font-bold text-amber-700 hover:underline"
                  >
                    Ganti foto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Status & Security */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Akun Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Status Akun Naya
              </span>
              <StatusBadge label="Menunggu peninjauan" variant="warning" size="sm" />
            </div>

            <div className="flex flex-col gap-3 py-2 border-y border-neutral-100 text-xs font-medium text-neutral-700">
              <div className="flex items-center justify-between">
                <span>Nomor HP WhatsApp</span>
                <span className="text-[#16A34A] font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Terverifikasi
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Identitas Resmi (KYC)</span>
                <span className="text-amber-700 font-bold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Sedang Ditinjau
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/catalog"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3 text-xs sm:text-sm font-bold text-[#1A1A1A] transition shadow-xs"
              >
                <span>Kembali jelajahi barang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/chat/support"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                <Headphones className="h-4 w-4" />
                <span>Hubungi CS Hingo</span>
              </Link>
            </div>
          </div>

          {/* Privacy Box */}
          <div className="rounded-3xl bg-[#F6F6F4] border border-neutral-200 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Data pribadimu tetap privat & aman</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Dokumen e-KTP disimpan menggunakan enkripsi AES-256 dan hanya digunakan
              untuk pencegahan penipuan serta pencairan rekening bersama resmi. Tim Hingo
              tidak pernah membagikan data identitas kepada pihak ketiga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
