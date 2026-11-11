"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-black transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-10 shadow-xs flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEB] text-amber-700 border border-[#FDE68A]">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
              Syarat & Ketentuan Hingo
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Terakhir diperbarui: 24 Oktober 2026
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">1. Ketentuan Barang Konsinyasi</h2>
          <p>
            Barang yang dititipkan harus unit orisinal milik pribadi, bukan barang tiruan/replika, dan bebas dari sengketa kepemilikan. Setiap unit wajib lolos kurasi online dan inspeksi fisik menyeluruh di fasilitas Hingo sebelum dipasarkan.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">2. Komisi dan Pencairan</h2>
          <p>
            Hingo mengenakan biaya konsinyasi 8% + biaya penanganan standar hanya ketika gear berhasil terjual dan dikonfirmasi oleh pembeli. Jika terjadi ketidaksepakatan harga pasar setelah inspeksi, pemilik berhak meminta retur pengembalian tanpa penalti pendaftaran.
          </p>
        </section>

        <section className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-700 leading-relaxed">
          <h2 className="text-base font-bold text-[#1A1A1A]">3. Garansi dan Perlindungan Pembeli</h2>
          <p>
            Pembeli berhak atas masa pengecekan barang selama 1×24 jam sejak paket diterima. Jika spesifikasi berbeda dari laporan inspeksi fisik tertera, pembeli dapat mengajukan klaim dispute melalui sistem sebelum dana dicairkan ke penjual.
          </p>
        </section>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span>© 2026 Hingo Preloved Gear Marketplace</span>
          <Link href="/privacy" className="font-semibold text-neutral-600 hover:text-black">
            Kebijakan Privasi →
          </Link>
        </div>
      </div>
    </div>
  );
}

