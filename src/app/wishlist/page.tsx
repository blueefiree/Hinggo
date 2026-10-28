"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, showToast } = useHingoStore();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            SIMPANAN SAYA
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Gear Impian (Wishlist)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Daftar peripheral preloved terverifikasi yang kamu tandai. Ingat, setiap gear preloved stoknya hanya 1 unit!
          </p>
        </div>

        <Link
          href="/catalog"
          className="flex items-center gap-2 rounded-xl bg-[#F6F6F4] hover:bg-neutral-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 transition self-start sm:self-auto border border-neutral-300"
        >
          <span>Lanjut Belanja</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-3xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-[#1A1A1A]">
            Wishlist kamu masih kosong
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm">
            Temukan keyboard, mouse, headset, atau monitor idaman di katalog Hingo dan klik ikon hati untuk menyimpannya di sini.
          </p>
          <Link
            href="/catalog"
            className="mt-3 px-6 py-3 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition"
          >
            Jelajah Katalog Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[#E5E5E5] bg-white p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-neutral-300 transition"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-neutral-100 mb-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                      {item.condition}
                    </span>
                    <span className="rounded-full bg-black/70 text-white px-2 py-0.5 text-[9px] font-semibold">
                      Stok 1 Unit
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 text-red-600 flex items-center justify-center hover:bg-white transition shadow-xs cursor-pointer"
                    title="Hapus dari Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Info */}
                <Link href={`/product/${item.slug}`} className="group">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                    {item.brand} · {item.code}
                  </span>
                  <h3 className="text-sm font-extrabold text-[#1A1A1A] group-hover:text-amber-800 transition line-clamp-1 mt-0.5">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </p>
                </Link>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-black text-[#1A1A1A]">
                    {formatRupiah(item.price)}
                  </span>
                  <span className="text-xs text-neutral-400 line-through">
                    {formatRupiah(item.originalNewPrice)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await addToCart(item);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Tambah Keranjang</span>
                </button>
                <Link
                  href={`/product/${item.slug}`}
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition"
                >
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
