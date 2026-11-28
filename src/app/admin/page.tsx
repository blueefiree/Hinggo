import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { ShieldAlert, Package, CheckSquare, Clock, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Fetch KPI counts
  const { data: allItems } = await supabaseAdmin.from("items").select("status");
  const items = allItems || [];

  const counts: Record<string, number> = {};
  items.forEach((i) => {
    counts[i.status] = (counts[i.status] || 0) + 1;
  });

  const pendingScreening = counts["Diajukan"] || 0;
  const inTesting = counts["Diterima, sedang diuji"] || 0;
  const activeListed = counts["Tayang"] || 0;
  const readyPayouts = counts["Siap dibayar ke consignor"] || 0;

  // Fetch pending items for quick screening
  const { data: screeningItems } = await supabaseAdmin
    .from("items")
    .select("*, consignor:users(*)")
    .eq("status", "Diajukan")
    .limit(5);

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f4]/40">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffbeb] border border-[#ffe58a] text-xs font-bold text-ink mb-1.5">
              <ShieldAlert className="size-3.5 text-yellow-700" />
              Dasbor Operasional Admin Hinggo
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Ringkasan & Antrean Tugas</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pengaturan"
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs sm:text-sm rounded-[12px] shadow-sm flex items-center gap-2 transition-all"
            >
              <Clock className="size-4" />
              Simulasi Percepatan Waktu (Demo)
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[20px] border border-[#ebebeb] shadow-xs">
            <span className="text-xs text-[#8a8a8a] block mb-1">Menunggu Screening</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-ink">{pendingScreening}</span>
              <span className="text-xs font-semibold text-yellow-600">Unit</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[20px] border border-[#ebebeb] shadow-xs">
            <span className="text-xs text-[#8a8a8a] block mb-1">Sedang Diuji Teknisi</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-ink">{inTesting}</span>
              <span className="text-xs font-semibold text-blue-600">Unit</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[20px] border border-[#ebebeb] shadow-xs">
            <span className="text-xs text-[#8a8a8a] block mb-1">Barang Tayang (Katalog)</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-ink">{activeListed}</span>
              <span className="text-xs font-semibold text-success">Aktif</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[20px] border border-[#ebebeb] shadow-xs">
            <span className="text-xs text-[#8a8a8a] block mb-1">Siap Payout Consignor</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-extrabold text-ink">{readyPayouts}</span>
              <span className="text-xs font-semibold text-emerald-600">Transaksi</span>
            </div>
          </div>
        </div>

        {/* Quick Screening Section */}
        <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
            <h3 className="font-bold text-base text-ink flex items-center gap-2">
              <CheckSquare className="size-5 text-yellow-600" />
              Antrean Screening Pengajuan Masuk
            </h3>
            <Link
              href="/admin/screening"
              className="text-xs font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
            >
              Buka Semua Antrean
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {screeningItems?.length === 0 ? (
            <p className="text-xs text-[#8a8a8a] py-6 text-center">
              Tidak ada pengajuan yang menunggu screening saat ini.
            </p>
          ) : (
            <div className="divide-y divide-[#ebebeb]">
              {screeningItems?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">{item.category}</span>
                    <h4 className="font-bold text-xs sm:text-sm text-ink">{item.model}</h4>
                    <p className="text-[11px] text-[#8a8a8a]">
                      Consignor: {item.consignor?.name} &bull; Harga: Rp {Number(item.expected_price).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <Link
                    href="/admin/screening"
                    className="px-3 py-1.5 bg-[#f6f6f4] hover:bg-yellow-500 hover:text-ink text-xs font-bold text-ink rounded-[10px] transition-colors"
                  >
                    Periksa
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
