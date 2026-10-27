"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Star,
  Truck,
  Heart,
  Share2,
  CheckCircle2,
  MessageSquare,
  ShoppingBag,
  ArrowRight,
  Info,
  Clock,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { PRODUCTS, Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useHingoStore();

  const slug = params?.slug as string;
  const product: Product =
    PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddToCart = () => {
    addToCart(product);
    router.push("/cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
        <Link href="/" className="hover:text-black">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/catalog" className="hover:text-black">
          Jelajah
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/catalog?cat=${product.category}`} className="hover:text-black">
          {product.category}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#1A1A1A] font-bold line-clamp-1">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Photo Gallery & Inspection Report */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Photo Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-[#F6F6F4] border border-[#E5E5E5] shadow-xs">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 z-10">
                <StatusBadge label="Dicek tim Hingo" variant="verified" />
              </div>

              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-xs hover:bg-white text-neutral-700 hover:text-red-500 transition"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Clickable Thumbnails */}
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-4/3 w-20 overflow-hidden rounded-xl border-2 transition ${
                    activeImageIndex === idx
                      ? "border-[#FFC629] ring-2 ring-[#FFC629]/40"
                      : "border-neutral-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
              <span className="text-xs text-neutral-500 font-medium ml-2">
                Foto barang titipan asli · {product.images.length} foto
              </span>
            </div>
          </div>

          {/* Tentang Barang Ini Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <h2 className="text-lg font-black text-[#1A1A1A]">
              Tentang barang ini
            </h2>

            {/* Spec Key-Value Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-[#F6F6F4] p-4 text-xs">
              <div>
                <span className="text-neutral-500 block">Kondisi</span>
                <strong className="text-[#1A1A1A] text-sm font-bold">
                  {product.condition}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Lama Pemakaian</span>
                <strong className="text-[#1A1A1A] text-sm font-bold">
                  {product.usageDuration}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Varian / Switch</span>
                <strong className="text-[#1A1A1A] text-sm font-bold">
                  {product.switchOrVariant}
                </strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Kelengkapan</span>
                <strong className="text-[#1A1A1A] text-sm font-bold">
                  {product.completeness}
                </strong>
              </div>
            </div>

            {/* Description & Defect Notes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Deskripsi & Hasil Pengecekan Fisik
              </h3>
              <p className="text-sm leading-relaxed text-neutral-700 font-medium">
                {product.description}
              </p>
            </div>

            {/* Defect warning box if present */}
            {product.defectNotes && (
              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 leading-relaxed">
                  <strong className="text-[#1A1A1A] font-bold">Catatan Kosmetik: </strong>
                  {product.defectNotes}
                </div>
              </div>
            )}

            <div className="border-t border-neutral-100 pt-4 flex items-center justify-between text-xs text-neutral-400">
              <span>Diunggah 22 Oktober 2026</span>
              <span>Kode barang: <strong className="text-neutral-700">{product.code}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Shipping, & CTA */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="sticky top-28 rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1 text-xs font-bold text-amber-900">
                {product.condition}
              </span>
              <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600">
                Stok 1 barang
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#8A8A8A]">
                {product.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] mt-0.5">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            {/* Price block */}
            <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#1A1A1A]">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-sm font-semibold text-neutral-400 line-through">
                  {formatRupiah(product.originalNewPrice)}
                </span>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">
                Harga baru sekitar {formatRupiah(product.originalNewPrice)} · Hemat 43%
              </span>
            </div>

            {/* Shipping Info Card */}
            <div className="rounded-2xl border border-neutral-200 p-4 flex flex-col gap-2.5 text-xs text-neutral-700">
              <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                <Truck className="h-4 w-4 text-amber-600" />
                <span>Pengiriman dari Jakarta Selatan</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 pl-6">
                <span>Ke Tebet, Jakarta Selatan</span>
                <span className="font-bold text-[#1A1A1A]">Rp18.000</span>
              </div>
              <div className="pl-6 text-[11px] text-neutral-500">
                Kurir JNE REG · Estimasi tiba 24–25 Okt 2026
              </div>
            </div>

            {/* Trust box */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-neutral-800 leading-snug">
                <strong className="text-black">Dicek dan dikirim tim kami</strong> — Dana
                disimpan di escrow Hingo sampai barang tiba dan kamu periksa.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/chat/product"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-300 py-3.5 text-xs sm:text-sm font-bold text-neutral-800 hover:bg-neutral-50 transition"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat admin</span>
              </Link>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Tambah keranjang</span>
              </button>
            </div>

            {/* Dikelola Tim Hingo Pill */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC629] font-black text-black">
                  H
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Admin Hingo</h4>
                  <p className="text-[11px] text-neutral-500">Tim pengelola · Aktif 5 menit lalu</p>
                </div>
              </div>
              <Link
                href="/chat/product"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Chat admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bar for Mobile */}
      <div className="fixed bottom-16 left-0 right-0 z-40 flex items-center justify-between border-t border-neutral-200 bg-white/95 p-3 px-4 shadow-lg backdrop-blur-md md:hidden">
        <div>
          <span className="text-[10px] text-neutral-500 block">Harga barang</span>
          <span className="text-base font-black text-[#1A1A1A]">
            {formatRupiah(product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/chat/product"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-xl bg-[#FFC629] px-4 py-2.5 text-xs font-bold text-black shadow-xs"
          >
            Tambah keranjang
          </button>
        </div>
      </div>

      {/* Full-width Official Payment Banner */}
      <div className="mt-12 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 text-center text-xs text-neutral-700">
        <strong className="text-black">Gunakan pembayaran resmi Hingo:</strong> Demi
        keamanan bersama, jangan pernah mentransfer ke rekening pribadi penjual.
        Transaksi melalui Hingo dilindungi garansi uang kembali jika barang tidak sesuai deskripsi.
      </div>
    </div>
  );
}
