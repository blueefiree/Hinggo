"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Check,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function PaymentInstructionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { orders, simulatePaymentSuccess, refreshOrders } = useHingoStore();

  const orderId = (params?.orderId as string) || "GRL-20261022-0842";
  const [currentOrder, setCurrentOrder] = useState<any>(
    orders.find((o) => o.orderCode === orderId || o.id === orderId) || null
  );

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setCurrentOrder(data.order);
          }
        }
      } catch (e) {
        console.error("Failed to load order:", e);
      }
    }
    fetchOrder();
  }, [orderId]);

  const methodParam = searchParams.get("method") || "bca_va";
  const [selectedMethod, setSelectedMethod] = useState<"bca_va" | "qris">(
    methodParam === "qris" ? "qris" : "bca_va"
  );

  const [copiedVA, setCopiedVA] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<"mbca" | "klikbca" | "atm">("mbca");
  const [isProcessingSimulation, setIsProcessingSimulation] = useState(false);

  // 24 Hour Countdown Timer state
  const [timeLeft, setTimeLeft] = useState(23 * 3600 + 59 * 60 + 48); // 23h 59m 48s

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const bcaVaNumber = "8801 0812 3456 7890";
  const totalBill = currentOrder?.totalAmount || 875500;

  const copyVA = () => {
    navigator.clipboard.writeText("8801081234567890");
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const copyBill = () => {
    navigator.clipboard.writeText(totalBill.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSimulatePaid = async () => {
    setIsProcessingSimulation(true);
    try {
      await fetch(`/api/orders/${currentOrder?.id || orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SIMULATE_PAYMENT" }),
      });
      simulatePaymentSuccess(orderId);
      await refreshOrders();
      router.push(`/orders/${currentOrder?.orderCode || orderId}?status=paid_success`);
    } catch (e) {
      console.error(e);
      router.push(`/orders/${currentOrder?.orderCode || orderId}?status=paid_success`);
    } finally {
      setIsProcessingSimulation(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
        <Link href="/checkout" className="hover:text-black">
          CHECKOUT
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-bold">INSTRUKSI PEMBAYARAN</span>
        <span>/</span>
        <span className="font-mono text-neutral-500">{orderId}</span>
      </div>

      {/* Countdown Warning Banner */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFC629] text-black">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">
              Selesaikan Pembayaran Sebelum Waktu Habis
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pesanan otomatis dibatalkan jika belum dibayar dalam 24 jam.
            </p>
          </div>
        </div>

        {/* Live Timer Pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-2xl bg-white border border-[#FDE68A] px-4 py-2 font-mono text-base font-black text-amber-900 shadow-xs">
          <span>{String(hours).padStart(2, "0")}</span>
          <span className="text-neutral-400">:</span>
          <span>{String(minutes).padStart(2, "0")}</span>
          <span className="text-neutral-400">:</span>
          <span className="text-red-600">{String(seconds).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Payment Details */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Method Switcher Tabs */}
          <div className="flex items-center rounded-2xl bg-[#F6F6F4] p-1.5 border border-neutral-200">
            <button
              type="button"
              onClick={() => setSelectedMethod("bca_va")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedMethod === "bca_va"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <CreditCard className="h-4 w-4 text-amber-600" />
              <span>BCA Virtual Account</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("qris")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                selectedMethod === "qris"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              <QrCode className="h-4 w-4 text-amber-600" />
              <span>QRIS Instant</span>
            </button>
          </div>

          {selectedMethod === "bca_va" ? (
            /* BCA VA Card */
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-blue-700 text-white font-black text-xs tracking-wider">
                    BCA
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-800">
                      BCA Virtual Account Hingo
                    </h3>
                    <span className="text-[10px] text-neutral-400">Verifikasi Otomatis 24 Jam</span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                  Online
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Nomor Virtual Account
                </span>
                <div className="flex items-center justify-between rounded-2xl bg-[#F6F6F4] p-3.5 border border-neutral-200">
                  <span className="font-mono text-lg font-black text-[#1A1A1A] tracking-wider">
                    {bcaVaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyVA}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition active:scale-95"
                  >
                    {copiedVA ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Total Tagihan Pembayaran
                </span>
                <div className="flex items-center justify-between rounded-2xl bg-[#FFFBEB] p-3.5 border border-[#FDE68A]">
                  <span className="text-xl font-black text-amber-950">
                    {formatRupiah(totalBill)}
                  </span>
                  <button
                    type="button"
                    onClick={copyBill}
                    className="flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-[#FEF3C7] transition active:scale-95"
                  >
                    {copiedAmount ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Jumlah</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  *Transfer tepat hingga nominal rupiah terakhir agar transaksi diverifikasi secara instan.
                </p>
              </div>
            </div>
          ) : (
            /* QRIS Card */
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col items-center gap-5 text-center">
              <div className="flex items-center justify-between w-full pb-3 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-800">QRIS Standar Nasional</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                  BCA, GoPay, OVO, ShopeePay
                </span>
              </div>

              {/* QR Code Container */}
              <div className="rounded-3xl border-2 border-neutral-900 p-4 bg-white shadow-md flex flex-col items-center">
                <div className="w-56 h-56 bg-neutral-950 rounded-2xl p-3 flex flex-col items-center justify-center text-white relative">
                  {/* Stylized QR Code Mock */}
                  <div className="grid grid-cols-6 gap-2 w-full h-full p-2 bg-white rounded-xl">
                    <div className="col-span-2 row-span-2 bg-black rounded-sm p-1">
                      <div className="w-full h-full bg-white rounded-xs p-1">
                        <div className="w-full h-full bg-black rounded-xs" />
                      </div>
                    </div>
                    <div className="col-span-2 bg-black/80 rounded-xs" />
                    <div className="col-span-2 row-span-2 bg-black rounded-sm p-1">
                      <div className="w-full h-full bg-white rounded-xs p-1">
                        <div className="w-full h-full bg-black rounded-xs" />
                      </div>
                    </div>
                    <div className="col-span-2 bg-black/60 rounded-xs" />
                    <div className="col-span-6 flex items-center justify-center font-black text-black text-xs font-mono tracking-widest">
                      HINGO · ESCROW
                    </div>
                    <div className="col-span-2 row-span-2 bg-black rounded-sm p-1">
                      <div className="w-full h-full bg-white rounded-xs p-1">
                        <div className="w-full h-full bg-black rounded-xs" />
                      </div>
                    </div>
                    <div className="col-span-4 bg-black/70 rounded-xs" />
                    <div className="col-span-4 bg-black/90 rounded-xs" />
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-600 mt-2 font-mono">
                  NMID: ID1020261022880
                </span>
              </div>

              <div className="text-xs text-neutral-600">
                Pindai kode QRIS di atas dengan aplikasi mobile banking BCA, Mandiri, GoPay, OVO,
                atau ShopeePay kamu.
              </div>
            </div>
          )}

          {/* Transfer Instructions Accordion */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#1A1A1A]">
              Panduan Cara Pembayaran
            </h3>

            {/* m-BCA */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "mbca" ? "atm" : "mbca")}
                className="w-full p-4 text-left font-bold text-xs flex items-center justify-between bg-[#F6F6F4] hover:bg-neutral-100"
              >
                <span>Petunjuk Transfer m-BCA (BCA Mobile)</span>
                {activeAccordion === "mbca" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeAccordion === "mbca" && (
                <div className="p-4 text-xs text-neutral-600 flex flex-col gap-2 bg-white">
                  <p>1. Buka aplikasi <strong>BCA mobile</strong>, pilih menu <strong>m-Transfer</strong>.</p>
                  <p>2. Pilih <strong>BCA Virtual Account</strong>.</p>
                  <p>3. Masukkan nomor VA: <strong>{bcaVaNumber}</strong> lalu tekan Kirim.</p>
                  <p>4. Konfirmasi nama penerima: <strong>Hingo Escrow Rekening Bersama</strong> dan total <strong>{formatRupiah(totalBill)}</strong>.</p>
                  <p>5. Masukkan PIN BCA mobile kamu. Transaksi selesai!</p>
                </div>
              )}
            </div>

            {/* KlikBCA */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "klikbca" ? "mbca" : "klikbca")}
                className="w-full p-4 text-left font-bold text-xs flex items-center justify-between bg-[#F6F6F4] hover:bg-neutral-100"
              >
                <span>Petunjuk Transfer KlikBCA (Internet Banking)</span>
                {activeAccordion === "klikbca" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeAccordion === "klikbca" && (
                <div className="p-4 text-xs text-neutral-600 flex flex-col gap-2 bg-white">
                  <p>1. Login ke <strong>KlikBCA Individual</strong>.</p>
                  <p>2. Pilih menu <strong>Transfer Dana</strong> → <strong>Transfer ke BCA Virtual Account</strong>.</p>
                  <p>3. Masukkan nomor VA <strong>8801081234567890</strong>.</p>
                  <p>4. Validasi respon KeyBCA Appli 1 dan selesaikan pembayaran.</p>
                </div>
              )}
            </div>

            {/* ATM BCA */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "atm" ? "mbca" : "atm")}
                className="w-full p-4 text-left font-bold text-xs flex items-center justify-between bg-[#F6F6F4] hover:bg-neutral-100"
              >
                <span>Petunjuk Transfer ATM BCA</span>
                {activeAccordion === "atm" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {activeAccordion === "atm" && (
                <div className="p-4 text-xs text-neutral-600 flex flex-col gap-2 bg-white">
                  <p>1. Masukkan kartu ATM dan PIN BCA kamu.</p>
                  <p>2. Pilih menu <strong>Transaksi Lainnya</strong> → <strong>Transfer</strong> → <strong>ke Rekening BCA Virtual Account</strong>.</p>
                  <p>3. Masukkan nomor VA <strong>8801081234567890</strong> dan konfirmasi nominal pembayaran.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Simulation Button */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Summary Box */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Ringkasan Pesanan
            </h3>

            {/* Item Card */}
            <div className="flex items-center gap-3">
              <img
                src={currentOrder?.product?.images?.[0] || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop"}
                alt={currentOrder?.product?.name || "Keychron K2 V2"}
                className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1">
                  {currentOrder?.product?.name || "Keychron K2 V2"}
                </h4>
                <p className="text-[11px] text-neutral-500">
                  {currentOrder?.product?.switchOrVariant || "Brown switch · Sangat baik"}
                </p>
                <span className="text-xs font-black text-[#1A1A1A] block mt-1">
                  {formatRupiah(currentOrder?.itemPrice || 850000)}
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Harga barang (1 item)</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(currentOrder?.itemPrice || 850000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir ({currentOrder?.shippingCourier || "JNE REG"})</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(currentOrder?.shippingCost || 18000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Perlindungan pengiriman</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(currentOrder?.shippingProtection || 5000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya layanan Hingo</span>
                <span className="font-semibold text-neutral-900">
                  {formatRupiah(currentOrder?.serviceFee || 2500)}
                </span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-3 flex items-baseline justify-between">
              <span className="text-xs font-bold text-neutral-800">Total Tagihan</span>
              <span className="text-xl font-black text-[#1A1A1A]">
                {formatRupiah(totalBill)}
              </span>
            </div>

            {/* Interactive Demo Simulation Action Button */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={isProcessingSimulation}
                onClick={handleSimulatePaid}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-xs sm:text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer"
              >
                {isProcessingSimulation ? (
                  <span>Memverifikasi Pembayaran...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Simulasikan Pembayaran Lunas</span>
                  </>
                )}
              </button>

              <Link
                href={`/orders/${currentOrder?.orderCode || orderId}`}
                className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Cek Status Pesanan Nanti
              </Link>
            </div>
          </div>

          {/* Escrow Trust Card */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              <span>Rekening Bersama Hingo Terlindungi</span>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Uangmu tidak langsung dikirim ke penjual. Dana disimpan aman di rekening bersama Hingo
              sampai paket tiba dan kamu memeriksa switch serta kelengkapan gear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
