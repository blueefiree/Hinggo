"use client";

import React, { useState, useEffect } from "react";
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
  Package,
} from "lucide-react";
import { Product } from "@/lib/data";

export default function PromoPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromoProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setPromoProducts(data.products || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPromoProducts();
  }, []);

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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
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

        <div className="flex flex-col gap-2 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60 text-xs font-bold text-neutral-900 z-10">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Voucher diperbarui setiap bulan</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Garansi proteksi escrow 100%</span>
          </div>
        </div>
      </div>

      {/* Section 1: Official Promo Vouchers */}
      <div className="mb-14">
        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mb-2">
          Kupon & Voucher Resmi
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          Klik salin kode untuk langsung menggunakan kupon pada saat checkout pesanan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((v, idx) => {
            const Icon = v.icon;
            const isCopied = copiedCode === v.code;

            return (
              <div
                key={idx}
                className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-[#FFC629] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-amber-800 border border-[#FDE68A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-0.5 text-[10px] font-bold">
                        {v.tag}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A] mt-1.5">
                        {v.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-neutral-400 font-medium">Syarat</span>
                    <strong className="text-neutral-800 font-bold">{v.minSpend}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(v.code)}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-[#F6F6F4] hover:bg-[#FFC629] hover:border-[#FFC629] px-4 py-2 font-mono font-black text-xs text-[#1A1A1A] transition active:scale-95 cursor-pointer"
                  >
                    <span>{v.code}</span>
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                        <span className="text-emerald-800 font-sans">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span className="font-sans">Salin</span>
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
              Gear Pilihan Katalog
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

        {promoProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {promoProducts.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group rounded-3xl border border-[#E5E5E5] bg-white p-3 sm:p-4 shadow-xs hover:border-[#FFC629] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                    <img
                      src={p.images?.[0] || "/images/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {p.originalNewPrice && p.originalNewPrice > p.price && (
                      <span className="absolute top-2 left-2 rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold">
                        Hemat {Math.round(((p.originalNewPrice - p.price) / p.originalNewPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A] line-clamp-1 group-hover:text-amber-800">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {p.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-100">
                  {p.originalNewPrice && p.originalNewPrice > p.price && (
                    <span className="text-[11px] text-neutral-400 line-through block">
                      {formatRupiah(p.originalNewPrice)}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-[#1A1A1A]">
                    {formatRupiah(p.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-8 text-center flex flex-col items-center justify-center gap-3">
            <Package className="h-8 w-8 text-amber-700" />
            <h3 className="text-sm font-bold text-[#1A1A1A]">Belum Ada Gear Promo di Katalog</h3>
            <p className="text-xs text-neutral-600">
              Barang yang baru saja disetujui kurator akan langsung ditampilkan di katalog.
            </p>
            <Link
              href="/catalog"
              className="mt-2 rounded-xl bg-[#1A1A1A] text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 transition"
            >
              Buka Katalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
