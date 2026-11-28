"use client";

import Link from "next/link";
import { Item } from "@/types";
import { ShieldCheck, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface ProductCardProps {
  item: Item;
}

export default function ProductCard({ item }: ProductCardProps) {
  const isAvailable = item.status === "Tayang";
  const displayPrice = item.current_listing_price || item.expected_price;
  const mainPhoto =
    item.photos && item.photos.length > 0
      ? item.photos[0]
      : "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80";

  return (
    <Link
      href={`/produk/${item.id}`}
      className="group bg-white rounded-[16px] border border-gray-200 hover:border-yellow-500/60 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col overflow-hidden block h-full"
    >
      {/* Product Image container — yellow-50 bg, rounded-12px inner */}
      <div className="p-2.5 sm:p-3 pb-0">
        <div className="relative w-full h-36 xs:h-44 sm:h-48 bg-[#fffbeb] rounded-[12px] overflow-hidden flex items-center justify-center">
          <img
            src={mainPhoto}
            alt={`${item.brand} ${item.model}`}
            className="size-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />

          {/* Category tag — top left */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-ink/80 text-white uppercase tracking-wider backdrop-blur-xs">
            {item.category}
          </span>

          {/* Dicek tim / Rekber badge — top right (white pill, green text) */}
          {isAvailable && (
            <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[10px] sm:text-[11px] font-semibold text-[#1f9d55] shadow-xs">
              <ShieldCheck className="size-3 stroke-[2.5]" />
              Dicek tim
            </span>
          )}

          {/* Status overlay if not Tayang */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <StatusBadge status={item.status} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 gap-1.5 justify-between">
        <div className="space-y-1">
          {/* Brand & Views row */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#8a8a8a] uppercase tracking-wider">
              {item.brand}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-[#8a8a8a]">
              <Eye className="size-3" />
              {item.view_count || 0}
            </span>
          </div>

          {/* Model name — clamped to 2 lines with consistent min-height */}
          <h3 className="font-semibold text-xs sm:text-[15px] text-ink leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-yellow-600 transition-colors">
            {item.model}
          </h3>

          {/* Condition & completeness */}
          <p className="text-[11px] sm:text-[12px] text-[#8a8a8a] line-clamp-1">
            {item.condition} &bull; {item.completeness}
          </p>
        </div>

        {/* Pricing & Verification row */}
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
          <div>
            <span className="text-[9px] text-[#8a8a8a] uppercase font-semibold tracking-wider block leading-none">
              Harga Tayang
            </span>
            <p className="font-extrabold text-sm sm:text-[18px] text-ink leading-tight mt-0.5">
              Rp {displayPrice.toLocaleString("id-ID")}
            </p>
          </div>

          {/* Seller / Hinggo verified tag */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-[#4b4b4b] pt-0.5">
            <ShieldCheck className="size-3 sm:size-3.5 text-success shrink-0" />
            <span className="truncate">Dikelola Hinggo &bull; Jakarta</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
