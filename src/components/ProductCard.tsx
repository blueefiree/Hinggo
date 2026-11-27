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
    <div className="group bg-white rounded-card border border-gray-200 overflow-hidden hover:shadow-hover hover:border-yellow-500/50 transition-all flex flex-col h-full">
      {/* Product Image & Badges */}
      <Link href={`/produk/${item.id}`} className="relative block aspect-4/3 bg-gray-100 overflow-hidden">
        <img
          src={mainPhoto}
          alt={`${item.brand} ${item.model}`}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category & Verified Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-ink text-white">
            {item.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-success text-white flex items-center gap-1 shadow-xs">
            <ShieldCheck className="size-3" />
            Lolos Uji
          </span>
        </div>

        {/* Status Overlay if not Tayang */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <StatusBadge status={item.status} size="lg" />
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Brand & Views */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-gray-700">{item.brand}</span>
            <span className="flex items-center gap-1 text-[11px]">
              <Eye className="size-3" />
              {item.view_count || 0} dilihat
            </span>
          </div>

          {/* Model Title */}
          <Link href={`/produk/${item.id}`}>
            <h3 className="font-bold text-ink text-sm sm:text-base line-clamp-2 group-hover:text-yellow-600 transition-colors">
              {item.model}
            </h3>
          </Link>

          {/* Condition & Completeness */}
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {item.condition} &bull; {item.completeness}
          </p>
        </div>

        {/* Pricing & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-medium">Harga Tayang</p>
            <p className="font-extrabold text-lg text-ink">
              Rp {displayPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <Link
            href={`/produk/${item.id}`}
            className="px-3.5 py-2 rounded-btn bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink text-xs font-bold shadow-xs transition-all"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
