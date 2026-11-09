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
  Info,
  Clock,
  ChevronRight,
  Package,
  Loader2,
  CheckCircle2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
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
    if (!user) {
      showToast("Silakan masuk terlebih dahulu untuk melanjutkan");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/product/${product.slug}`)}`);
      return;
    }
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

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-amber-700">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
          Produk Tidak Ditemukan di Katalog
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md">
          Barang yang kamu cari mungkin sudah terjual atau belum dipublikasikan oleh kurator Hingo.
        </p>
        <Link
          href="/catalog"
          className="rounded-xl bg-[#1A1A1A] text-white px-6 py-3 text-xs sm:text-sm font-bold hover:bg-neutral-800 transition"
        >
          Kembali ke Katalog Belanja
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["/images/placeholder.png"];

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-4 py-3 sm:py-6 md:py-10 pb-28 md:pb-10">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-neutral-500 mb-3 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link href="/" className="hover:text-black">
          Beranda
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/catalog" className="hover:text-black">
          Jelajah
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href={`/catalog?cat=${product.category}`} className="hover:text-black">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-[#1A1A1A] font-bold truncate max-w-[150px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12">
        {/* KOLOM KIRI (Gallery & Inspeksi di Desktop / Urutan Vertikal di Mobile) */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
          {/* 2. FOTO UTAMA PERSEGI + 3 THUMBNAIL + CAPTION (Sesuai Figma Mobile) */}
          <div className="flex flex-col gap-2">
            <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F6F6F4] border border-[#E5E5E5] shadow-xs">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-2.5 left-2.5 z-10">
                <StatusBadge label="Dicek tim Hingo" variant="verified" size="sm" />
              </div>

              <div className="absolute top-2.5 right-2.5 z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      showToast("Silakan masuk terlebih dahulu untuk melanjutkan");
                      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/product/${product.slug}`)}`);
                      return;
                    }
                    toggleWishlist(product);
                  }}
                  className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-xs hover:bg-white text-neutral-700 hover:text-red-500 transition active:scale-90 cursor-pointer"
                >
                  <Heart className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Clickable Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-14 w-14 sm:h-20 sm:w-20 overflow-hidden rounded-xl sm:rounded-2xl border-2 transition cursor-pointer active:scale-95 ${
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

            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">
              Foto barang titipan · {images.length} foto · Geser untuk melihat detail
            </span>
          </div>

          {/* 3 & 4. INFO PRODUK (Tampil di urutan vertikal mobile) */}
          <div className="flex flex-col gap-2.5 sm:gap-3 rounded-2xl sm:rounded-3xl border border-[#E5E5E5] bg-white p-4 sm:p-6 shadow-xs">
            {/* Pills: Kondisi & Stok */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1A1A1A] text-white px-2.5 py-0.5 text-xs font-black">
                {product.condition}
              </span>
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-extrabold">
                Stok 1 barang
              </span>
            </div>

            {/* Judul & Subjudul */}
            <div>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                {product.brand} · {product.code}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A1A1A] mt-0.5">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            {/* Harga & Info Hemat */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-neutral-100">
              <span className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
                {formatRupiah(product.price)}
              </span>
              {product.originalNewPrice && product.originalNewPrice > product.price && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-400 line-through">
                    {formatRupiah(product.originalNewPrice)}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Hemat {formatRupiah(product.originalNewPrice - product.price)}
                  </span>
                </div>
              )}
            </div>

            {/* 5. INFO PENGIRIMAN */}
            <div className="flex flex-col gap-2 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Dikirim dari <strong>Jakarta Selatan (Gudang Hingo)</strong></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>Ongkir estimasi ke Tebet, Jakarta Selatan <strong>Rp18.000</strong></span>
              </div>
            </div>
          </div>

          {/* 6. KARTU KREM: DICEK DAN DIKIRIM TIM KAMI */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 text-xs text-amber-950 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-amber-800 shrink-0" />
              <strong className="text-sm font-black text-amber-950">Dicek dan dikirim tim kami</strong>
            </div>
            <p className="text-amber-900 text-xs leading-relaxed">
              Barang disimpan di fasilitas Hingo, melewati 12 titik inspeksi teknisi, dan dana baru diteruskan ke penjual setelah kamu mengonfirmasi barang diterima dengan baik dalam 48 jam.
            </p>
          </div>

          {/* 7. KARTU DIKELOLA TIM HINGO (ADMIN HINGO) */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#FFC629] text-black font-black flex items-center justify-center text-sm shadow-xs">
                  H
                </div>
                <div>
                  <div className="text-sm font-black text-[#1A1A1A] flex items-center gap-1.5">
                    <span>Admin Hingo</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Tim Kurator & Inspeksi Resmi · Aktif</div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleChatAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 py-3 text-xs font-bold text-neutral-800 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-neutral-600" />
              <span>Chat admin</span>
            </button>
          </div>

          {/* 8. KARTU TENTANG BARANG INI (TABEL KONDISI & SPESIFIKASI) */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tentang barang ini
              </h3>
              <span className="text-xs font-bold text-emerald-600">✓ Lolos Uji Lab</span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kondisi</span>
                <strong className="text-neutral-800">{product.condition}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Pemakaian</span>
                <strong className="text-neutral-800">{product.usageDuration}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Switch / Varian</span>
                <strong className="text-neutral-800 truncate block">{product.switchOrVariant || "Original"}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kelengkapan</span>
                <strong className="text-neutral-800 truncate block">{product.completeness}</strong>
              </div>
            </div>

            {product.defectNotes && (
              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5 text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold mb-0.5">Catatan Fisik / Kosmetik:</strong>
                {product.defectNotes}
              </div>
            )}
          </div>

          {/* 10. BANNER KREM: GUNAKAN PEMBAYARAN RESMI */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 text-center text-xs text-neutral-700">
            <strong className="text-black block mb-1">Gunakan pembayaran resmi Hingo</strong>
            Demi keamanan bersama, jangan pernah mentransfer ke rekening pribadi penjual. Transaksi melalui Hingo dilindungi garansi uang kembali 48 jam jika barang cacat atau tidak sesuai deskripsi.
          </div>
        </div>

        {/* KOLOM KANAN (Desktop Action Box - Hidden di Mobile karena ada Sticky Action Bar) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-6">
          <div className="sticky top-28 rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <div>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                {product.brand} · {product.code}
              </span>
              <h1 className="text-2xl font-black text-[#1A1A1A] mt-1">
                {product.name}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3 py-3 border-y border-neutral-100">
              <span className="text-3xl font-black text-[#1A1A1A]">
                {formatRupiah(product.price)}
              </span>
              {product.originalNewPrice && product.originalNewPrice > product.price && (
                <span className="text-sm font-semibold text-neutral-400 line-through">
                  {formatRupiah(product.originalNewPrice)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Pengiriman dari <strong>{product.location}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-500" />
                <span>Garansi tes fungsi <strong>48 jam</strong> sejak barang tiba</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black transition shadow-xs cursor-pointer ${
                  isAlreadyInCart
                    ? "bg-[#1A1A1A] text-[#FFC629] hover:bg-neutral-800"
                    : "bg-[#FFC629] hover:bg-[#FFC420] text-[#1A1A1A] active:scale-[0.99]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{isAlreadyInCart ? "Lihat di Keranjang" : "Tambah ke Keranjang"}</span>
              </button>
              <button
                type="button"
                onClick={handleChatAdmin}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 bg-[#F6F6F4] hover:bg-neutral-200 py-3 text-xs font-bold text-neutral-800 transition cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat Admin Hingo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 9. STICKY BOTTOM PURCHASE ACTION BAR (Mobile < 768px Sesuai Figma Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-[#E5E5E5] px-3.5 py-2.5 pb-3 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 safe-area-bottom">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500 font-medium text-[11px]">Harga barang</span>
          <span className="text-sm font-black text-[#1A1A1A]">
            {formatRupiah(product.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleChatAdmin}
            className="w-1/3 h-10.5 flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition active:scale-95 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-2/3 h-10.5 flex items-center justify-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-xs font-black text-[#1A1A1A] shadow-xs transition active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isAlreadyInCart ? "Lihat Keranjang" : "Tambah keranjang"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
