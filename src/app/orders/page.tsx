"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function BuyerOrdersPage() {
  const { orders } = useHingoStore();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const tabs = [
    { id: "ALL", label: "Semua", count: orders.length },
    {
      id: "AWAITING_PAYMENT",
      label: "Menunggu Bayar",
      count: orders.filter((o) => (o.orderStatus as string) === "AWAITING_PAYMENT" || (o.orderStatus as string) === "WAITING_PAYMENT").length,
    },
    {
      id: "SHIPPED",
      label: "Sedang Dikirim",
      count: orders.filter((o) => o.orderStatus === "SHIPPED").length,
    },
    {
      id: "DELIVERED_CHECKING",
      label: "Tiba — Perlu Dicek",
      count: orders.filter((o) => o.orderStatus === "DELIVERED_CHECKING").length,
    },
    {
      id: "COMPLETED",
      label: "Selesai",
      count: orders.filter((o) => o.orderStatus === "COMPLETED").length,
    },
    {
      id: "DISPUTED",
      label: "Kendala",
      count: orders.filter((o) => o.orderStatus === "ISSUE_REPORTED").length,
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Text search
      if (
        searchQuery &&
        !o.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !o.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (activeTab === "ALL") return true;
      if (activeTab === "AWAITING_PAYMENT") return (o.orderStatus as string) === "AWAITING_PAYMENT" || (o.orderStatus as string) === "WAITING_PAYMENT";
      if (activeTab === "SHIPPED") return o.orderStatus === "SHIPPED";
      if (activeTab === "DELIVERED_CHECKING") return o.orderStatus === "DELIVERED_CHECKING";
      if (activeTab === "COMPLETED") return o.orderStatus === "COMPLETED";
      if (activeTab === "DISPUTED") return o.orderStatus === "ISSUE_REPORTED";
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            TRANSAKSI PEMBELI
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Daftar Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Pantau status pembayaran, pelacakan kurir, pengujian fisik gear, dan escrow Hingo.
          </p>
        </div>

        <Link
          href="/catalog"
          className="flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition self-start sm:self-auto"
        >
          <span>Jelajah Katalog Gear</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Escrow Guarantee Pill Card */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 mb-8 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] text-black">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs text-neutral-800">
            <strong className="text-black font-bold block">
              Perlindungan Rekening Bersama Hingo
            </strong>
            Dana belanjaanmu ditahan aman sampai barang tiba dan kamu selesai menguji fungsi unit.
          </div>
        </div>
        <Link
          href="/how-it-works"
          className="text-xs font-bold text-amber-900 hover:underline shrink-0 hidden sm:inline"
        >
          Pelajari Sistem Escrow →
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Horizontal Scrolling Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === t.id
                    ? "bg-[#FFC629] text-black"
                    : "bg-white text-neutral-500"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor pesanan / gear..."
            className="w-full rounded-full bg-[#F6F6F4] py-2 pl-9 pr-4 text-xs text-[#1A1A1A] outline-none border border-neutral-200 focus:border-[#FFC629] focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-3xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-[#1A1A1A]">
            {orders.length === 0 ? "Belum ada pesanan aktif" : "Tidak ada transaksi pada filter ini"}
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            {orders.length === 0
              ? "Semua gear preloved yang kamu beli melalui rekening bersama Hingo akan tampil di sini."
              : "Coba ganti filter status pesanan atau kata kunci pencarianmu."}
          </p>
          {orders.length === 0 ? (
            <Link
              href="/catalog"
              className="mt-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-6 py-2.5 text-xs font-bold text-black transition"
            >
              Mulai Belanja di Katalog
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
              className="mt-2 text-xs font-bold text-amber-800 hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((ord) => {
            const isCompleted = ord.orderStatus === "COMPLETED";
            const isDeliveredChecking = ord.orderStatus === "DELIVERED_CHECKING";
            const isDisputed = ord.orderStatus === "ISSUE_REPORTED";
            const isAwaitingPay = ord.orderStatus === "AWAITING_PAYMENT";

            return (
              <div
                key={ord.id}
                className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4 hover:border-neutral-300 transition"
              >
                {/* Order Top Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#1A1A1A]">
                      {ord.orderCode}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">{ord.createdAt}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="rounded-full bg-[#FFFBEB] text-amber-900 border border-[#FDE68A] px-2 py-0.5 text-[10px] font-bold">
                      Dikelola Hingo
                    </span>
                  </div>

                  <StatusBadge
                    label={
                      isCompleted
                        ? "Selesai"
                        : isDisputed
                        ? "Kendala Ditinjau"
                        : isDeliveredChecking
                        ? "Paket Tiba — Perlu Dicek"
                        : isAwaitingPay
                        ? "Menunggu Pembayaran"
                        : "Sedang Dikirim"
                    }
                    variant={
                      isCompleted
                        ? "verified"
                        : isDisputed || isDeliveredChecking || isAwaitingPay
                        ? "warning"
                        : "neutral"
                    }
                    size="sm"
                  />
                </div>

                {/* Product Detail Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={ord.product?.images?.[0] || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop"}
                      alt={ord.product?.name || "Product"}
                      className="h-16 w-16 rounded-2xl object-cover border border-neutral-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                        {ord.product?.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {ord.product?.switchOrVariant} · {ord.product?.condition}
                      </p>
                      <span className="text-xs font-semibold text-neutral-600 block mt-1">
                        1 barang × {formatRupiah(ord.itemPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                    <span className="text-[11px] text-neutral-400">Total Belanja</span>
                    <span className="text-base font-black text-[#1A1A1A]">
                      {formatRupiah(ord.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Bottom Courier & Action Row */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-2 text-neutral-600 font-medium">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <span>
                      {ord.shippingCourier} · Resi:{" "}
                      <strong className="text-neutral-900 font-mono">
                        {ord.trackingNumber}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isAwaitingPay ? (
                      <Link
                        href={`/checkout/payment/${ord.orderCode}`}
                        className="px-4 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition"
                      >
                        Bayar Sekarang
                      </Link>
                    ) : isDeliveredChecking ? (
                      <>
                        <Link
                          href={`/orders/${ord.orderCode}/dispute`}
                          className="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs transition"
                        >
                          Laporkan Masalah
                        </Link>
                        <Link
                          href={`/orders/${ord.orderCode}`}
                          className="px-4 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition"
                        >
                          Konfirmasi Terima
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/orders/${ord.orderCode}`}
                        className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
