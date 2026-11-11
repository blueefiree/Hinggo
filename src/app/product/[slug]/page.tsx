"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Heart,
  MessageSquare,
  ShoppingBag,
  Clock,
  ChevronRight,
  Package,
  Loader2,
  Calendar,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, addToCart, isInWishlist, toggleWishlist, cart, showToast } = useHingoStore();

  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product || null);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const isFavorite = product ? isInWishlist(product.id) : false;
  const isAlreadyInCart = product
    ? cart.some(
        (item) => item.product.id === product.id || (item as any).productId === product.id
      )
    : false;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product);
    if (res.alreadyInCart) {
      router.push("/cart");
    }
  };

  const handleChatAdmin = (e?: React.MouseEvent) => {
    if (!product) return;
    if (!user) {
      if (e) e.preventDefault();
      showToast("Silakan masuk terlebih dahulu untuk melanjutkan");
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(`/chat/product?productId=${product.id}`)}`
      );
    } else {
      router.push(`/chat/product?productId=${product.id}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-28 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
        <p className="text-sm font-semibold text-neutral-500">Memuat rincian gear...</p>
      </div>
    );
  }

  // 404 Halaman Bersih & Rapi
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] flex items-center justify-center text-amber-800 shadow-xs">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
          Produk Tidak Ditemukan
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed">
          Barang yang kamu cari mungkin sudah terjual atau tautan produk sudah tidak aktif.
        </p>
        <Link
          href="/catalog"
          className="rounded-xl bg-[#1A1A1A] text-white px-6 py-3 text-xs sm:text-sm font-bold hover:bg-neutral-800 transition active:scale-95 shadow-xs"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["/images/placeholder.png"];

  // Hitung persentase hemat dari data
  const hasOriginalPrice = product.originalNewPrice && product.originalNewPrice > product.price;
  const hematNominal = hasOriginalPrice ? product.originalNewPrice - product.price : 0;
  const hematPercent = hasOriginalPrice
    ? Math.round((hematNominal / product.originalNewPrice) * 100)
    : 0;

  const formattedUploadDate = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tersedia baru saja";

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-32 md:pb-12">
      {/* 1. BREADCRUMB: Jelajah / Kategori / Nama barang (Sesuai Figma node 10:25521) */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-neutral-500 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/catalog" className="hover:text-black">
          Jelajah
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/catalog?cat=${product.category}`} className="hover:text-black uppercase">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-[#1A1A1A] font-bold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* KOLOM KIRI (Gallery & Informasi Tambahan) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 2. GALERI FOTO: Foto besar + 3 thumbnail + keterangan foto */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F6F6F4] border border-[#EBEBEB] shadow-xs">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-all duration-300"
              />

              {/* Badge Dicek Tim di Kiri Atas */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1F9D55] shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#1F9D55]" />
                  Dicek tim Hingo
                </span>
              </div>

              {/* Tombol Hati di Kanan Atas */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-xs backdrop-blur-xs hover:bg-white text-neutral-700 hover:text-red-500 transition active:scale-90 cursor-pointer"
                  aria-label="Tambah ke wishlist"
                >
                  <Heart
                    className={`h-4.5 w-4.5 transition-colors ${
                      isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-neutral-600"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 3 Thumbnail (Geser untuk mobile) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer active:scale-95 ${
                      activeImageIndex === idx
                        ? "border-[#FFC629] ring-2 ring-[#FFC629]/20"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <span className="text-[11px] text-neutral-400 font-medium">
              Foto barang titipan · {images.length} foto · Geser untuk melihat detail
            </span>
          </div>

          {/* INFO PRODUK KHUSUS MOBILE (Urutan vertikal sesuai Figma Mobile node 10:25655) */}
          <div className="lg:hidden flex flex-col gap-4 rounded-2xl border border-[#EBEBEB] bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1A1A1A] text-white px-3 py-1 text-xs font-black">
                {product.condition}
              </span>
              <span className="rounded-full bg-[#FFF3C4] text-[#1A1A1A] border border-[#FFE58A] px-3 py-1 text-xs font-extrabold">
                Stok 1 barang
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-400">
                {product.brand} · {product.code}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1A1A] mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3 pt-2 border-t border-neutral-100">
              <span className="text-2xl font-black text-[#1A1A1A]">
                {formatRupiah(product.price)}
              </span>
              {hasOriginalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 line-through">
                    {formatRupiah(product.originalNewPrice)}
                  </span>
                  <span className="rounded-full bg-emerald-50 text-[#1F9D55] text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                    Hemat {hematPercent}%
                  </span>
                </div>
              )}
            </div>

            {/* Rincian Pengiriman Mobile */}
            <div className="flex flex-col gap-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#1F9D55] shrink-0" />
                <span>Dikirim dari <strong>{product.location || "Jakarta Selatan"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>Ke Jakarta Selatan + ongkir Rp18.000 · Estimasi 1-2 hari tiba</span>
              </div>
            </div>

            {/* Kotak Krem: Dicek dan dikirim tim kami */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] p-4 text-xs text-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-[#1F9D55]" />
                <strong className="font-bold">Dicek dan dikirim tim kami</strong>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Barang dicek fisik oleh kurator Hingo, disimpan di fasilitas kami, dan dana aman di rekening bersama sampai pesanan diterima.
              </p>
            </div>
          </div>

          {/* KARTU "TENTANG BARANG INI": Kondisi, Pemakaian, Spesifikasi, Kelengkapan, Deskripsi, Tanggal Unggah, Kode */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#EBEBEB] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tentang barang ini
              </h3>
              <span className="text-xs font-bold text-[#1F9D55] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 12 Poin Lolos Uji
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kondisi</span>
                <strong className="text-neutral-800">{product.condition}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Pemakaian</span>
                <strong className="text-neutral-800">{product.usageDuration}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Switch / Spesifikasi</span>
                <strong className="text-neutral-800 truncate block">{product.switchOrVariant || "Original"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kelengkapan</span>
                <strong className="text-neutral-800 truncate block">{product.completeness}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Tanggal Unggah
                </span>
                <strong className="text-neutral-800 block truncate">{formattedUploadDate}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px] flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Kode Barang
                </span>
                <strong className="text-neutral-800 font-mono block">{product.code}</strong>
              </div>
            </div>

            {product.defectNotes && (
              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] p-3.5 text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold mb-0.5">Catatan Fisik / Kosmetik:</strong>
                {product.defectNotes}
              </div>
            )}
          </div>

          {/* KARTU "DIKELOLA TIM HINGO" DENGAN AVATAR ADMIN HINGO & TOMBOL CHAT ADMIN */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#EBEBEB] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#FFC629] text-black font-black flex items-center justify-center text-sm shadow-xs">
                  H
                </div>
                <div>
                  <div className="text-sm font-black text-[#1A1A1A] flex items-center gap-1.5">
                    <span>Admin Hingo</span>
                    <span className="flex h-2 w-2 rounded-full bg-[#1F9D55]" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Tim Kurator & Inspeksi Resmi · Dikelola tim Hingo</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleChatAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 py-2.5 text-xs font-bold text-neutral-800 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-neutral-600" />
              <span>Chat admin</span>
            </button>
          </div>

          {/* KOTAK KREM: "GUNAKAN PEMBAYARAN RESMI" */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FFE58A] p-5 text-center text-xs text-neutral-700 leading-relaxed shadow-xs">
            <strong className="text-black block mb-1 font-extrabold">Gunakan pembayaran resmi</strong>
            Demi keamanan bersama, jangan pernah mentransfer ke rekening pribadi penjual. Transaksi melalui Hingo dilindungi garansi uang kembali 48 jam jika barang cacat atau tidak sesuai deskripsi.
          </div>
        </div>

        {/* KOLOM KANAN: DESKTOP STICKY PURCHASE PANEL (>= 1024px sesuai Figma node 10:25521) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-6">
          <div className="sticky top-28 rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            {/* Chips: Kondisi & Stok 1 barang */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1A1A1A] text-white px-3 py-1 text-xs font-black">
                {product.condition}
              </span>
              <span className="rounded-full bg-[#FFF3C4] text-[#1A1A1A] border border-[#FFE58A] px-3 py-1 text-xs font-extrabold">
                Stok 1 barang
              </span>
            </div>

            {/* Judul & Subjudul */}
            <div>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                {product.brand} · {product.code}
              </span>
              <h1 className="text-2xl font-black text-[#1A1A1A] mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            {/* Harga & "Harga baru sekitar ... · Hemat N%" */}
            <div className="py-3 border-y border-neutral-100 flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#1A1A1A]">
                  {formatRupiah(product.price)}
                </span>
                {hasOriginalPrice && (
                  <span className="text-sm font-semibold text-neutral-400 line-through">
                    {formatRupiah(product.originalNewPrice)}
                  </span>
                )}
              </div>
              {hasOriginalPrice && (
                <div className="text-xs text-neutral-600 font-medium">
                  Harga baru sekitar {formatRupiah(product.originalNewPrice)} ·{" "}
                  <span className="font-bold text-[#1F9D55]">Hemat {hematPercent}%</span>
                </div>
              )}
            </div>

            {/* Rincian Pengiriman */}
            <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#1F9D55]" />
                <span>Dikirim dari <strong>{product.location || "Jakarta Selatan (Gudang Hingo)"}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-500" />
                <span>Ke Jakarta Selatan + ongkir <strong>Rp18.000</strong> · Estimasi tiba 1-2 hari</span>
              </div>
            </div>

            {/* Kotak Krem: Dicek dan dikirim tim kami */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] p-4 text-xs text-neutral-800 leading-relaxed">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-[#1F9D55]" />
                <strong className="font-bold text-[#1A1A1A]">Dicek dan dikirim tim kami</strong>
              </div>
              <p className="text-neutral-600 text-[11px]">
                Barang disimpan di gudang Hingo, diperiksa fisik, dan dilindungi garansi 48 jam rekening bersama.
              </p>
            </div>

            {/* Dua Tombol: "Tambah keranjang" (kuning) dan "Chat admin" (putih) */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition shadow-xs cursor-pointer active:scale-95 ${
                  isAlreadyInCart
                    ? "bg-[#1A1A1A] text-[#FFC629] hover:bg-neutral-800"
                    : "bg-[#FFC629] hover:bg-[#FFC420] text-[#1A1A1A]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{isAlreadyInCart ? "Lihat di Keranjang" : "Tambah keranjang"}</span>
              </button>

              <button
                type="button"
                onClick={handleChatAdmin}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 py-3 text-xs font-bold text-neutral-800 transition cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-neutral-600" />
                <span>Chat admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION BAR PADA MOBILE (< 768px Sesuai Figma node 10:25655) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-[#EBEBEB] px-4 py-2.5 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 safe-area-bottom">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-medium text-[11px]">Total harga (Stok 1)</span>
          <span className="text-sm font-black text-[#1A1A1A]">
            {formatRupiah(product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol Putih "Chat admin" */}
          <button
            type="button"
            onClick={handleChatAdmin}
            className="w-1/3 h-11 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </button>

          {/* Tombol Kuning "Tambah keranjang" */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-2/3 h-11 flex items-center justify-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-xs font-black text-[#1A1A1A] shadow-xs transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isAlreadyInCart ? "Lihat Keranjang" : "Tambah keranjang"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
