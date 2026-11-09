"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    toggleCartItemSelection,
    toggleSelectAllCart,
    clearCart,
  } = useHingoStore();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
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
    if (confirm("Hapus semua barang yang dipilih dari keranjang?")) {
      selectedItems.forEach((item) => {
        removeFromCart(item.id || item.product.id);
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
          BELANJA / KERANJANG
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
          Keranjangmu
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Satu temuan bagus, siap jadi milikmu.
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart items */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Select-all bar */}
            <div className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-xs">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAllToggle}
                  className="h-4 w-4 rounded-md accent-[#FFC629] cursor-pointer"
                />
                <span>Pilih semua ({cart.length} barang)</span>
              </label>

              <button
                type="button"
                onClick={handleDeleteSelected}
                className="text-xs font-semibold text-neutral-400 hover:text-red-600 transition cursor-pointer"
              >
                Hapus ({selectedItems.length})
              </button>
            </div>

            {/* Cart item cards */}
            {cart.map((item) => {
              const isSelected = item.selected !== false;
              const itemId = item.id || item.product.id;

              return (
                <div
                  key={itemId}
                  className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4"
                >
                  {/* Store origin badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCartItemSelection(itemId, !isSelected)}
                        className="h-4 w-4 rounded-md accent-[#FFC629] cursor-pointer"
                      />
                      <StatusBadge
                        label="Dikelola Hingo · Jakarta Selatan"
                        variant="verified"
                        size="sm"
                      />
                    </div>
                    <span className="text-neutral-400 font-medium">Stok Preloved: 1 unit</span>
                  </div>

                  <div className="flex gap-4 sm:gap-6">
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-20 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {item.product.brand}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {item.product.condition} · {item.product.switchOrVariant}
                        </p>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <span className="text-base sm:text-lg font-black text-[#1A1A1A]">
                          {formatRupiah(item.product.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Baris bawah: Stepper [- 1 +] di kiri dan Hapus barang di kanan sesuai Figma */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div className="flex items-center rounded-xl bg-[#F6F6F4] border border-neutral-200 px-2 py-1">
                      <span className="text-neutral-400 font-bold px-1.5 text-xs">−</span>
                      <span className="px-2 text-xs font-bold text-[#1A1A1A]">1</span>
                      <span className="text-neutral-400 font-bold px-1.5 text-xs">+</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(itemId)}
                      className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus barang</span>
                    </button>
                  </div>

                  {/* Preloved notice */}
                  <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 flex items-center gap-2 text-xs text-amber-900">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                    <span>
                      Barang preloved hanya tersedia <strong>1 unit</strong>. Selesaikan checkout
                      sebelum dibeli antusias lain.
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Kartu: Dicek dan dikirim tim kami (Sesuai Figma) */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs text-amber-950 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-800 shrink-0" />
                <strong className="font-black text-amber-950">Dicek dan dikirim tim kami</strong>
              </div>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                Setiap barang dikemas dengan proteksi kardus & bubble wrap tebal setelah lolos uji laboratorium teknisi.
              </p>
            </div>

            {/* Tombol: Lanjut jelajahi barang */}
            <div className="flex justify-start">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 font-bold text-xs sm:text-sm text-neutral-800 hover:underline p-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Lanjut jelajahi barang</span>
              </Link>
            </div>
          </div>

          {/* Right Sidebar: Ringkasan Pembayaran */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
              <h2 className="text-base font-black text-[#1A1A1A]">
                Ringkasan pembayaran
              </h2>

              <div className="flex flex-col gap-2.5 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
                <div className="flex justify-between">
                  <span>Harga barang ({selectedItems.length})</span>
                  <span className="font-semibold text-neutral-900">
                    {formatRupiah(itemPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir JNE REG</span>
                  <span className="font-semibold text-neutral-900">
                    {formatRupiah(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Perlindungan pengiriman</span>
                  <span className="font-semibold text-neutral-900">
                    {formatRupiah(shippingProtection)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya layanan</span>
                  <span className="font-semibold text-neutral-900">
                    {formatRupiah(serviceFee)}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#1A1A1A]">Total pembayaran</span>
                <span className="text-xl font-black text-[#1A1A1A]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={() => router.push("/checkout")}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-xs transition active:scale-[0.99] cursor-pointer ${
                  selectedItems.length > 0
                    ? "bg-[#FFC629] hover:bg-[#FFC420] text-[#1A1A1A]"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <span>Lanjut checkout ({selectedItems.length})</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rounded-xl bg-[#FFFBEB] p-3 text-[11px] text-neutral-600 leading-relaxed text-center">
                🛡️ Dana disimpan di <strong>rekening bersama Hingo</strong> sampai paket
                kamu periksa.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-black text-[#1A1A1A]">
            Keranjangmu masih kosong
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm">
            Temukan keyboard mekanikal, mouse gaming, headset, atau monitor terverifikasi di katalog Hingo.
          </p>
          <Link
            href="/catalog"
            className="mt-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-xs transition"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}
