import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { ShieldAlert, Package, CheckSquare, Clock, Settings, Users, DollarSign, ArrowRight } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-xs font-bold text-ink mb-1">
              <ShieldAlert className="size-3.5 text-yellow-700" />
              Dasbor Operasional Admin
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Ringkasan & Antrean Tugas</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/pengaturan"
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs rounded-btn shadow-xs flex items-center gap-2"
            >
              <Clock className="size-4" />
              Simulasi Percepatan Waktu (Demo)
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-card border border-gray-200 shadow-xs">
            <span className="text-xs text-gray-500 font-medium">Antrean Screening Baru</span>
            <p className="text-3xl font-black text-ink mt-1">{pendingScreening}</p>
            <span className="text-[11px] text-yellow-700 font-semibold">Perlu review KTP & bukti</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-gray-200 shadow-xs">
            <span className="text-xs text-gray-500 font-medium">Sedang Diuji Teknisi</span>
            <p className="text-3xl font-black text-ink mt-1">{inTesting}</p>
            <span className="text-[11px] text-blue-700 font-semibold">Cek checklist & video</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-gray-200 shadow-xs">
            <span className="text-xs text-gray-500 font-medium">Barang Aktif Tayang</span>
            <p className="text-3xl font-black text-success mt-1">{activeListed}</p>
            <span className="text-[11px] text-gray-500 font-semibold">Tampil di katalog publik</span>
          </div>

          <div className="bg-white p-5 rounded-card border border-gray-200 shadow-xs">
            <span className="text-xs text-gray-500 font-medium">Siap Payout Consignor</span>
            <p className="text-3xl font-black text-purple-700 mt-1">{readyPayouts}</p>
            <span className="text-[11px] text-purple-700 font-semibold">Garansi 7 hari selesai</span>
          </div>
        </div>

        {/* Action Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Screening Queue (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-card border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink flex items-center gap-2">
                <CheckSquare className="size-5 text-yellow-600" />
                Antrean Pengajuan Barang (Screening)
              </h3>
              <Link href="/admin/screening" className="text-xs font-bold text-yellow-700 hover:underline">
                Buka Semua Antrean &rarr;
              </Link>
            </div>

            {!screeningItems || screeningItems.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">Tidak ada antrean pengajuan yang menunggu screening saat ini.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {screeningItems.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-yellow-700 uppercase">{item.category}</span>
                      <h4 className="font-bold text-sm text-ink">{item.model}</h4>
                      <p className="text-xs text-gray-500">
                        Consignor: <strong>{item.consignor?.name || "User"}</strong> &bull; Harapan: Rp {Number(item.expected_price).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <Link
                      href={`/admin/screening`}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-btn shadow-xs"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Admin Navigation (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-card border border-gray-200 space-y-4">
            <h3 className="font-bold text-base text-ink">Menu Manajemen Admin</h3>
            <div className="space-y-2">
              <Link
                href="/admin/screening"
                className="flex items-center justify-between p-3 rounded-btn bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-ink transition-colors"
              >
                <span>Antrean Screening Online</span>
                <ArrowRight className="size-4 text-gray-400" />
              </Link>

              <Link
                href="/admin/pengaturan"
                className="flex items-center justify-between p-3 rounded-btn bg-yellow-50 hover:bg-yellow-100 text-xs font-bold text-yellow-900 transition-colors"
              >
                <span>Simulasi Waktu & Scheduler (Demo)</span>
                <Clock className="size-4 text-yellow-700" />
              </Link>

              <Link
                href="/katalog"
                className="flex items-center justify-between p-3 rounded-btn bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-ink transition-colors"
              >
                <span>Katalog Publik Website</span>
                <ArrowRight className="size-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
