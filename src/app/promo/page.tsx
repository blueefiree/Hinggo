"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  Percent,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { PRODUCTS } from "@/lib/data";

export default function PromoPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const vouchers = [
    {
      code: "HINGOPERTAMA",
      title: "Gratis Ongkir Hingga Rp20.000",
      description: "Berlaku untuk semua pembelian pertama peripheral preloved via kurir JNE & J&T.",
      minSpend: "Tanpa minimum belanja",
      validUntil: "31 Des 2026",
      tag: "Pengguna Baru",
      icon: Truck,
    },
    {
      code: "KOMISI5KEYBOARD",
      title: "Diskon Komisi Konsinyasi 5%",
      description: "Khusus penitipan Mechanical Keyboard (Keychron, Akko, Vortex, MonsGeek).",
      minSpend: "Estimasi jual > Rp500.000",
      validUntil: "15 Nov 2026",
      tag: "Penjual Titip Jual",
      icon: Percent,
    },
    {
      code: "PRELOVED50",
      title: "Potongan Langsung Rp50.000",
      description: "Potongan harga langsung untuk pembelian monitor gaming & audio preloved.",
      minSpend: "Min. belanja Rp1.000.000",
      validUntil: "10 Nov 2026",
      tag: "Flash Sale",
      icon: Tag,
    },
    {
      code: "CASHBACKAUDIO",
      title: "Cashback Rp30.000 Rekening",
      description: "Pencairan dana titip jual headset & mikrofon gaming.",
      minSpend: "Semua headset terverifikasi",
      validUntil: "30 Nov 2026",
      tag: "Promo Audio",
      icon: Sparkles,
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const promoProducts = PRODUCTS.slice(0, 4);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-[#FFC629] p-8 sm:p-12 mb-10 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-xl z-10">
          <span className="rounded-full bg-black text-[#FFC629] px-3.5 py-1 text-xs font-black uppercase tracking-wider self-start">
            PROMO SPESIAL HINGO
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1A1A1A] leading-tight tracking-tight">
            Hemat Belanja, Untung Maksimal Titip Jual
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-relaxed">
            Gunakan voucher gratis ongkir dan potongan komisi konsinyasi resmi dari Hingo. Semua transaksi tetap dilindungi rekening bersama.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0">
          <Link
            href="/catalog"
            className="px-6 py-3.5 rounded-2xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-black text-xs sm:text-sm transition shadow-md"
          >
            Belanja Gear Preloved
          </Link>
          <Link
            href="/seller/consignments/new"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-[#1A1A1A] font-black text-xs sm:text-sm transition border border-neutral-300"
          >
            Titip Jual Sekarang
          </Link>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      </div>

      {/* Section 1: Active Vouchers */}
      <div className="flex flex-col gap-6 mb-12">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
            Kupon & Voucher Aktif
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Salin kode voucher dan masukkan saat pembayaran di halaman checkout atau pengajuan titip jual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v) => {
            const Icon = v.icon;
            const isCopied = copiedCode === v.code;
            return (
              <div
                key={v.code}
                className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-amber-700 border border-[#FDE68A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                        {v.tag}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#1A1A1A] mt-1">
                        {v.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-950 bg-[#FFFBEB] px-3 py-1 rounded-lg border border-[#FDE68A]">
                      {v.code}
                    </span>
                    <span className="text-[11px] text-neutral-400 hidden sm:inline">
                      s.d {v.validUntil}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(v.code)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-4 py-2 font-bold text-xs transition cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Special Discounted Preloved Gear */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Gear Pilihan Diskon Spesial
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Semua unit sudah lolos inspeksi fisik ketat tim Hingo.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
          >
            Lihat Semua Katalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {promoProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group rounded-3xl border border-[#E5E5E5] bg-white p-3 sm:p-4 shadow-xs hover:border-[#FFC629] hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold">
                    Hemat {Math.round(((p.originalNewPrice - p.price) / p.originalNewPrice) * 100)}%
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] line-clamp-1 group-hover:text-amber-800">
                  {p.name}
                </h3>
                <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                  {p.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100">
                <span className="text-[11px] text-neutral-400 line-through block">
                  {formatRupiah(p.originalNewPrice)}
                </span>
                <span className="text-sm sm:text-base font-black text-[#1A1A1A]">
                  {formatRupiah(p.price)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
