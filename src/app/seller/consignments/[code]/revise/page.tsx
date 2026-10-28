"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Upload,
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function ConsignmentRevisePage() {
  const params = useParams();
  const router = useRouter();
  const { consignments, submitConsignmentRevision } = useHingoStore();

  const code = (params?.code as string) || "HG-261020-037";
  const item = consignments.find((c) => c.code === code) || consignments[6]; // Keychron C1

  const [revisionNotes, setRevisionNotes] = useState(
    "Foto port USB-C sudah difoto ulang dengan pencahayaan terang dan kabel terpasang kokoh. Casing samping mulus, gores mikro hanya ada di plat bawah."
  );
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSamplePhoto = () => {
    setSelectedPhotos((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop",
    ]);
  };

  const handleRemovePhoto = (idx: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      submitConsignmentRevision(code, selectedPhotos, revisionNotes);
      setIsSubmitting(false);
      router.push(`/seller/consignments?revised=${code}`);
    }, 800);
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
        <span className="text-[#1A1A1A] font-bold">PERBAIKAN PENGAJUAN</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 text-amber-900 px-3 py-0.5 text-xs font-bold border border-amber-300">
            Perlu Revisi Dokumen Foto
          </span>
          <span className="font-mono text-xs font-bold text-neutral-400">{code}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
          Perbaiki Pengajuan Titip Jual
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          {item?.brandModel || "Keychron C1"} · Mohon lengkapi foto dan keterangan yang diminta oleh tim kurasi Hingo agar bisa diproses ke tahap kirim gudang.
        </p>
      </div>

      {/* Notice Card from Curator */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 mb-8 flex items-start gap-4 shadow-xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFC629] text-black">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-neutral-800 leading-relaxed">
          <strong className="text-black font-bold block mb-1">
            Catatan dari Tim Kurasi Hingo:
          </strong>
          {item?.statusSummary ||
            "Foto port USB Type-C belum jelas dan kondisi gores casing samping belum terlihat detail. Mohon unggah foto makro dengan pencahayaan cukup."}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Photo Upload Section */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                Foto Tambahan Resolusi Tinggi
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Unggah foto fokus pada port konektor dan detail fisik yang diminta.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">
              {selectedPhotos.length} foto terpilih
            </span>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {selectedPhotos.map((url, idx) => (
              <div key={idx} className="relative aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 group bg-neutral-100">
                <img
                  src={url}
                  alt={`Revisi ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white drop-shadow-md">
                  Foto {idx + 1}
                </div>
              </div>
            ))}

            {/* Upload Button Box */}
            <button
              type="button"
              onClick={handleAddSamplePhoto}
              className="aspect-4/3 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#FFC629] hover:bg-[#FFFBEB] flex flex-col items-center justify-center gap-1.5 transition text-neutral-500 hover:text-black cursor-pointer p-4 text-center"
            >
              <Camera className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-bold">Tambah Foto</span>
              <span className="text-[10px] text-neutral-400">JPG, PNG maks 5MB</span>
            </button>
          </div>
        </div>

        {/* Note Textarea */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#1A1A1A]">
            Penjelasan & Tanggapan Anda
          </h3>
          <textarea
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Jelaskan kondisi port USB dan cacat casing lebih rinci..."
            className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] p-4 text-xs sm:text-sm text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link
            href="/seller/consignments"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition text-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-8 py-3 text-xs sm:text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-95 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Mengirim Revisi...</span>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Kirim Perbaikan ke Tim Kurasi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
