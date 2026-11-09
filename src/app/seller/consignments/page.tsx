"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Layers,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function SellerConsignmentsPage() {
  const { user, consignments, payouts } = useHingoStore();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // KPI Calculations (starts at 0)
  const totalCount = consignments.length;
  const actionCount = consignments.filter(
    (c) =>
      c.stage === "INSPECTION_COMPLETED" ||
      c.stage === "ONLINE_CHECK_PASSED" ||
      c.stage === "REVISION_NEEDED" ||
      c.stage === "RETURN_DISCUSSED"
  ).length;
  const marketingCount = consignments.filter(
    (c) => c.stage === "PRICE_AGREED_MARKETING"
  ).length;
  const completedCount = consignments.filter(
    (c) => c.stage === "PAYOUT_COMPLETED"
  ).length;

  const totalPending = (payouts as any[])
    .filter((p: any) => p.status === "PROCESSING" || p.status === "PENDING_ESCROW")
    .reduce((sum: number, p: any) => sum + (p.netDisbursed || p.amount || 0), 0);

  const totalDisbursed = (payouts as any[])
    .filter((p: any) => p.status === "SUCCESS" || p.status === "DISBURSED")
    .reduce((sum: number, p: any) => sum + (p.netDisbursed || p.amount || 0), 0);

  const filteredConsignments = useMemo(() => {
    return consignments.filter((c) => {
      if (
        searchQuery &&
        !c.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (activeFilter === "ACTION") {
        return (
          c.stage === "INSPECTION_COMPLETED" ||
          c.stage === "ONLINE_CHECK_PASSED" ||
          c.stage === "REVISION_NEEDED" ||
          c.stage === "RETURN_DISCUSSED"
        );
      }
      if (activeFilter === "PROCESS") {
        return (
          c.stage === "ONLINE_CHECK" || c.stage === "SHIPPING_TO_HINGO"
        );
      }
      if (activeFilter === "MARKETING") {
        return c.stage === "PRICE_AGREED_MARKETING";
      }
      if (activeFilter === "BUYER") {
        return c.stage === "SOLD_SHIPPING_TO_BUYER";
      }
      if (activeFilter === "DONE") {
        return c.stage === "PAYOUT_COMPLETED";
      }

      return true;
    });
  }, [consignments, activeFilter, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Mobile Sub-Navbar Penjual */}
      <div className="flex md:hidden items-center gap-2 border-b border-neutral-200 pb-3 mb-5">
        <Link
          href="/seller/consignments"
          className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-xs font-bold text-white"
        >
          Barang titipan saya
        </Link>
        <Link
          href="/seller/consignments/new"
          className="rounded-full bg-[#F6F6F4] px-4 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200"
        >
          Ajukan titip jual
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            RUANG PENJUAL / DASHBOARD
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Barang titipan saya
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Halo, {user?.name || "Penjual"}! Pantau gear kamu, dari pengajuan sampai hasil penjualan.
          </p>
        </div>

        <Link
          href="/seller/consignments/new"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-5 py-3 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>+ Ajukan titip jual</span>
        </Link>
      </div>

      {/* 4 KPI Summary Cards - 1 column on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500">Total barang</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#1A1A1A]">{totalCount}</span>
            <span className="text-[11px] font-semibold text-neutral-400">Seluruh pengajuan</span>
          </div>
        </div>

        {/* Card 2: Perlu Tindakan */}
        <div
          className={`rounded-2xl border-2 p-5 shadow-xs flex flex-col justify-between ${
            actionCount > 0
              ? "border-[#FFC629] bg-[#FFFBEB]"
              : "border-[#E5E5E5] bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${actionCount > 0 ? "text-amber-900" : "text-neutral-500"}`}>
              Perlu tindakan
            </span>
            {actionCount > 0 && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-3xl font-black ${actionCount > 0 ? "text-amber-900" : "text-[#1A1A1A]"}`}>
              {actionCount}
            </span>
            <span className="text-[11px] font-bold text-amber-800">
              Persetujuan & kirim
            </span>
          </div>
        </div>

        {/* Card 3: Dipasarkan */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500">Dipasarkan</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#1A1A1A]">{marketingCount}</span>
            <span className="text-[11px] font-semibold text-neutral-400">Ditangani Hingo</span>
          </div>
        </div>

        {/* Card 4: Selesai */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500">Selesai</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#16A34A]">{completedCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700">Sudah dicairkan</span>
          </div>
        </div>
      </div>

      {/* Action Banner (only if actionCount > 0) */}
      {actionCount > 0 && (
        <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            <strong className="text-black font-bold">
              {actionCount} barang butuh tindakanmu —{" "}
            </strong>
            Tinjau hasil inspeksi atau ikuti instruksi pengiriman gear ke Gudang Hingo.
          </div>
        </div>
      )}

      {/* Main List + Financial Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filter + Cards */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Search & Filter pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "Semua", count: totalCount },
                { id: "ACTION", label: "Perlu Tindakan", count: actionCount },
                { id: "PROCESS", label: "Dalam Proses", count: consignments.filter(c => c.stage === "ONLINE_CHECK" || c.stage === "SHIPPING_TO_HINGO").length },
                { id: "MARKETING", label: "Dipasarkan", count: marketingCount },
                { id: "DONE", label: "Selesai", count: completedCount },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === f.id
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      activeFilter === f.id
                        ? "bg-[#FFC629] text-black"
                        : "bg-white text-neutral-500"
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode atau nama barang"
                className="w-full rounded-full bg-[#F6F6F4] py-1.5 pl-8 pr-3 text-xs text-[#1A1A1A] outline-none border border-neutral-200 focus:border-[#FFC629] focus:bg-white"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            </div>
          </div>

          {/* Consignments List */}
          {filteredConsignments.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
                <Layers className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-[#1A1A1A]">
                {consignments.length === 0
                  ? "Belum ada barang titipan"
                  : "Tidak ada barang pada filter ini"}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                {consignments.length === 0
                  ? "Titipkan keyboard, mouse, headset, atau monitor kamu ke Hingo. Kami cek fungsi, foto studio, dan pasarkan aman dengan sistem escrow."
                  : "Ganti filter atau bersihkan pencarian untuk melihat barang lainnya."}
              </p>
              {consignments.length === 0 ? (
                <Link
                  href="/seller/consignments/new"
                  className="rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-6 py-3 text-xs font-bold text-black shadow-xs transition"
                >
                  Ajukan Titip Jual Sekarang
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-amber-800 hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredConsignments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4 hover:border-neutral-300 transition"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-800">
                        {item.code}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-neutral-500">{item.originCity}</span>
                    </div>

                    <StatusBadge
                      label={item.badgeLabel}
                      variant={
                        item.stage === "INSPECTION_COMPLETED" ||
                        item.stage === "ONLINE_CHECK_PASSED"
                          ? "warning"
                          : item.stage === "PAYOUT_COMPLETED"
                          ? "verified"
                          : item.stage === "PRICE_AGREED_MARKETING"
                          ? "verified"
                          : "neutral"
                      }
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex gap-4 sm:gap-5">
                    <img
                      src={item.photos[0] || "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop"}
                      alt={item.brandModel}
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border border-neutral-200 shrink-0"
                    />

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {item.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
                          {item.brandModel}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {item.variantSpec} · {item.usageDuration}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-600 mt-2 font-medium">
                        {item.statusSummary}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      {item.proposedPriceAfterInspection ? (
                        <span>
                          Usulan harga jual:{" "}
                          <strong className="text-[#1A1A1A] font-bold">
                            {formatRupiah(item.proposedPriceAfterInspection)}
                          </strong>
                        </span>
                      ) : item.estimatedNetPayout ? (
                        <span>
                          Estimasi hasil bersih:{" "}
                          <strong className="text-[#1A1A1A] font-bold">
                            {formatRupiah(item.estimatedNetPayout)}
                          </strong>
                        </span>
                      ) : (
                        <span className="text-neutral-500">
                          Ekspektasi awal: {formatRupiah(item.expectedPrice)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/seller/consignments/${item.code}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-black hover:underline"
                    >
                      <span>Lihat Detail →</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Financial Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Financial Summary Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-[#1A1A1A]">
              Ringkasan hasil titip jual
            </h3>

            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex flex-col gap-1">
              <span className="text-xs text-amber-900 font-medium">
                Estimasi belum dibayarkan
              </span>
              <span className="text-2xl font-black text-[#1A1A1A]">
                {formatRupiah(totalPending)}
              </span>
              <span className="text-[11px] text-neutral-500">
                {totalPending > 0 ? "Dalam proses transaksi escrow" : "Tidak ada dana tertahan"}
              </span>
            </div>

            <div className="rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] p-4 flex flex-col gap-1">
              <span className="text-xs text-emerald-900 font-medium">
                Pencairan sudah diterima
              </span>
              <span className="text-2xl font-black text-[#16A34A]">
                {formatRupiah(totalDisbursed)}
              </span>
              <span className="text-[11px] text-neutral-500">
                {totalDisbursed > 0 ? "Telah ditransfer ke rekening bankmu" : "Belum ada pencairan"}
              </span>
            </div>

            <Link
              href="/seller/payouts"
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition block"
            >
              Lihat riwayat pencairan
            </Link>
          </div>

          {/* Logistics Guidance */}
          <div className="rounded-3xl bg-[#F6F6F4] border border-neutral-200 p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-neutral-900 text-xs">
              <Truck className="h-4 w-4 text-amber-600" />
              <span>Dua pengiriman, beda tujuan</span>
            </div>
            <div className="text-xs text-neutral-600 leading-relaxed flex flex-col gap-2">
              <p>
                <strong>1. Pemilik → Hingo:</strong> Kamu mengirim barang ke tim kurasi setelah lolos tahap online check.
              </p>
              <p>
                <strong>2. Hingo → Pembeli:</strong> Tim kami yang mengemas profesional dan mengirimkan langsung ke pembeli.
              </p>
            </div>
          </div>

          {/* Admin Help */}
          <div className="rounded-3xl bg-white border border-[#E5E5E5] p-6 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold text-[#1A1A1A]">
              Admin Hingo siap membantu
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Bingung menentukan harga atau instruksi pengiriman paket? Diskusi langsung bersama tim kurator kami.
            </p>
            <Link
              href="/chat/product"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat admin Hingo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Footer Ringkas */}
      <div className="flex md:hidden items-center justify-between border-t border-neutral-200 pt-6 mt-8 text-xs text-neutral-400">
        <span>© 2026 Hingo</span>
        <div className="flex items-center gap-3">
          <Link href="/privacy" className="hover:text-neutral-700">Privasi</Link>
          <span>·</span>
          <Link href="/chat/support" className="hover:text-neutral-700">Bantuan</Link>
        </div>
      </div>
    </div>
  );
}
