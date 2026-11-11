"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Info,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function ConsignmentShipPage() {
  const params = useParams();
  const router = useRouter();
  const { user, consignments, submitConsignmentShipment } = useHingoStore();

  const code = (params?.code as string) || "HG-261019-032";
  const item = consignments.find((c) => c.code === code) || consignments[1];

  const [selectedCourier, setSelectedCourier] = useState<string>("JNE REG");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [checkedChecklist, setCheckedChecklist] = useState({
    bubbleWrap: true,
    completeGear: true,
    codeNote: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const warehouseAddress =
    "Gudang Hingo Hub Jakarta Selatan · Jl. Gandaria Tengah III No. 12, Kramat Pela, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12130 (PIC: Tim Logistik Hingo — 0811-9234-8800)";

  const copyAddress = () => {
    navigator.clipboard.writeText(warehouseAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert("Mohon masukkan nomor resi pengiriman kurir.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitConsignmentShipment(code, selectedCourier, trackingNumber.trim());
      setIsSubmitting(false);
      router.push(`/seller/consignments?shipped=${code}`);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
        <Link href="/seller/consignments" className="hover:text-black">
          BARANG TITIPAN SAYA
        </Link>
        <span>/</span>
        <Link href={`/seller/consignments/${code}`} className="hover:text-black">
          {code}
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-bold">INSTRUKSI PENGIRIMAN & INPUT RESI</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-300">
            Lolos Pengecekan Online
          </span>
          <span className="font-mono text-xs font-bold text-neutral-400">{code}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
          Kirim Gear ke Gudang Inspeksi Hingo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Kirim {item?.brandModel || "Akko 5075B Plus"} kamu ke gudang Hingo di Jakarta Selatan untuk diuji fisik menyeluruh oleh tim teknisi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Warehouse Info & Packing SOP */}
        <div className="md:col-span-7 flex flex-col gap-6">
          {/* Card 1: Warehouse Destination Address */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Alamat Tujuan Pengiriman
                </h3>
              </div>
              <span className="rounded-md bg-[#FFFBEB] text-amber-900 border border-[#FDE68A] px-2 py-0.5 text-[10px] font-bold">
                Hub Inspeksi Utama
              </span>
            </div>

            <div className="rounded-2xl bg-[#F6F6F4] p-4 border border-neutral-200 flex flex-col gap-2">
              <div className="font-bold text-sm text-[#1A1A1A]">
                Gudang Hingo Hub Jakarta Selatan
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Jl. Gandaria Tengah III No. 12, Kramat Pela, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12130
              </p>
              <div className="text-xs text-neutral-700 font-semibold pt-1">
                PIC: Tim Logistik Hingo · 0811-9234-8800
              </div>
            </div>

            <button
              type="button"
              onClick={copyAddress}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition active:scale-95 cursor-pointer"
            >
              {copiedAddress ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700">Alamat Lengkap Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-neutral-500" />
                  <span>Salin Alamat Gudang Hingo</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Packing Checklist SOP */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100 flex items-center justify-between">
              <span>Checklist Pengemasan Aman</span>
              <span className="text-[11px] font-normal text-neutral-400">Wajib dipatuhi</span>
            </h3>

            <div className="flex flex-col gap-3 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-200 bg-[#F6F6F4] cursor-pointer hover:bg-neutral-100 transition">
                <input
                  type="checkbox"
                  checked={checkedChecklist.bubbleWrap}
                  onChange={(e) =>
                    setCheckedChecklist({ ...checkedChecklist, bubbleWrap: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-[#FFC629]"
                />
                <div className="text-neutral-700 leading-relaxed">
                  <strong className="text-black block mb-0.5">Lapisi Bubble Wrap Minimal 3 Lapis</strong>
                  Bungkus box dan unit gear dengan rapat agar terlindung dari benturan selama di perjalanan kurir.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-200 bg-[#F6F6F4] cursor-pointer hover:bg-neutral-100 transition">
                <input
                  type="checkbox"
                  checked={checkedChecklist.completeGear}
                  onChange={(e) =>
                    setCheckedChecklist({ ...checkedChecklist, completeGear: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-[#FFC629]"
                />
                <div className="text-neutral-700 leading-relaxed">
                  <strong className="text-black block mb-0.5">Sertakan Semua Aksesoris</strong>
                  Pastikan kabel USB, dongle 2.4G, keycap puller, dan kartu garansi (jika ada) berada di dalam box.
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-2xl border border-[#FFC629] bg-[#FFFBEB] cursor-pointer hover:bg-amber-100/60 transition">
                <input
                  type="checkbox"
                  checked={checkedChecklist.codeNote}
                  onChange={(e) =>
                    setCheckedChecklist({ ...checkedChecklist, codeNote: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-[#FFC629]"
                />
                <div className="text-neutral-800 leading-relaxed">
                  <strong className="text-amber-950 block mb-0.5">
                    Wajib: Selipkan Kertas Kode Titipan di Dalam Paket
                  </strong>
                  Tulis pada secarik kertas: <span className="font-mono font-black">{code}</span> · {user?.name || "Penjual"} agar tim logistik langsung mengenali titipanmu saat paket dibuka.
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking Number Input Form */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-5"
          >
            <div className="pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                Input Resi Pengiriman
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Masukkan ekspedisi dan nomor resi setelah kamu mengirim barang.
              </p>
            </div>

            {/* Courier Choice */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">
                Pilih Ekspedisi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["JNE REG", "J&T", "SiCepat"].map((cr) => (
                  <button
                    key={cr}
                    type="button"
                    onClick={() => setSelectedCourier(cr)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedCourier === cr
                        ? "bg-[#FFFBEB] border-[#FFC629] text-amber-950 ring-2 ring-[#FFC629]/30"
                        : "bg-[#F6F6F4] border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {cr}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Number Input */}
            <div>
              <label htmlFor="trackingNumber" className="block text-xs font-bold text-neutral-700 mb-2">
                Nomor Resi Pengiriman
              </label>
              <input
                id="trackingNumber"
                name="trackingNumber"
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Contoh: JNE2610229988"
                className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-4 py-3 text-xs sm:text-sm font-mono font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Resi tertera pada struk tanda terima kurir pengiriman.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-xs sm:text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting ? (
                <span>Menyimpan Pengiriman...</span>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  <span>Kirim Resi ke Tim Hingo</span>
                </>
              )}
            </button>

            <Link
              href="/seller/consignments"
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
            >
              Kembali ke Daftar Titipan
            </Link>
          </form>

          {/* Inspection Workflow Timeline Preview */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Apa yang terjadi setelah barang tiba?
            </h4>
            <div className="text-xs text-neutral-700 leading-relaxed flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFC629] text-[9px] font-bold text-black mt-0.5">
                  1
                </span>
                <span>Tim logistik mencocokkan kode {code} dan memeriksa kelengkapan.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFC629] text-[9px] font-bold text-black mt-0.5">
                  2
                </span>
                <span>Teknisi Hingo menguji switch, sensor, PCB, dan mencatat cacat fisik.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFC629] text-[9px] font-bold text-black mt-0.5">
                  3
                </span>
                <span>Rincian biaya & estimasi hasil bersih dikirimkan ke akunmu untuk disetujui.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
