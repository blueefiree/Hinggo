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
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function SellerConsignmentsPage() {
  const { consignments } = useHingoStore();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // KPI Calculations
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
            Halo, Naya! Pantau gear kamu, dari pengajuan sampai hasil penjualan.
          </p>
        </div>

        <Link
          href="/seller/consignments/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-5 py-3 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.99] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Ajukan titip jual</span>
        </Link>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        {/* Card 1: Total */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-neutral-500">Total barang</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#1A1A1A]">{totalCount}</span>
            <span className="text-[11px] font-semibold text-neutral-400">Seluruh pengajuan</span>
          </div>
        </div>

        {/* Card 2: Perlu Tindakan (Highlighted #FFFBEB) */}
        <div className="rounded-2xl border-2 border-[#FFC629] bg-[#FFFBEB] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Perlu tindakan</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-900">{actionCount}</span>
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

      {/* Cream Alert Banner */}
      <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
          <strong className="text-black font-bold">4 barang butuh tindakanmu — </strong>
          Tinjau hasil inspeksi MX Master 3S, kirim Akko setelah membaca instruksi, lengkapi foto Keychron C1, dan bahas pengembalian AOC.
        </div>
      </div>

      {/* Main List + Financial Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filter + 9 Cards */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Search & Filter pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang atau ID..."
                className="w-full rounded-xl bg-[#F6F6F4] py-2.5 pl-9 pr-3 text-xs font-medium text-[#1A1A1A] outline-none border border-transparent focus:border-[#FFC629] focus:bg-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "ALL"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Semua · {totalCount}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("ACTION")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "ACTION"
                    ? "bg-[#FFC629] text-black border border-[#F59E0B]"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Perlu tindakan · {actionCount}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("PROCESS")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "PROCESS"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Diproses · 2
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("MARKETING")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "MARKETING"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Dipasarkan · 1
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("BUYER")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "BUYER"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Ke pembeli · 1
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("DONE")}
                className={`rounded-full px-3 py-1.5 transition ${
                  activeFilter === "DONE"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Selesai · 1
              </button>
            </div>
          </div>

          {/* Consignment Items Cards */}
          <div className="flex flex-col gap-4">
            {filteredConsignments.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs hover:border-[#FFC629] transition-all flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      {item.code}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <StatusBadge label={item.badgeLabel} />
                </div>

                <div className="flex gap-4">
                  <div className="relative aspect-square w-16 sm:w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                    <img
                      src={item.photos[0]}
                      alt={item.brandModel}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A] group-hover:text-amber-800 transition">
                        {item.brandModel}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {item.variantSpec}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-700 font-medium mt-2">
                      {item.statusSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
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
                    ) : item.actualNetPayout ? (
                      <span className="text-[#16A34A] font-bold">
                        Pencairan diterima: {formatRupiah(item.actualNetPayout)}
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
                    <span>{item.actionPrompt}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
                Rp1.450.000
              </span>
              <span className="text-[11px] text-neutral-500">
                Dari Dell P2422H (Sedang dikirim ke pembeli)
              </span>
            </div>

            <div className="rounded-2xl bg-[#DCFCE7]/60 border border-[#BBF7D0] p-4 flex flex-col gap-1">
              <span className="text-xs text-emerald-900 font-medium">
                Pencairan sudah diterima
              </span>
              <span className="text-2xl font-black text-[#16A34A]">
                Rp450.000
              </span>
              <span className="text-[11px] text-neutral-500">
                Dari SteelSeries Apex 3 (BCA Naya Putri)
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert("Riwayat mutasi transfer rekening: 1 pencairan sukses pada 15 Okt 2026.")}
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Lihat riwayat pencairan
            </button>
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
    </div>
  );
}
