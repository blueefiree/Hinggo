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

  const handleChatAdmin = (e: React.MouseEvent) => {
    if (!product) return;
    if (!user) {
      e.preventDefault();
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
        <span className="text-[#1A1A1A] font-bold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Photo Gallery & Inspection Report */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Photo Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-[#F6F6F4] border border-[#E5E5E5] shadow-xs">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 z-10">
                <StatusBadge label="Dicek tim Hingo" variant="verified" />
              </div>

              <div className="absolute top-4 right-4 z-10 flex gap-2">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-xs backdrop-blur-xs hover:bg-white text-neutral-700 hover:text-red-500 transition cursor-pointer"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Clickable Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition cursor-pointer ${
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
          </div>

          {/* Inspection Report Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-[#1A1A1A]">
                  Laporan Hasil Uji Fungsi Laboratorium
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
                Lolos Pengecekan
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium">
              {product.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kondisi Fisik</span>
                <strong className="text-neutral-800">{product.condition}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Durasi Pemakaian</span>
                <strong className="text-neutral-800">{product.usageDuration}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-[#F6F6F4]">
                <span className="text-neutral-400 block text-[11px]">Kelengkapan</span>
                <strong className="text-neutral-800">{product.completeness}</strong>
              </div>
            </div>

            {product.defectNotes && (
              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold mb-1">Catatan Cacat Kosmetik:</strong>
                {product.defectNotes}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Action Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <div>
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400">
                {product.brand} · {product.code}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] mt-1">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3 py-2 border-y border-neutral-100">
              <span className="text-3xl font-black text-[#1A1A1A]">
                {formatRupiah(product.price)}
              </span>
              {product.originalNewPrice && product.originalNewPrice > product.price && (
                <span className="text-sm font-semibold text-neutral-400 line-through">
                  {formatRupiah(product.originalNewPrice)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-neutral-500" />
                <span>Pengiriman dari <strong>{product.location}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-500" />
                <span>Garansi tes fungsi <strong>2 × 24 jam</strong> sejak barang tiba</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition shadow-xs cursor-pointer ${
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-[#F6F6F4] px-5 py-3.5 text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Tanya Admin</span>
              </button>
            </div>
          </div>
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
