"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Check,
  Share2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";
import { CONSIGNMENT_ITEMS, ConsignmentItem } from "@/lib/data";

export default function ConsignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { consignments } = useHingoStore();

  const code = (params?.code as string) || "HG-261018-031";
  const item: ConsignmentItem =
    consignments.find((c) => c.code === code) || CONSIGNMENT_ITEMS[0];

  const [requestedBreakdown, setRequestedBreakdown] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState({
    proposedPrice: item.proposedPriceAfterInspection || 950000,
    consignmentFee: item.consignmentFee || 95000,
    netPayout: item.estimatedNetPayout || 855000,
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRequestBreakdown = () => {
    setRequestedBreakdown(true);
    alert(
      "Rincian biaya berhasil dihitung otomatis oleh sistem kurator Hingo: Biaya titip 10% (Rp95.000), estimasi hasil bersih Rp855.000."
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-6">
        <Link href="/seller/consignments" className="hover:text-black">
          BARANG TITIPAN SAYA
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#1A1A1A] font-bold font-mono">{item.code}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Inspeksi selesai. Tunggu rincian admin.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {item.brandModel} · Inspeksi fisik selesai 22 Okt 2026, 10.30 WIB · Menunggu rincian admin
          </p>
        </div>

        <StatusBadge label={item.badgeLabel} variant="warning" />
      </div>

      {/* Cream Status Box with 4 Status Pills */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 mb-8 shadow-xs flex flex-col gap-3">
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
          <strong className="text-black font-bold">
            Inspeksi fisik selesai, hasil akhir belum dicatat:{" "}
          </strong>
          Kondisi barang telah diuji menyeluruh oleh kurator Hingo. Tinjau catatan cacat kosmetik
          di bawah sebelum menyepakati harga jual final.
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 flex items-center gap-1 border border-emerald-300">
            <Check className="h-3.5 w-3.5" /> Inspeksi fisik selesai
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-3 py-1 border border-neutral-300">
            {requestedBreakdown ? "Rincian biaya tersedia" : "Belum ada rincian biaya"}
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-3 py-1 border border-neutral-300">
            {requestedBreakdown ? `Hasil bersih ${formatRupiah(feeBreakdown.netPayout)}` : "Belum ada hasil bersih"}
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-3 py-1 border border-neutral-300">
            Ketentuan titip jual standar
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Item & Photos */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-400">
                  {item.code}
                </span>
                <h2 className="text-lg font-black text-[#1A1A1A]">
                  {item.brandModel}
                </h2>
                <p className="text-xs text-neutral-500">
                  {item.category} · {item.variantSpec} · Pemilik: Naya Putri
                </p>
              </div>
              <StatusBadge label="Barang di Gudang Hingo" variant="neutral" size="sm" />
            </div>

            {/* Inspection Photos */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Foto dokumentasi inspeksi fisik tim Hingo
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-neutral-200 p-2.5 bg-[#F6F6F4]">
                  <img
                    src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=400&auto=format&fit=crop"
                    alt="Tampak atas"
                    className="aspect-4/3 w-full rounded-xl object-cover"
                  />
                  <span className="mt-1.5 block text-[11px] font-bold text-neutral-700 text-center">
                    Casing atas & tombol mulus
                  </span>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-2.5 bg-[#F6F6F4]">
                  <img
                    src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop"
                    alt="Gores sandaran jempol"
                    className="aspect-4/3 w-full rounded-xl object-cover"
                  />
                  <span className="mt-1.5 block text-[11px] font-bold text-amber-800 text-center">
                    Gores halus sandaran jempol
                  </span>
                </div>

                <div className="rounded-2xl border border-neutral-200 p-2.5 bg-[#F6F6F4]">
                  <img
                    src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop"
                    alt="Kelengkapan diterima"
                    className="aspect-4/3 w-full rounded-xl object-cover"
                  />
                  <span className="mt-1.5 block text-[11px] font-bold text-neutral-700 text-center">
                    Receiver & kabel lengkap
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Laporan Inspeksi Hingo */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A1A1A]">
                Laporan inspeksi teknis Hingo
              </h3>
              <div className="flex items-center gap-2">
                <StatusBadge label="Fungsi 100% normal" variant="verified" size="sm" />
                <StatusBadge label="Ada cacat kosmetik" variant="warning" size="sm" />
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-1">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  Spesifikasi Terverifikasi
                </span>
                <p className="font-semibold text-neutral-800">
                  {item.inspectionReport?.specs || "Sensor Darkfield 8000 DPI, koneksi Logi Bolt & Bluetooth, baterai 500mAh"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-1">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  Uji Fungsi Switch & Sensor
                </span>
                <p className="font-semibold text-neutral-800">
                  {item.inspectionReport?.functionTest || "Sensor optik 100% responsif, scroll wheel normal, semua 7 tombol klik taktil & presisi."}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 flex flex-col gap-1">
                <span className="text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                  Kondisi Aktual & Cacat
                </span>
                <p className="font-semibold text-neutral-800">
                  {item.inspectionReport?.conditionAndDefect || "Terdapat gores halus pada area karet sandaran jempol kiri bekas gesekan jam tangan."}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-1">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  Kelengkapan Fisik Diterima
                </span>
                <p className="font-semibold text-neutral-800">
                  {item.inspectionReport?.completenessReceived || "Unit mouse, receiver Logi Bolt USB, kabel USB-C original, box lengkap."}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-neutral-400">
              Diinspeksi pada {item.inspectionReport?.inspectedAt || "22 Okt 2026, 10.30 WIB oleh Tim Inspeksi Hingo"}
            </div>
          </div>

          {/* Card 3: Pengiriman Pemilik -> Hingo */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Pengiriman pemilik → Hingo
                </h3>
              </div>
              <StatusBadge label="Sudah diterima Hingo" variant="verified" size="sm" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-700">
              <div>
                <span className="text-neutral-400 block font-medium">Kurir & Nomor Resi</span>
                <strong className="text-sm font-bold text-[#1A1A1A]">
                  JNE REG · {item.inboundTrackingNumber || "HGO261020031"}
                </strong>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Dikirim dari Bandung oleh Naya Putri pada 20 Okt 2026
                </p>
              </div>

              <button
                type="button"
                onClick={() => alert("Bukti serah terima gudang: Diterima oleh Petugas Kurasi Hingo pada 21 Okt 2026 14:15 WIB.")}
                className="rounded-xl border border-neutral-300 bg-[#F6F6F4] px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-200 self-start sm:self-auto"
              >
                Lihat pelacakan & bukti terima
              </button>
            </div>
          </div>

          {/* Card 4: Perjalanan Titipan (9 Steps) */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-[#1A1A1A]">
              Perjalanan barang titipan
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              {[
                { title: "Pengajuan dikirim oleh Naya", status: "completed" },
                { title: "Lolos kurasi online Hingo", status: "completed" },
                { title: "Dikirim ke gudang Hingo (JNE REG)", status: "completed" },
                { title: "Diterima tim gudang Hingo", status: "completed" },
                { title: "Inspeksi fisik & dokumentasi selesai", status: "current" },
                { title: "Persetujuan harga jual final", status: "upcoming" },
                { title: "Pemasaran di media sosial (IG, TikTok)", status: "upcoming" },
                { title: "Terjual & dikirim ke pembeli", status: "upcoming" },
                { title: "Pencairan hasil titip jual", status: "upcoming" },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.status === "completed"
                        ? "bg-emerald-500 text-white"
                        : step.status === "current"
                        ? "bg-[#FFC629] text-black ring-2 ring-[#FFC629]/30"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {step.status === "completed" ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`font-semibold ${
                      step.status === "current"
                        ? "text-[#1A1A1A] font-bold"
                        : step.status === "completed"
                        ? "text-neutral-700"
                        : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel option */}
          <div className="rounded-2xl border border-neutral-200 p-4 flex items-center justify-between text-xs">
            <span className="text-neutral-600 font-medium">Ingin revisi atau tidak lanjut titip jual?</span>
            <button
              type="button"
              onClick={() => alert("Pengajuan pembatalan dibuka: Admin Hingo akan mengontakmu untuk opsi retur pengembalian gear.")}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Ajukan pembatalan
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Tinjau Harga & Kondisi Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Tinjau harga & kondisi
              </span>
              <StatusBadge label="Menunggu rincian" variant="warning" size="sm" />
            </div>

            <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-2 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">
                  Usulan harga jual setelah inspeksi:
                </span>
                <strong className="text-xl font-black text-[#1A1A1A]">
                  {formatRupiah(feeBreakdown.proposedPrice)}
                </strong>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Harapan awalmu: {formatRupiah(item.expectedPrice)}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-2 flex justify-between">
                <span className="text-neutral-600">Biaya titip jual (10%)</span>
                <span className="font-bold text-[#1A1A1A]">
                  {requestedBreakdown ? formatRupiah(feeBreakdown.consignmentFee) : "Menunggu konfirmasi admin"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-600">Estimasi hasil bersih</span>
                <span className="font-bold text-emerald-700">
                  {requestedBreakdown ? formatRupiah(feeBreakdown.netPayout) : "Belum dapat dihitung"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                disabled={!requestedBreakdown}
                onClick={() => alert("Selamat! Harga jual disepakati. Tim Hingo akan memulai foto studio dan promosi media sosial.")}
                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  requestedBreakdown
                    ? "bg-[#1A1A1A] text-white hover:bg-neutral-800"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                Setujui harga & kondisi
              </button>

              <button
                type="button"
                onClick={handleRequestBreakdown}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-xs sm:text-sm font-bold text-black shadow-xs transition"
              >
                <span>Minta rincian biaya & hasil bersih</span>
              </button>

              <Link
                href="/chat/product"
                className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Tanya hasil pemeriksaan
              </Link>
            </div>
          </div>

          {/* Marketing Plan */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Rencana Pemasaran Hingo
            </h4>
            <div className="text-xs text-neutral-700 leading-relaxed flex flex-col gap-1.5 font-medium">
              <p>• Foto studio profesional & sound test switch</p>
              <p>• Promosi di feed Instagram @hingo.gear & TikTok</p>
              <p>• Distribusi ke 12 grup komunitas peripheral preloved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
