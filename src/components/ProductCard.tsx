"use client";

import Link from "next/link";
import { Item } from "@/types";
import { ShieldCheck, Eye, ArrowRight } from "lucide-react";
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
    <div className="group bg-white rounded-[16px] border border-gray-200 hover:border-yellow-500/60 hover:shadow-card transition-all duration-200 flex flex-col h-full overflow-hidden p-2.5 sm:p-3 relative">
      {/* Product Image Container with strict uniform height */}
      <div className="h-36 sm:h-48 w-full rounded-[10px] sm:rounded-[12px] bg-yellow-50/50 relative overflow-hidden shrink-0">
        <Link href={`/produk/${item.id}`} className="block size-full">
          <img
            src={mainPhoto}
            alt={`${item.brand} ${item.model}`}
            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/95 backdrop-blur-xs text-success border border-success/20 flex items-center gap-1 shadow-xs">
            <ShieldCheck className="size-3" />
            <span className="hidden xs:inline">Lolos Uji</span>
            <span className="xs:hidden">Uji OK</span>
          </span>
        </div>

        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ink/80 backdrop-blur-xs text-white uppercase tracking-wider">
            {item.category}
          </span>
        </div>

        {/* Status Overlay if not Tayang */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <StatusBadge status={item.status} size="sm" />
          </div>
        )}
      </div>

      {/* Card Content without huge gaps */}
      <div className="pt-2.5 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          {/* Brand & Views */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
            <span className="font-bold uppercase tracking-wider text-yellow-600">{item.brand}</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Eye className="size-3" />
              {item.view_count || 0}
            </span>
          </div>

          {/* Model Title - clamped to exactly 2 lines with consistent min-height */}
          <Link href={`/produk/${item.id}`} className="block">
            <h3 className="font-bold text-ink text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-yellow-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
              {item.model}
            </h3>
          </Link>

          {/* Condition & Completeness */}
          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
            {item.condition} &bull; {item.completeness}
          </p>
        </div>

        {/* Pricing & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 mt-auto">
          <div className="min-w-0">
            <span className="text-[9px] text-gray-400 uppercase font-semibold block leading-none">Harga Tayang</span>
            <p className="font-black text-sm sm:text-base text-ink truncate mt-0.5">
              Rp {displayPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <Link
            href={`/produk/${item.id}`}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-btn bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink text-[11px] sm:text-xs font-bold shadow-xs shrink-0 transition-transform flex items-center gap-1"
          >
            <span>Lihat</span>
            <span className="hidden sm:inline">Detail</span>
            <ArrowRight className="size-3 sm:hidden" />
          </Link>
        </div>
      </div>
    </div>
  );
}
