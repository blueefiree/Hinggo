"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Download,
  Building2,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Printer,
  X,
  CreditCard,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";
import { PayoutRecord } from "@/lib/data";

export default function SellerPayoutsPage() {
  const { user, payouts, activeBankAccount, consignments } = useHingoStore();
  const [selectedReceipt, setSelectedReceipt] = useState<PayoutRecord | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSimulateDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const pendingDisbursement = 1450000; // From Dell P2422H
  const totalDisbursed = payouts.reduce((sum, p) => sum + p.netDisbursed, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
        <Link href="/seller/consignments" className="hover:text-black">
          BARANG TITIPAN SAYA
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-bold">RIWAYAT & BUKTI PENCAIRAN</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            FINANSIAL PENJUAL
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Riwayat Pencairan Dana Konsinyasi
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Hasil penjualan gear preloved yang telah dikonfirmasi pembeli langsung ditransfer ke rekening bankmu.
          </p>
        </div>

        <Link
          href="/seller/consignments"
          className="flex items-center gap-2 rounded-xl bg-[#F6F6F4] hover:bg-neutral-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-neutral-800 transition self-start sm:self-auto border border-neutral-300"
        >
          <span>Kembali ke 9 Titipan</span>
        </Link>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Card 1: Saldo Tertahan Escrow */}
        <div className="rounded-3xl border border-[#FDE68A] bg-[#FFFBEB] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Estimasi Menunggu Pencairan</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-[#1A1A1A]">
              {formatRupiah(pendingDisbursement)}
            </span>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Dari Dell P2422H (Barang sedang dikirim ke pembeli di Surabaya)
            </p>
          </div>
          <div className="text-[11px] text-amber-800 font-semibold border-t border-amber-200/60 pt-2 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Cair otomatis setelah 1x24 jam barang diterima
          </div>
        </div>

        {/* Card 2: Total Cair */}
        <div className="rounded-3xl border border-[#BBF7D0] bg-[#DCFCE7]/60 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>Total Berhasil Dicairkan</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-[#16A34A]">
              {formatRupiah(totalDisbursed)}
            </span>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Ditransfer langsung tanpa potongan tersembunyi
            </p>
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold border-t border-emerald-200 pt-2">
            1 transaksi selesai sukses
          </div>
        </div>

        {/* Card 3: Rekening Tujuan Pencairan */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
            <span>Rekening Bank Penerima</span>
            <Link href="/account?tab=bank" className="text-amber-800 hover:underline">
              Ubah
            </Link>
          </div>
          <div className="my-3 flex items-center gap-3">
            <div className="flex h-10 w-14 items-center justify-center rounded-xl bg-blue-700 text-white font-black text-xs tracking-wider">
              BCA
            </div>
            <div>
              <span className="font-mono text-base font-black text-[#1A1A1A]">
                {activeBankAccount?.accountNumber || "4370192831"}
              </span>
              <p className="text-xs text-neutral-500">
                a.n. {activeBankAccount?.accountHolder || user?.name || "Pemilik Rekening"}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold border-t border-neutral-100 pt-2 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Terverifikasi sesuai KTP {user?.name || "Pemilik"}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-[#E5E5E5] bg-white shadow-xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#1A1A1A]">
              Riwayat Mutasi Transfer Bank Hingo
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Klik transaksi untuk melihat dan mengunduh bukti transfer resmi.
            </p>
          </div>
          <span className="rounded-full bg-neutral-100 text-neutral-700 px-3 py-1 text-xs font-bold">
            {payouts.length} Catatan Transfer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F6F4] text-neutral-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-6 font-bold">Tanggal & No. Referensi</th>
                <th className="py-3.5 px-6 font-bold">Barang Titipan</th>
                <th className="py-3.5 px-6 font-bold">Harga Jual</th>
                <th className="py-3.5 px-6 font-bold">Komisi Hingo</th>
                <th className="py-3.5 px-6 font-bold">Bersih Cair</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-neutral-50 transition">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#1A1A1A]">{pay.disbursedAt}</div>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {pay.referenceNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-black block">{pay.itemName}</strong>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {pay.consignmentCode}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-600 font-semibold">
                    {formatRupiah(pay.grossAmount)}
                  </td>
                  <td className="py-4 px-6 text-neutral-500">
                    - {formatRupiah(pay.consignmentFee)} (10%)
                  </td>
                  <td className="py-4 px-6 font-black text-sm text-[#16A34A]">
                    {formatRupiah(pay.netDisbursed)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                      <Check className="h-3 w-3" /> Berhasil Ditransfer
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(pay)}
                      className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Lihat Bukti Transfer →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Official Hingo BCA Transfer Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A] relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Receipt Header */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-neutral-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC629] text-black font-black text-xl mb-3">
                H
              </div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-neutral-400">
                Bukti Transfer Resmi Rekening Bersama
              </span>
              <h3 className="text-lg font-black text-[#1A1A1A] mt-0.5">
                PT HINGO NIAGA DIGITAL
              </h3>
              <div className="mt-3 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>TRANSFER BERHASIL</span>
              </div>
            </div>

            {/* Nominal Display */}
            <div className="my-5 text-center">
              <span className="text-xs font-bold text-neutral-500">Nominal Pencairan Bersih</span>
              <div className="text-3xl font-black text-[#1A1A1A] tracking-tight mt-1">
                {formatRupiah(selectedReceipt.netDisbursed)}
              </div>
            </div>

            {/* Transfer Receipt Meta Grid */}
            <div className="rounded-2xl bg-[#F6F6F4] p-4 flex flex-col gap-3 text-xs border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">No. Referensi</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900">
                  <span>{selectedReceipt.referenceNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(selectedReceipt.referenceNumber)}
                    className="text-neutral-400 hover:text-black p-0.5"
                    title="Salin No. Referensi"
                  >
                    {copiedRef ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Waktu Transaksi</span>
                <span className="font-semibold text-neutral-900">
                  {selectedReceipt.disbursedAt}
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-2 flex justify-between items-center">
                <span className="text-neutral-500">Rekening Pengirim</span>
                <span className="font-semibold text-neutral-900 text-right">
                  {selectedReceipt.senderAccount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Rekening Penerima</span>
                <span className="font-bold text-neutral-900 text-right">
                  {selectedReceipt.bankName} · {selectedReceipt.accountNumber}
                  <span className="block text-[11px] text-neutral-500 font-normal">
                    a.n. {selectedReceipt.accountHolder}
                  </span>
                </span>
              </div>

              <div className="border-t border-neutral-200 pt-2 flex justify-between items-center">
                <span className="text-neutral-500">Barang Konsinyasi</span>
                <span className="font-bold text-neutral-900 text-right">
                  {selectedReceipt.itemName} ({selectedReceipt.consignmentCode})
                </span>
              </div>
            </div>

            {/* Notification alert */}
            {downloadSuccess && (
              <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-emerald-800">
                ✓ Resi bukti transfer berhasil diunduh (PDF)!
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Resi PDF</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition cursor-pointer"
                title="Cetak Bukti"
              >
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
