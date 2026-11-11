"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-black transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-10 shadow-xs flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEB] text-amber-700 border border-[#FDE68A]">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              Kebijakan Privasi Hingo
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Terakhir diperbarui: 24 Oktober 2026
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">1. Informasi yang Kami Kumpulkan</h2>
          <p>
            Hingo mengumpulkan data nomor telepon (WhatsApp), alamat email, nama penerima, alamat pengiriman, dan identitas verifikasi KYC (NIK untuk konsinyasi bernilai tinggi) semata-mata untuk memfasilitasi transaksi jual-beli preloved, pengujian fisik konsinyasi, dan pencairan dana escrow yang aman.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">2. Perlindungan dan Penggunaan Data</h2>
          <p>
            Kami tidak menjual atau menyewakan informasi pribadi pengguna kepada pihak ketiga mana pun. Data pengiriman hanya dibagikan kepada kurir resmi rekanan (JNE, J&T, SiCepat) untuk keperluan pengiriman pesanan.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">3. Rekening Bersama & Keamanan Finansial</h2>
          <p>
            Data nomor rekening bank dan transaksi escrow dilindungi dengan enkripsi tingkat industri dan hanya digunakan untuk memproses pencairan hasil penjualan konsinyasi setelah barang diverifikasi tiba oleh pembeli.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">4. Hak Pengguna & Hubungi Kami</h2>
          <p>
            Pengguna dapat memperbarui profil, mengubah nomor rekening, atau meminta penghapusan akun kapan saja melalui menu Akun Saya atau menghubungi tim kurasi kami via{" "}
            <Link href="/chat/support" className="font-bold text-amber-800 underline">
              Pusat Bantuan
            </Link>.
          </p>
        </section>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span>© 2026 Hingo Preloved Gear Marketplace</span>
          <Link href="/how-it-works" className="font-semibold text-neutral-600 hover:text-black">
            Pelajari Cara Titip Jual →
          </Link>
        </div>
      </div>
    </div>
  );
}

