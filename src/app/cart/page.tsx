"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Package,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    toggleCartItemSelection,
    toggleSelectAllCart,
  } = useHingoStore();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const allSelected = cart.length > 0 && cart.every((c) => c.selected !== false);
  const selectedItems = cart.filter((c) => c.selected !== false);

  const itemPrice = selectedItems.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const shippingCost = selectedItems.length > 0 ? 18000 : 0;
  const shippingProtection = selectedItems.length > 0 ? 5000 : 0;
  const serviceFee = selectedItems.length > 0 ? 2500 : 0;
  const totalAmount =
    itemPrice > 0
      ? itemPrice + shippingCost + shippingProtection + serviceFee
      : 0;

  const handleSelectAllToggle = () => {
    toggleSelectAllCart(!allSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm("Hapus barang yang dipilih dari keranjang?")) {
      selectedItems.forEach((item) => {
        removeFromCart(item.id || item.product.id);
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-32 md:pb-12">
      {/* 1. BREADCRUMB & HEADER SESUAI FIGMA node 10:25747 & 10:25867 */}
      <div className="flex flex-col gap-1 mb-5 sm:mb-8">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
          BELANJA / KERANJANG
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight">
          Keranjangmu
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Satu temuan bagus, siap jadi milikmu.
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* KOLOM KIRI (DAFTAR BARANG) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Bar Pilih Semua */}
            <div className="flex items-center justify-between rounded-2xl border border-[#EBEBEB] bg-white p-3.5 sm:p-4 shadow-xs">
              <label htmlFor="cart-select-all" className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A] cursor-pointer select-none">
                <input
                  id="cart-select-all"
                  name="selectAll"
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 rounded-md accent-[#FFC629] cursor-pointer"
                />
                <span>Pilih semua ({cart.length} barang)</span>
              </label>

              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="text-xs font-bold text-neutral-500 hover:text-red-600 transition cursor-pointer"
                >
                  Hapus ({selectedItems.length})
                </button>
              )}
            </div>

            {/* Daftar Kartu Barang */}
            {cart.map((item) => {
              const isSelected = item.selected !== false;
              const itemId = item.id || item.product.id;

              return (
                <div
                  key={itemId}
                  className="rounded-2xl sm:rounded-3xl border border-[#EBEBEB] bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3.5"
                >
                  {/* Origin Tag: Dikelola Hingo · kota */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        id={`cart-item-${itemId}`}
                        name={`cart-item-${itemId}`}
                        aria-label={`Pilih ${item.product.name}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCartItemSelection(itemId, !isSelected)}
                        className="h-4 w-4 rounded-md accent-[#FFC629] cursor-pointer"
                      />
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-[#1F9D55] border border-emerald-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#1F9D55]" />
                        Dikelola Hingo · {item.product.location || "Jakarta Selatan"}
                      </span>
                    </div>
                    <span className="text-neutral-400 font-bold text-[11px]">Stok 1 barang</span>
                  </div>

                  {/* Body: Foto + Info */}
                  <div className="flex gap-3.5 sm:gap-4 items-start">
                    {/* Foto */}
                    <div className="relative aspect-square w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-xl bg-[#F6F6F4] border border-[#EBEBEB]">
                      <img
                        src={item.product.images[0] || "/images/placeholder.png"}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Rincian Produk */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {item.product.brand}
                        </span>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="line-clamp-2 text-xs sm:text-sm font-bold text-[#1A1A1A] hover:text-[#D97706] transition leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                          {item.product.condition} · {item.product.switchOrVariant || item.product.subtitle}
                        </p>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-[#1A1A1A]">
                          {formatRupiah(item.product.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Baris Tombol: Stepper [- 1 +] & Tombol Hapus Barang */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-neutral-100">
                    <div className="flex items-center rounded-xl bg-[#F6F6F4] border border-neutral-200 px-2.5 py-1">
                      <span className="text-neutral-300 font-bold px-1.5 text-xs select-none">−</span>
                      <span className="px-2 text-xs font-black text-[#1A1A1A]">1</span>
                      <span className="text-neutral-300 font-bold px-1.5 text-xs select-none">+</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(itemId)}
                      className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-red-600 transition active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus barang</span>
                    </button>
                  </div>

                  {/* Catatan Preloved: Barang preloved hanya tersedia 1... */}
                  <div className="rounded-xl bg-[#FFFBEB] border border-[#FFE58A] p-2.5 flex items-center gap-2 text-xs text-amber-900 leading-snug">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                    <span className="text-[11px]">
                      Barang preloved hanya tersedia <strong>1 unit</strong>. Selesaikan checkout sebelum dibeli antusias lain.
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Kotak: Dicek dan dikirim tim kami */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] p-4 text-xs text-amber-950 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1F9D55] shrink-0" />
                <strong className="font-extrabold text-[#1A1A1A]">Dicek dan dikirim tim kami</strong>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Setiap barang dikemas dengan proteksi kardus & bubble wrap tebal setelah lolos uji laboratorium kurator Hingo.
              </p>
            </div>

            {/* Tombol: ← Lanjut jelajahi barang */}
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-neutral-800 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>← Lanjut jelajahi barang</span>
              </Link>
            </div>
          </div>

          {/* KOLOM KANAN: KARTU RINGKASAN PEMBAYARAN */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-7 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black text-[#1A1A1A]">
                Ringkasan pembayaran
              </h2>

              <div className="flex flex-col gap-2.5 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
                <div className="flex justify-between">
                  <span>Harga barang ({selectedItems.length})</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {formatRupiah(itemPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir (JNE REG)</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {formatRupiah(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Perlindungan pengiriman</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {formatRupiah(shippingProtection)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya layanan</span>
                  <span className="font-bold text-[#1A1A1A]">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Total pembayaran</span>
                <span className="text-xl font-black text-[#1A1A1A]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              {/* Tombol Kuning Lanjut Checkout */}
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => router.push("/checkout")}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black shadow-xs transition active:scale-[0.99] cursor-pointer ${
                  selectedItems.length > 0
                    ? "bg-[#FFC629] hover:bg-[#FFC420] text-[#1A1A1A]"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <span>Lanjut checkout ({selectedItems.length})</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Teks: Tidak ada biaya tersembunyi... */}
              <p className="text-[11px] text-neutral-500 leading-relaxed text-center">
                Tidak ada biaya tersembunyi. Dana disimpan di rekening bersama sampai barang kamu terima.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Keranjang Kosong Sesuai Figma */
        <div className="rounded-3xl border border-[#EBEBEB] bg-white p-12 sm:p-16 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-[#FFFBEB] border border-[#FFE58A] flex items-center justify-center text-amber-800 shadow-xs">
            <ShoppingBag className="h-8 w-8 text-[#FFC629]" />
          </div>
          <div className="max-w-md">
            <h2 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
              Keranjangmu masih kosong
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Temukan keyboard mekanikal, mouse gaming, headset, atau monitor terverifikasi di katalog Hingo.
            </p>
          </div>
          <Link
            href="/catalog"
            className="mt-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-6 py-3 text-xs sm:text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-95"
          >
            Mulai Belanja
          </Link>
        </div>
      )}

      {/* Sticky Bottom Action Bar Mobile (< 768px Sesuai Figma node 10:25867) */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-[#EBEBEB] px-4 py-2.5 pb-3 backdrop-blur-md shadow-2xl flex items-center justify-between safe-area-bottom">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 font-medium">Total ({selectedItems.length} barang)</span>
            <span className="text-base font-black text-[#1A1A1A]">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={() => router.push("/checkout")}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-black shadow-xs transition active:scale-95 cursor-pointer ${
              selectedItems.length > 0
                ? "bg-[#FFC629] text-[#1A1A1A] hover:bg-[#FFC420]"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            <span>Checkout ({selectedItems.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
