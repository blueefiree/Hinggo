"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  ArrowRight,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, order } = useHingoStore();

  const [selectedCourier, setSelectedCourier] = useState<"jne" | "jnt">("jne");
  const [shippingProtection, setShippingProtection] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<"bca_va" | "qris">("bca_va");
  const [buyerNote, setBuyerNote] = useState<string>("Mohon bubble wrap tambahan, ya.");

  const itemPrice = 850000;
  const courierCost = selectedCourier === "jne" ? 18000 : 22000;
  const protectionCost = shippingProtection ? 5000 : 0;
  const serviceFee = 2500;
  const totalAmount = itemPrice + courierCost + protectionCost + serviceFee;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePay = () => {
    router.push("/orders/GRL-20261022-0842");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Stepper Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
          <Link href="/cart" className="hover:text-black">
            KERANJANG
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#FFC629] font-black">CHECKOUT</span>
          <ChevronRight className="h-3 w-3" />
          <span>PEMBAYARAN</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
          Checkout aman
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Pesanan dikelola dan dilindungi rekening bersama resmi Hingo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Selection cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Alamat Pengiriman */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  Alamat pengiriman
                </h2>
              </div>
              <button
                type="button"
                onClick={() => alert("Ubah alamat aktif")}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Ubah
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-neutral-700">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#FFFBEB] border border-[#FDE68A] px-2 py-0.5 text-[11px] font-bold text-amber-900">
                  Rumah · Utama
                </span>
                <strong className="text-neutral-900 text-sm">
                  {user.address.recipientName}
                </strong>
                <span className="text-neutral-500">· {user.address.phone}</span>
              </div>
              <p className="text-neutral-600 font-medium leading-relaxed mt-1">
                {user.address.fullAddress}
              </p>
            </div>
          </div>

          {/* Card 2: Barang Pesanan */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Barang pesanan (1)
            </h2>

            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop"
                alt="Keychron K2 V2"
                className="h-16 w-16 rounded-xl object-cover border border-neutral-200"
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Keychron K2 V2
                </h3>
                <p className="text-xs text-neutral-500">
                  Wireless mechanical keyboard · Brown switch · Berat 1 kg
                </p>
                <span className="text-sm font-black text-[#1A1A1A] mt-1 block">
                  Rp850.000 · 1 barang
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Catatan untuk tim Hingo (opsional)
              </label>
              <input
                type="text"
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                placeholder="Contoh: Mohon bubble wrap ekstra tebal"
                className="w-full rounded-xl border border-neutral-200 bg-[#F6F6F4] px-3.5 py-2 text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
              />
            </div>
          </div>

          {/* Card 3: Pengiriman */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Pilihan kurir pengiriman
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedCourier("jne")}
                className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col justify-between ${
                  selectedCourier === "jne"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">JNE REG</span>
                    <span className="text-xs font-black text-[#1A1A1A]">Rp18.000</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Estimasi tiba 24–25 Okt 2026
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-bold text-[#16A34A]">
                  ✓ Direkomendasikan
                </span>
              </div>

              <div
                onClick={() => setSelectedCourier("jnt")}
                className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col justify-between ${
                  selectedCourier === "jnt"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">J&T Reguler</span>
                    <span className="text-xs font-black text-[#1A1A1A]">Rp22.000</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Estimasi tiba 24–26 Okt 2026
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-medium text-neutral-400">
                  Antar langsung ke alamat
                </span>
              </div>
            </div>

            {/* Toggle perlindungan */}
            <label className="flex items-center justify-between rounded-xl bg-[#F6F6F4] p-3 text-xs cursor-pointer border border-neutral-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shippingProtection}
                  onChange={(e) => setShippingProtection(e.target.checked)}
                  className="h-4 w-4 rounded-md accent-[#FFC629]"
                />
                <div>
                  <strong className="text-[#1A1A1A] block">
                    Perlindungan pengiriman (Rp5.000)
                  </strong>
                  <span className="text-[11px] text-neutral-500">
                    Ganti rugi 100% jika paket hilang atau rusak saat perjalanan
                  </span>
                </div>
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            </label>
          </div>

          {/* Card 4: Metode Pembayaran */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Metode pembayaran resmi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setPaymentMethod("bca_va")}
                className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col justify-between ${
                  paymentMethod === "bca_va"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-xs">
                    BCA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">
                      BCA Virtual Account
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Verifikasi otomatis 24 jam
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod("qris")}
                className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col justify-between ${
                  paymentMethod === "qris"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">QRIS Instan</h4>
                    <p className="text-[11px] text-neutral-500">
                      GoPay, OVO, ShopeePay, BCA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official payment warning */}
            <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 flex items-center gap-2 text-xs text-amber-900">
              <Info className="h-4 w-4 shrink-0 text-amber-700" />
              <span>
                <strong>Bayar hanya melalui Hingo:</strong> Transaksi di luar sistem resmi tidak
                dilindungi garansi rekening bersama.
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Ringkasan & Alur Pesanan */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="sticky top-28 rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <h2 className="text-base font-black text-[#1A1A1A]">
              Ringkasan pembayaran
            </h2>

            <div className="flex flex-col gap-2.5 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
              <div className="flex justify-between">
                <span>Harga barang</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(itemPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir {selectedCourier === "jne" ? "JNE REG" : "J&T Reguler"}</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(courierCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Perlindungan pengiriman</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(protectionCost)}
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
              <span className="text-2xl font-black text-[#1A1A1A]">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePay}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
            >
              <span>Bayar {formatRupiah(totalAmount)}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Alur Pesanan */}
            <div className="border-t border-neutral-100 pt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                Alur pesanan terjamin
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-neutral-600">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFC629] text-[9px] font-black text-black">
                    1
                  </span>
                  <span>Bayar pesanan resmi melalui Hingo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[9px] font-bold text-neutral-700">
                    2
                  </span>
                  <span>Tim Hingo kemas rapi dan kirim dengan bubble wrap</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[9px] font-bold text-neutral-700">
                    3
                  </span>
                  <span>Paket tiba, kamu cek barang lalu konfirmasi terima</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
