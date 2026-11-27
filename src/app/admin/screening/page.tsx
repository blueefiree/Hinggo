import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";
import ScreeningItemRow from "./ScreeningItemRow";

export const revalidate = 0;

export default async function ScreeningPage() {
  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*, consignor:users(*)")
    .eq("status", "Diajukan")
    .order("created_at", { ascending: true });

  const { data: rejectionReasonsSetting } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "rejection_reasons")
    .single();

  const reasons = (rejectionReasonsSetting?.value as string[]) || [
    "barang tidak berfungsi",
    "kondisi tidak sesuai pengajuan",
    "bukti kepemilikan tidak memenuhi syarat",
    "rusak dalam pengiriman",
    "kategori tidak diterima",
    "tidak dikirim tepat waktu",
    "lainnya (catatan wajib)",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              <Link href="/admin" className="hover:underline">Admin</Link> / Screening
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Antrean Screening Dokumen & Fisik</h1>
            <p className="text-xs text-gray-500 mt-1">
              Tinjau dokumen KTP dan bukti kepemilikan. Setujui untuk pengiriman atau tolak dengan alasan baku.
            </p>
          </div>
        </div>

        {/* Screening List */}
        {!items || items.length === 0 ? (
          <div className="bg-white p-12 rounded-card border border-dashed border-gray-300 text-center space-y-2">
            <p className="font-bold text-gray-700 text-sm">Tidak ada barang yang menunggu screening.</p>
            <p className="text-xs text-gray-500">Semua pengajuan sudah diproses.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <ScreeningItemRow key={item.id} item={item} standardReasons={reasons} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
