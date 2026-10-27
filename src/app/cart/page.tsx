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
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart } = useHingoStore();
  const [selectAll, setSelectAll] = useState(true);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const itemPrice = cart.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );
  const shippingCost = cart.length > 0 ? 18000 : 0;
  const shippingProtection = cart.length > 0 ? 5000 : 0;
  const serviceFee = cart.length > 0 ? 2500 : 0;
  const totalAmount =
    itemPrice > 0
      ? itemPrice + shippingCost + shippingProtection + serviceFee
      : 0;

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
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded-md accent-[#FFC629]"
                />
                <span>Pilih semua ({cart.length} barang)</span>
              </label>

              <button
                type="button"
                onClick={() => removeFromCart(cart[0].product.id)}
                className="text-xs font-semibold text-neutral-400 hover:text-red-600 transition"
              >
                Hapus
              </button>
            </div>

            {/* Cart item cards */}
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4"
              >
                {/* Store origin badge */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={() => setSelectAll(!selectAll)}
                      className="h-4 w-4 rounded-md accent-[#FFC629]"
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

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base sm:text-lg font-black text-[#1A1A1A]">
                        {formatRupiah(item.product.price)}
                      </span>

                      {/* Stepper (disabled because preloved stock is 1) */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl bg-[#F6F6F4] border border-neutral-200 p-1">
                          <button
                            type="button"
                            disabled
                            className="h-7 w-7 rounded-lg text-neutral-400 opacity-50 cursor-not-allowed font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-[#1A1A1A]">
                            1
                          </span>
                          <button
                            type="button"
                            disabled
                            className="h-7 w-7 rounded-lg text-neutral-400 opacity-50 cursor-not-allowed font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-red-500 transition"
                          title="Hapus barang"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
            ))}

            {/* Trust box & continue shopping */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#F6F6F4] p-4 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Semua barang dikemas dengan proteksi kardus & bubble wrap tebal</span>
              </div>
              <Link
                href="/catalog"
                className="flex items-center gap-1 font-bold text-neutral-800 hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Lanjut jelajahi barang
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
                  <span>Harga barang ({cart.length})</span>
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
                onClick={() => router.push("/checkout")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
              >
                <span>Lanjut checkout ({cart.length})</span>
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
        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-base font-bold text-neutral-700">
            Keranjangmu masih kosong.
          </p>
          <Link
            href="/catalog"
            className="rounded-xl bg-[#FFC629] px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-xs"
          >
            Mulai Belanja Gear Preloved
          </Link>
        </div>
      )}
    </div>
  );
}
