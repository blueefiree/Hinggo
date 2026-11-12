"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useHingoStore();
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
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#EBEBEB] bg-white p-2.5 sm:p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFC629] hover:shadow-md">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FFFBEB] flex items-center justify-center">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top-Left Verified Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#1F9D55] shadow-xs">
              <ShieldCheck className="h-3 w-3 text-[#1F9D55]" />
              Dicek tim
            </span>
          </div>

          {/* Top-Right Favorite Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={isWishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
            className="absolute top-2 right-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-neutral-600 shadow-xs transition hover:text-red-500 active:scale-90 cursor-pointer"
          >
            <Heart
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-neutral-500 hover:text-red-500"
              }`}
            />
          </button>
        </div>

        {/* Content info */}
        <div className="mt-2.5 flex flex-col gap-0.5 sm:gap-1">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#8A8A8A] uppercase">
            {product.brand}
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-[13px] sm:text-[15px] font-semibold text-[#1A1A1A] transition-colors group-hover:text-[#D97706] leading-snug"
          >
            {product.name}
          </Link>

          {/* Condition: Sangat baik · 1 barang */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-[#8A8A8A] mt-0.5">
            <span className="font-medium text-[#4B4B4B]">{product.condition}</span>
            <span>·</span>
            <span>1 barang</span>
            {product.rating && (
              <>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline font-semibold text-[#1A1A1A]">★ {product.rating.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price & Location Bar */}
      <div className="mt-2.5 sm:mt-3 pt-2 border-t border-[#EBEBEB] flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-[15px] sm:text-lg font-extrabold text-[#1A1A1A]">
            {formatRupiah(product.price)}
          </span>
          {product.originalNewPrice && product.originalNewPrice > product.price && (
            <span className="text-[10px] sm:text-xs text-[#8A8A8A] line-through truncate">
              {formatRupiah(product.originalNewPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#4B4B4B]">
          <span className="flex items-center gap-1 truncate">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#1F9D55] shrink-0" />
            <span className="truncate">Hingo · {product.location || "Jakarta Selatan"}</span>
          </span>
          {product.soldCount ? (
            <span className="hidden sm:inline text-[#8A8A8A] text-[11px] shrink-0">{product.soldCount} terjual</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
