"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Keyboard,
  Mouse,
  Headphones,
  Tv,
  Truck,
  MessageSquare,
  Package,
  Plus,
  Loader2,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

export default function Home() {
  const { user } = useHingoStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState({
    KEYBOARD: 0,
    MOUSE: 0,
    HEADSET: 0,
    MONITOR: 0,
    ACCESSORIES: 0,
    TOTAL: 0,
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          if (data.categoryCounts) {
            setCategoryCounts(data.categoryCounts);
          }
        }
      } catch (err) {
        console.error("Failed to load products for homepage:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const bestSellers = products.slice(0, 4);
  const recommendations = products.slice(4, 8).length > 0 ? products.slice(4, 8) : products.slice(0, 4);

  return (
    <div className="flex flex-col gap-10 md:gap-16 py-4 md:py-8">
      {/* 1. HERO BANNER */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#FFC629] p-6 sm:p-10 md:p-14 lg:p-16 shadow-md">
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-black/5 blur-xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Konsinyasi dikelola tim kami</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-[#1A1A1A] leading-[1.1]">
                Titip jual gear, <br className="hidden sm:block" />
                kami yang urus.
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[#1A1A1A]/85 max-w-xl font-medium leading-relaxed">
                Titipkan peripheral ke Hingo. Kami cek fisik, simpan aman, pasarkan lewat
                Instagram, Facebook, dan TikTok, lalu kirim ke pembeli dengan proteksi
                rekening bersama.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
                <Link
                  href="/catalog"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Belanja sekarang
                </Link>
                <Link
                  href="/how-it-works"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-[#1A1A1A] shadow-md transition hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cara titip jual
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust stats */}
              <div className="pt-2 flex items-center gap-6 text-xs sm:text-sm text-[#1A1A1A]/90 font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>{categoryCounts.TOTAL} Gear Terverifikasi</span>
                </div>
                <span>·</span>
                <div>Garansi Cek Fisik 100%</div>
              </div>
            </div>

            {/* Right Bento Cards with Vector Peripheral Styling */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              {/* Card 1: Top Wide Keyboard */}
              <div className="col-span-2 rounded-2xl bg-white p-5 shadow-lg border border-white/60 transition hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-[#FDE68A]">
                      Top Rated Gear
                    </span>
                    <h3 className="mt-2 text-base sm:text-lg font-bold text-[#1A1A1A]">
                      Mechanical Keyboard
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Gasket mount · Hot-swap · Sound test verified
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC629]/20 text-[#1A1A1A]">
                    <Keyboard className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-semibold">
                  <span className="text-[#16A34A] flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Lolos Pengecekan
                  </span>
                  <span className="text-neutral-500 font-bold">{categoryCounts.KEYBOARD} Unit</span>
                </div>
              </div>

              {/* Card 2: Bottom-Left Mouse */}
              <div className="col-span-1 rounded-2xl bg-white p-4 shadow-lg border border-white/60 transition hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A1A] text-[#FFC629]">
                    <Mouse className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#1A1A1A]">
                    Wireless Mouse
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Sensor optik & baterai teruji
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] font-bold text-neutral-700">
                  {categoryCounts.MOUSE} Pilihan
                </div>
              </div>

              {/* Card 3: Bottom-Right Headset */}
              <div className="col-span-1 rounded-2xl bg-white p-4 shadow-lg border border-white/60 transition hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-amber-800 border border-[#FDE68A]">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#1A1A1A]">
                    Gaming Headset
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Busa earpad bersih & audio seimbang
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 text-[11px] font-bold text-neutral-700">
                  {categoryCounts.HEADSET} Pilihan
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 TRUST PILLARS STRIP */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4 sm:p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
            <div className="flex items-center gap-3.5 pt-2 md:pt-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-amber-700 border border-[#FDE68A]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">Dikelola tim kami</h4>
                <p className="text-xs text-neutral-500">Kami cek fisik, foto, dan simpan</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">Pengecekan barang</h4>
                <p className="text-xs text-neutral-500">Transparan tanpa cacat tersembunyi</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">Chat admin</h4>
                <p className="text-xs text-neutral-500">Tanya langsung sebelum transaksi</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1A1A1A]">Pengiriman terlacak</h4>
                <p className="text-xs text-neutral-500">Rekening bersama, dana aman</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI POPULER - 100% DINAMIS DARI DATABASE */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Kategori Populer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Pilihan gear preloved paling diminati
            </p>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-700 hover:text-black"
          >
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <Link
            href="/catalog?cat=KEYBOARD"
            className="group flex flex-col justify-between rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 transition hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs text-neutral-800 group-hover:scale-110 transition">
                <Keyboard className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="mt-6">
              <h3 className="text-base font-bold text-[#1A1A1A]">Keyboard</h3>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {categoryCounts.KEYBOARD} produk
              </p>
            </div>
          </Link>

          <Link
            href="/catalog?cat=MOUSE"
            className="group flex flex-col justify-between rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 transition hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs text-neutral-800 group-hover:scale-110 transition">
                <Mouse className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="mt-6">
              <h3 className="text-base font-bold text-[#1A1A1A]">Mouse</h3>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {categoryCounts.MOUSE} produk
              </p>
            </div>
          </Link>

          <Link
            href="/catalog?cat=HEADSET"
            className="group flex flex-col justify-between rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 transition hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs text-neutral-800 group-hover:scale-110 transition">
                <Headphones className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="mt-6">
              <h3 className="text-base font-bold text-[#1A1A1A]">Headset</h3>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {categoryCounts.HEADSET} produk
              </p>
            </div>
          </Link>

          <Link
            href="/catalog?cat=MONITOR"
            className="group flex flex-col justify-between rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-5 transition hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs text-neutral-800 group-hover:scale-110 transition">
                <Tv className="h-6 w-6" />
              </div>
              <ArrowRight className="h-4 w-4 text-amber-700 opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="mt-6">
              <h3 className="text-base font-bold text-[#1A1A1A]">Monitor</h3>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {categoryCounts.MONITOR} produk
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. PRODUK TERLARIS */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Pilihan Kurator
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Produk Terlaris
            </h2>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-700 hover:text-black"
          >
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#FFC629]" />
            <p className="text-xs font-semibold text-neutral-500">Memuat produk pilihan...</p>
          </div>
        ) : bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-[#FFC629] text-[#1A1A1A] flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Belum ada barang titipan di katalog
            </h3>
            <p className="text-xs text-neutral-600 max-w-md">
              Semua barang di katalog Hingo berasal dari pengajuan titip jual yang telah lolos inspeksi tim kami.
            </p>
            <Link
              href={user ? "/seller/consignments/new" : "/auth/login?callbackUrl=/seller/consignments/new"}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajukan titip jual sekarang</span>
            </Link>
          </div>
        )}
      </section>

      {/* 5. HOW CONSIGNMENT WORKS */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 sm:p-10 md:p-12">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Alur Konsinyasi Terkelola
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              Titip jual, kami urus sampai terjual.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              Kamu tak perlu repot membalas chat pembeli atau packing kardus. Tim Hingo
              menangani dari kurasi awal hingga pencairan dana ke rekeningmu.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC629] text-xs font-black text-black">
                  1
                </span>
                <h3 className="mt-4 text-base font-bold text-[#1A1A1A]">
                  Ajukan titip jual
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                  Isi spesifikasi gear dan unggah foto asli. Tim kurator mereview kelayakan
                  dalam 1×24 jam.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC629] text-xs font-black text-black">
                  2
                </span>
                <h3 className="mt-4 text-base font-bold text-[#1A1A1A]">
                  Kami cek & simpan
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                  Kirim gear ke gudang Hingo. Kami uji fungsi switch, sensor, baterai, lalu
                  simpan rapi di fasilitas terkontrol.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC629] text-xs font-black text-black">
                  3
                </span>
                <h3 className="mt-4 text-base font-bold text-[#1A1A1A]">
                  Kami pasarkan
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                  Foto produk profesional dan kami iklankan di Instagram Reels, TikTok, dan
                  grup komunitas antusias.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-xs border border-neutral-100 flex flex-col justify-between">
              <div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC629] text-xs font-black text-black">
                  4
                </span>
                <h3 className="mt-4 text-base font-bold text-[#1A1A1A]">
                  Terjual & dikirim
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                  Kami kirim ke pembeli via kurir resmi. Begitu pembeli konfirmasi terima,
                  dana langsung cair ke rekeningmu.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Tanpa biaya pendaftaran di muka · Komisi hanya dipotong saat gear terjual</span>
            </div>
            <Link
              href={user ? "/seller/consignments/new" : "/auth/login?callbackUrl=/seller/consignments/new"}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 transition"
            >
              Mulai titip gear sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. REKOMENDASI UNTUKMU */}
      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
              Rekomendasi Untukmu
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Barang titipan yang dikelola tim kami
            </p>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-700 hover:text-black"
          >
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[#FFC629]" />
            <p className="text-xs font-semibold text-neutral-500">Memuat rekomendasi...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-[#FFC629] text-[#1A1A1A] flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Belum ada barang titipan di katalog
            </h3>
            <p className="text-xs text-neutral-600 max-w-md">
              Semua barang di katalog Hingo berasal dari pengajuan titip jual yang telah lolos inspeksi tim kami.
            </p>
            <Link
              href={user ? "/seller/consignments/new" : "/auth/login?callbackUrl=/seller/consignments/new"}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ajukan titip jual sekarang</span>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
