"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const router = useRouter();
  const { user, isInWishlist, toggleWishlist, showToast } = useHingoStore();
  const isWishlisted = isInWishlist(product.id);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast("Silakan masuk terlebih dahulu untuk melanjutkan");
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/catalog")}`);
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#E5E5E5] bg-white p-3 md:p-4 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#FFC629] hover:shadow-lg">
      <div>
        {/* Image Container with Badges (Square Aspect Ratio) */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F6F6F4]">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top-Left Verified Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-[#16A34A] shadow-xs backdrop-blur-xs">
              <ShieldCheck className="h-3 w-3 text-[#16A34A]" />
              Dicek tim
            </span>
          </div>

          {/* Top-Right Favorite Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={isWishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
            className="absolute top-2 right-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-red-500 cursor-pointer"
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-neutral-600 hover:text-red-500"
              }`}
            />
          </button>
        </div>

        {/* Content info */}
        <div className="mt-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold tracking-wider text-[#8A8A8A] uppercase">
            {product.brand}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-xs sm:text-sm font-bold text-[#1A1A1A] transition-colors group-hover:text-[#D97706] leading-tight"
          >
            {product.name}
          </Link>

          {/* Condition: Sangat baik · 1 barang */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1">
            <span className="font-semibold text-neutral-700">{product.condition}</span>
            <span>·</span>
            <span>1 barang</span>
          </div>
        </div>
      </div>

      {/* Price & Managed Tag */}
      <div className="mt-2.5 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-sm sm:text-base font-black text-[#1A1A1A]">
            {formatRupiah(product.price)}
          </span>
          {product.originalNewPrice && (
            <span className="text-[10px] text-[#8A8A8A] line-through truncate">
              {formatRupiah(product.originalNewPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#16A34A] font-semibold bg-[#F0FDF4] px-2 py-0.5 rounded-lg">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Hingo
          </span>
          <span className="text-neutral-600 font-medium">Jakarta Selatan</span>
        </div>
      </div>
    </div>
  );
}
