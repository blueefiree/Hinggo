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
  const { user, activeAddress, cart, clearCart, refreshOrders, showToast } = useHingoStore();

  const [selectedCourier, setSelectedCourier] = useState<"jne" | "jnt">("jne");
  const [shippingProtection, setShippingProtection] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<"bca_va" | "qris">("bca_va");
  const [buyerNote, setBuyerNote] = useState<string>("Mohon bubble wrap tambahan, ya.");
  const [isPaying, setIsPaying] = useState(false);

  const selectedItems = cart.filter((c) => c.selected !== false);
  const targetProduct = selectedItems[0]?.product || cart[0]?.product;

  const itemPrice = targetProduct ? targetProduct.price : 0;
  const courierCost = selectedCourier === "jne" ? 18000 : 22000;
  const protectionCost = shippingProtection ? 5000 : 0;
  const serviceFee = 2500;
  const totalAmount = itemPrice > 0 ? itemPrice + courierCost + protectionCost + serviceFee : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePay = async () => {
    if (!targetProduct) {
      router.push("/cart");
      return;
    }

    setIsPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: targetProduct.id,
          addressId: activeAddress?.id,
          shippingCourier: selectedCourier === "jne" ? "JNE REG" : "J&T Reguler",
          shippingCost: courierCost,
          paymentMethod: paymentMethod === "bca_va" ? "BCA_VA" : "QRIS",
          buyerNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.orderCode) {
        await clearCart();
        await refreshOrders();
        showToast("Pesanan berhasil dibuat!");
        router.push(`/orders/${data.orderCode}`);
      } else {
        alert(data.error || "Gagal membuat pesanan");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan sistem saat checkout");
    } finally {
      setIsPaying(false);
    }
  };

  if (!targetProduct) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Tidak ada barang yang siap di-checkout</h2>
        <p className="text-neutral-500 mt-2 text-sm">Silakan pilih barang di keranjang belanja terlebih dahulu.</p>
        <Link
          href="/cart"
          className="mt-4 inline-block rounded-xl bg-[#FFC629] px-6 py-2.5 font-bold text-black"
        >
          Ke Keranjang
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-6 md:py-10 pb-16 md:pb-10">
      {/* Stepper Header */}
      <div className="flex flex-col gap-1 mb-4 sm:mb-8">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-neutral-400">
          <Link href="/cart" className="hover:text-black">
            KERANJANG
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#D97706] font-black">CHECKOUT</span>
          <ChevronRight className="h-3 w-3" />
          <span>PEMBAYARAN</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-[#1A1A1A]">
          Checkout aman
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Pesanan dikelola dan dilindungi rekening bersama resmi Hingo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column: Form & Selection cards */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-6">
          {/* Card 1: Alamat Pengiriman */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#E5E5E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D97706]" />
                <h2 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                  Alamat pengiriman
                </h2>
              </div>
              <Link
                href="/account"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Ubah Alamat
              </Link>
            </div>

            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-[#FDE68A]">
                  {activeAddress?.label || "Rumah · Utama"}
                </span>
                <strong className="text-neutral-900 text-xs sm:text-sm">
                  {activeAddress?.recipientName || user?.name || "Penerima"}
                </strong>
                <span className="text-neutral-500 text-[11px]">· {activeAddress?.phone || user?.phone || "-"}</span>
              </div>
              <p className="text-neutral-600 font-medium leading-relaxed mt-1">
                {activeAddress?.fullAddress || "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan"}
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
                src={targetProduct.images[0]}
                alt={targetProduct.name}
                className="h-16 w-16 rounded-xl object-cover border border-neutral-200"
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  {targetProduct.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {targetProduct.subtitle} · {targetProduct.condition}
                </p>
                <span className="text-sm font-black text-[#1A1A1A] mt-1 block">
                  {formatRupiah(targetProduct.price)} · 1 barang
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
                    Estimasi tiba 1–2 hari kerja
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
                    Estimasi tiba 2–3 hari kerja
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-medium text-neutral-400">
                  Antar langsung ke alamat
                </span>
              </div>
            </div>

            {/* Perlindungan pengiriman checkbox */}
            <label className="mt-2 flex items-start gap-3 rounded-2xl bg-[#F6F6F4] p-3.5 border border-neutral-200 cursor-pointer">
              <input
                type="checkbox"
                checked={shippingProtection}
                onChange={(e) => setShippingProtection(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-md accent-[#FFC629]"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A1A1A]">
                    Proteksi Kerusakan Pengiriman Hingo
                  </span>
                  <span className="font-bold text-neutral-800">Rp5.000</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Klaim ganti rugi 100% jika terjadi benturan atau kerusakan saat proses logistik.
                </p>
              </div>
            </label>
          </div>

          {/* Card 4: Metode Pembayaran */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Metode pembayaran resmi Hingo
            </h2>

            <div className="flex flex-col gap-2.5">
              <label
                onClick={() => setPaymentMethod("bca_va")}
                className={`flex items-center justify-between rounded-2xl p-4 border cursor-pointer transition ${
                  paymentMethod === "bca_va"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-200">
                    BCA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">
                      BCA Virtual Account (Otomatis)
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Verifikasi instan tanpa bukti transfer
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "bca_va"}
                  onChange={() => setPaymentMethod("bca_va")}
                  className="accent-[#FFC629]"
                />
              </label>

              <label
                onClick={() => setPaymentMethod("qris")}
                className={`flex items-center justify-between rounded-2xl p-4 border cursor-pointer transition ${
                  paymentMethod === "qris"
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-700 font-black text-xs border border-red-200">
                    QRIS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">
                      QRIS Semua Bank & E-Wallet
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Scan via GoPay, OVO, Dana, BCA Mobile, Livin
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "qris"}
                  onChange={() => setPaymentMethod("qris")}
                  className="accent-[#FFC629]"
                />
              </label>
            </div>

            {/* Box Peringatan Krem: Bayar hanya melalui Hingo sesuai Figma */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Bayar hanya melalui Hingo:</strong> Transaksi aman dengan verifikasi otomatis dan proteksi rekening bersama resmi Hingo.
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Ringkasan Total & Tombol Bayar */}
        <div className="lg:col-span-4 flex flex-col gap-5">
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
                <span>Ongkir ({selectedCourier.toUpperCase()})</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(courierCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Proteksi pengiriman</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(protectionCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya layanan escrow</span>
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

            {/* Tombol Kuning Lebar Penuh: Bayar Rp... */}
            <button
              type="button"
              disabled={isPaying}
              onClick={handlePay}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              <span>{isPaying ? "Memproses pesanan..." : `Bayar ${formatRupiah(totalAmount)}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Kartu: Dicek dan dikirim tim kami */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs text-amber-950 flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-800 shrink-0" />
                <strong className="font-black text-amber-950">Dicek dan dikirim tim kami</strong>
              </div>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                Barang pesanan telah lolos 12 poin inspeksi lab teknisi Hingo dan siap dikirim dengan proteksi kardus & bubble wrap tebal.
              </p>
            </div>

            {/* Kartu: Alur Pesanan (1, 2, 3) + Link Butuh Bantuan Chat CS */}
            <div className="rounded-2xl border border-neutral-200 bg-[#F6F6F4] p-4 text-xs text-neutral-700 flex flex-col gap-2.5">
              <span className="font-bold text-[#1A1A1A] text-xs">Alur pesanan aman:</span>
              <div className="flex flex-col gap-1.5 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">1</span>
                  <span>Pembayaran diverifikasi otomatis oleh Hingo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">2</span>
                  <span>Barang dikirim dari gudang resmi Hingo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">3</span>
                  <span>Konfirmasi terima barang & tes fungsi 48 jam</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[11px]">
                <span className="text-neutral-500">Butuh bantuan?</span>
                <Link href="/chat/support" className="font-bold text-amber-800 hover:underline">
                  Chat CS Hingo →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
