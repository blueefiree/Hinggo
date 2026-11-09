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
  X,
  Edit3,
  ArrowLeftRight,
  PackageCheck,
  CreditCard,
  Megaphone,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";
import { CONSIGNMENT_ITEMS, ConsignmentItem } from "@/lib/data";

export default function ConsignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, consignments, approveConsignmentPrice, sendMessage, requestConsignmentReturn } = useHingoStore();

  const code = (params?.code as string) || "HG-261018-031";
  const item: ConsignmentItem =
    consignments.find((c) => c.code === code) || CONSIGNMENT_ITEMS[0];

  const isAlreadyMarketing = item.stage === "PRICE_AGREED_MARKETING";
  const [requestedBreakdown, setRequestedBreakdown] = useState(
    isAlreadyMarketing || Boolean(item.proposedPriceAfterInspection)
  );

  const [feeBreakdown, setFeeBreakdown] = useState({
    proposedPrice: item.proposedPriceAfterInspection || 950000,
    consignmentFee: item.consignmentFee || 76000, // 8% of 950k
    handlingFee: 19000,
    netPayout: item.estimatedNetPayout || 855000,
  });

  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState("980000");
  const [negotiationNote, setNegotiationNote] = useState(
    "Mouse pemakaian pribadi sangat apik dan baterai masih sangat prima. Apakah bisa ditayangkan di harga Rp980.000?"
  );

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnOption, setReturnOption] = useState<"jne" | "pickup">("jne");
  const [approvalSuccess, setApprovalSuccess] = useState(isAlreadyMarketing);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRequestBreakdown = () => {
    setRequestedBreakdown(true);
    setFeeBreakdown({
      proposedPrice: 950000,
      consignmentFee: 76000,
      handlingFee: 19000,
      netPayout: 855000,
    });
  };

  const handleApprovePrice = () => {
    approveConsignmentPrice(code, {
      proposedPrice: feeBreakdown.proposedPrice,
      consignmentFee: feeBreakdown.consignmentFee + feeBreakdown.handlingFee,
      netPayout: feeBreakdown.netPayout,
    });
    setApprovalSuccess(true);
  };

  const handleSendNegotiation = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCounter = parseInt(counterPrice.replace(/\D/g, "")) || 980000;
    sendMessage(
      "product",
      `[Pengajuan Negosiasi Harga - ${code}] Penjual mengajukan penawaran harga alternatif: ${formatRupiah(cleanCounter)}. Alasan: ${negotiationNote}`
    );
    setNegotiateModalOpen(false);
    alert(
      `Pengajuan negosiasi harga ${formatRupiah(cleanCounter)} berhasil dikirimkan ke Admin Kurasi Hingo.`
    );
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const optLabel = returnOption === "jne" ? `Kirim via JNE REG ke alamat ${user?.name || "Penjual"}` : "Ambil mandiri di Gudang Gandaria";
    requestConsignmentReturn(code, optLabel);
    setCancelModalOpen(false);
    alert("Permohonan pengembalian gear telah diajukan ke tim logistik gudang Hingo.");
  };

  return (
    <div className="mx-auto max-w-4xl px-3 sm:px-4 py-3 sm:py-6 md:py-10 pb-16 md:pb-10">
      {/* 1. Header Status & Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-neutral-500 mb-3">
        <Link href="/seller/consignments" className="hover:text-black">
          BARANG TITIPAN SAYA
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#1A1A1A] font-bold font-mono">{item.code}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
            DETAIL TITIP JUAL
          </span>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-[#1A1A1A]">
            Inspeksi selesai. Tunggu rincian admin.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            {item.brandModel} · Kode: <span className="font-mono font-bold text-neutral-800">{item.code}</span>
          </p>
        </div>

        <StatusBadge label={item.badgeLabel} variant="warning" size="sm" />
      </div>

      {/* 2. Kartu Krem Info Inspeksi */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-6 mb-4 sm:mb-6 shadow-xs flex flex-col gap-2.5">
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
          <strong className="text-black font-bold">
            Inspeksi fisik selesai, hasil akhir belum dicatat:{" "}
          </strong>
          Kondisi barang telah diuji menyeluruh oleh kurator Hingo. Tinjau catatan cacat kosmetik
          di bawah sebelum menyepakati harga jual final.
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] sm:text-xs font-bold">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 flex items-center gap-1 border border-emerald-300">
            <Check className="h-3 w-3" /> Inspeksi selesai
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-2.5 py-0.5 border border-neutral-300">
            {requestedBreakdown ? "Rincian biaya keluar" : "Belum ada rincian"}
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-2.5 py-0.5 border border-neutral-300">
            {requestedBreakdown ? `Bersih ${formatRupiah(feeBreakdown.netPayout)}` : "Belum ada hasil"}
          </span>
          <span className="rounded-full bg-white text-neutral-600 px-2.5 py-0.5 border border-neutral-300">
            Ketentuan standar
          </span>
        </div>
      </div>

      {/* Vertical Single-Column Sequence (13 cards) */}
      <div className="flex flex-col gap-3.5 sm:gap-6">
        {/* 3. Kartu 4 Tahap Pengajuan */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#E5E5E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400">
              4 Tahap Pengajuan Titip Jual
            </h3>
            <span className="text-[11px] sm:text-xs font-bold text-amber-800">Tahap 3 dari 4</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-emerald-800 uppercase">Tahap 1</span>
              <strong className="text-emerald-950 font-bold text-xs">Pengajuan Online</strong>
              <span className="text-[9px] text-emerald-700 font-semibold">✓ Disetujui</span>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-emerald-800 uppercase">Tahap 2</span>
              <strong className="text-emerald-950 font-bold text-xs">Kirim ke Hingo</strong>
              <span className="text-[9px] text-emerald-700 font-semibold">✓ Diterima Gudang</span>
            </div>
            <div className="rounded-xl bg-[#FFFBEB] border-2 border-[#FFC629] p-2.5 flex flex-col gap-0.5 shadow-xs">
              <span className="text-[9px] font-bold text-amber-800 uppercase">Tahap 3</span>
              <strong className="text-black font-black text-xs">Inspeksi Fisik</strong>
              <span className="text-[9px] text-amber-900 font-bold">● Selesai dicek</span>
            </div>
            <div className="rounded-xl bg-[#F6F6F4] border border-neutral-200 p-2.5 flex flex-col gap-0.5">
              <span className="text-[9px] font-bold text-neutral-400 uppercase">Tahap 4</span>
              <strong className="text-neutral-600 font-bold text-xs">Disetujui & Tayang</strong>
              <span className="text-[9px] text-neutral-400">Menunggu konfirmasi</span>
            </div>
          </div>
        </div>

        {/* 4. Kartu Foto Barang & 3 Foto Dokumentasi Inspeksi */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#E5E5E5] bg-white p-4 sm:p-7 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
            <div>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {item.code}
              </span>
              <h2 className="text-lg font-black text-[#1A1A1A]">
                {item.brandModel}
              </h2>
              <p className="text-xs text-neutral-500">
                {item.category} · {item.variantSpec} · Pemilik: {user?.name || "Penjual"}
              </p>
            </div>
            <StatusBadge label="Barang di Gudang Hingo" variant="neutral" size="sm" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
              Foto dokumentasi inspeksi fisik tim Hingo (3 foto)
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

        {/* 5. Kartu Tinjau Harga & Kondisi */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-7 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                TINJAU HARGA & KONDISI
              </span>
              <h3 className="text-base font-black text-[#1A1A1A] mt-0.5">
                Konfirmasi harga jual dan estimasi hasil bersih
              </h3>
            </div>
            <StatusBadge
              label={approvalSuccess ? "Sedang dipasarkan" : requestedBreakdown ? "Rincian keluar" : "Menunggu rincian"}
              variant={approvalSuccess ? "verified" : "warning"}
              size="sm"
            />
          </div>

          {approvalSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-2.5 text-xs text-emerald-900 font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-emerald-950">Harga & Kondisi Telah Disetujui!</strong>
                Gear kamu telah masuk antrean foto studio Hingo dan segera ditayangkan ke katalog marketplace.
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-[#F6F6F4] p-4 sm:p-5 flex flex-col gap-3 text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">
                Usulan harga jual setelah inspeksi:
              </span>
              <strong className="text-2xl font-black text-[#1A1A1A]">
                {formatRupiah(feeBreakdown.proposedPrice)}
              </strong>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                Harapan awalmu: {formatRupiah(item.expectedPrice)}
              </span>
            </div>

            <div className="border-t border-neutral-200 pt-2.5 flex justify-between text-neutral-600">
              <span>Biaya konsinyasi & pemasaran Hingo (8%)</span>
              <span className="font-bold text-neutral-900">
                {requestedBreakdown ? `- ${formatRupiah(feeBreakdown.consignmentFee)}` : "Menunggu admin"}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>Biaya penanganan & rekondisi ringan</span>
              <span className="font-bold text-neutral-900">
                {requestedBreakdown ? `- ${formatRupiah(feeBreakdown.handlingFee)}` : "Menunggu admin"}
              </span>
            </div>

            <div className="border-t border-neutral-200 pt-2.5 flex justify-between items-baseline">
              <span className="text-xs font-bold text-neutral-800">Estimasi hasil bersih</span>
              <span className="text-lg font-black text-emerald-700">
                {requestedBreakdown ? formatRupiah(feeBreakdown.netPayout) : "Belum dihitung"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Primary Action Button */}
            <button
              type="button"
              disabled={!requestedBreakdown || approvalSuccess}
              onClick={handleApprovePrice}
              className={`w-full py-3.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                approvalSuccess
                  ? "bg-emerald-600 text-white cursor-default"
                  : requestedBreakdown
                  ? "bg-[#FFC629] hover:bg-[#FFC420] text-black shadow-xs active:scale-[0.99]"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {approvalSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Harga Telah Disetujui</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Setujui Harga & Kondisi</span>
                </>
              )}
            </button>

            {!requestedBreakdown && (
              <button
                type="button"
                onClick={handleRequestBreakdown}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] text-xs sm:text-sm font-bold text-amber-950 transition cursor-pointer"
              >
                <span>Minta rincian biaya & hasil bersih</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setNegotiateModalOpen(true)}
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            >
              Ajukan negosiasi harga / revisi
            </button>

            <Link
              href="/chat/product"
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Tanya hasil pemeriksaan ke Admin
            </Link>
          </div>
        </div>

        {/* 6. Kartu Hasil Pengajuan */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Hasil Pengajuan Titip Jual
            </h3>
            <span className="text-xs font-bold text-emerald-700">Status: Disetujui Hingo</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 px-3.5 py-1 text-xs font-bold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Disetujui
            </span>
            <span className="rounded-full bg-neutral-100 text-neutral-400 px-3.5 py-1 text-xs font-bold">
              Ditolak
            </span>
            <span className="rounded-full bg-neutral-100 text-neutral-400 px-3.5 py-1 text-xs font-bold">
              Dibatalkan penjual
            </span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Barang kamu dinyatakan <strong>lolos uji kurasi fisik & fungsi</strong> oleh kurator Hingo. Setelah harga final kamu sepakati, barang akan segera dipasarkan.
          </p>
        </div>

        {/* 7. Kartu Laporan Inspeksi Hingo */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-7 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-base font-black text-[#1A1A1A]">
              Laporan inspeksi teknis Hingo
            </h3>
            <div className="flex items-center gap-2">
              <StatusBadge label="Fungsi 100% normal" variant="verified" size="sm" />
              <StatusBadge label="Ada cacat kosmetik" variant="warning" size="sm" />
            </div>
          </div>

          <div className="flex flex-col gap-3 text-xs">
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

        {/* 8. Kartu Pengiriman Pemilik -> Hingo */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
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
                Dikirim dari Bandung oleh {user?.name || "Penjual"} pada 20 Okt 2026
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert("Bukti serah terima gudang: Diterima oleh Petugas Kurasi Hingo pada 21 Okt 2026 14:15 WIB.")}
              className="rounded-xl border border-neutral-300 bg-[#F6F6F4] px-4 py-2 text-xs font-bold text-neutral-800 hover:bg-neutral-200 self-start sm:self-auto cursor-pointer"
            >
              Lihat pelacakan & bukti terima
            </button>
          </div>
        </div>

        {/* 9. Kartu Perjalanan Titipan (9 Tahap Vertikal) */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-7 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-base font-black text-[#1A1A1A]">
              Perjalanan barang titipan
            </h3>
            <span className="text-xs text-neutral-400">9 Tahap Titip Jual</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {[
              { title: `Pengajuan dikirim oleh ${user?.name || "Penjual"}`, status: "completed" },
              { title: "Lolos kurasi online Hingo", status: "completed" },
              { title: "Dikirim ke gudang Hingo (JNE REG)", status: "completed" },
              { title: "Diterima tim gudang Hingo", status: "completed" },
              { title: "Inspeksi fisik & dokumentasi selesai", status: "completed" },
              { title: "Persetujuan harga jual final", status: "current" },
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

        {/* 10. Kartu Rencana Pemasaran */}
        <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-800" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Rencana Pemasaran Hingo
            </h4>
          </div>
          <div className="text-xs text-neutral-700 leading-relaxed flex flex-col gap-1.5 font-medium">
            <p>• Foto studio profesional & sound test switch</p>
            <p>• Promosi di feed & story Instagram <strong>@hingo.gear</strong></p>
            <p>• Video showcase di TikTok & YouTube Shorts Hingo</p>
            <p>• Distribusi ke 12 grup komunitas peripheral keyboard & mouse preloved</p>
          </div>
        </div>

        {/* 11. Kartu Pengiriman Hingo -> Pembeli */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-neutral-500" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Pengiriman Hingo → Pembeli
              </h3>
            </div>
            <StatusBadge label="Menunggu barang terjual" variant="neutral" size="sm" />
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Setelah barang terjual, tim gudang Hingo akan mengemas secara profesional (bubble tebal + kardus bersegel) dan mengirimkan langsung ke pembeli. Pemilik tidak perlu repot mengurus pengiriman ke pembeli.
          </p>
        </div>

        {/* 12. Kartu Penjualan & Pencairan */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Penjualan & Pencairan Dana
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">Escrow Terlindungi</span>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Dana penjualan ditahan aman di sistem Escrow Hingo. Begitu pembeli menerima dan mengonfirmasi barang dalam 2x24 jam, dana bersih sebesar <strong className="text-black font-bold">{formatRupiah(feeBreakdown.netPayout)}</strong> akan langsung ditransfer ke rekening bank terdaftar milikmu dalam 1x24 jam kerja tanpa potongan tersembunyi.
          </p>
        </div>

        {/* 13. Kartu Krem Ingin Revisi atau Tidak Lanjut? (Ajukan Pembatalan) */}
        <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Ingin revisi atau tidak lanjut?
            </h4>
            <p className="text-xs text-neutral-700 mt-1">
              Jika tidak sepakat dengan harga atau ketentuan inspeksi, kamu bebas mengajukan negosiasi atau menarik kembali gear titipanmu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setNegotiateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-50 cursor-pointer"
            >
              Ajukan negosiasi
            </button>
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
            >
              Ajukan pembatalan
            </button>
          </div>
        </div>

        {/* Mobile Footer Ringkas */}
        <div className="flex md:hidden items-center justify-between border-t border-neutral-200 pt-6 mt-4 text-xs text-neutral-400">
          <span>© 2026 Hingo</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-neutral-700">Privasi</Link>
            <span>·</span>
            <Link href="/chat/support" className="hover:text-neutral-700">Bantuan</Link>
          </div>
        </div>
      </div>

      {/* Modal 1: Ajukan Negosiasi Harga */}
      {negotiateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Ajukan Negosiasi Harga ({code})
              </h3>
              <button
                type="button"
                onClick={() => setNegotiateModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendNegotiation} className="mt-4 flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Usulan Harga Final dari Anda (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-4 py-2.5 font-mono text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Usulan admin saat ini: {formatRupiah(feeBreakdown.proposedPrice)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Alasan / Catatan untuk Tim Kurasi Hingo
                </label>
                <textarea
                  rows={3}
                  required
                  value={negotiationNote}
                  onChange={(e) => setNegotiationNote(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div className="rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] text-neutral-700 text-[11px] leading-relaxed">
                Tim kurator Hingo akan meninjau usulan harga dalam waktu 2–4 jam kerja dan membalas melalui ruang chat Admin.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNegotiateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-bold text-black cursor-pointer"
                >
                  Kirim Pengajuan Nego
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Ajukan Pembatalan & Retur */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Ajukan Pengembalian Gear ({code})
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="mt-4 flex flex-col gap-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Jika kamu tidak sepakat dengan hasil inspeksi atau kondisi gear tidak ingin dilanjutkan konsinyasi, barang akan dikirim kembali dari Gudang Hingo Jakarta Selatan.
              </p>

              <div>
                <label className="block font-bold text-neutral-700 mb-2">
                  Pilih Metode Pengembalian
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-200 bg-[#F6F6F4] cursor-pointer hover:bg-neutral-100">
                    <input
                      type="radio"
                      name="returnOpt"
                      checked={returnOption === "jne"}
                      onChange={() => setReturnOption("jne")}
                      className="mt-0.5 accent-[#FFC629]"
                    />
                    <div>
                      <strong className="text-black block">Kirim via JNE REG ke Alamat {user?.name || "Penjual"}</strong>
                      <span className="text-neutral-500 text-[11px]">
                        Alamat domisili terdaftar · Ongkir retur Rp18.000 dibebankan ke penjual
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-200 bg-[#F6F6F4] cursor-pointer hover:bg-neutral-100">
                    <input
                      type="radio"
                      name="returnOpt"
                      checked={returnOption === "pickup"}
                      onChange={() => setReturnOption("pickup")}
                      className="mt-0.5 accent-[#FFC629]"
                    />
                    <div>
                      <strong className="text-black block">Ambil Mandiri di Gudang Gandaria</strong>
                      <span className="text-neutral-500 text-[11px]">
                        Gratis · Senin–Sabtu 09.00–18.00 WIB
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white cursor-pointer"
                >
                  Konfirmasi Pengembalian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
