import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item } from "@/types";
import { ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, PackageCheck, Search } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  // Fetch active items in 'Tayang' status
  const { data: listedItems } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("status", "Tayang")
    .order("created_at", { ascending: false })
    .limit(8);

  const items: Item[] = (listedItems as Item[]) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden bg-white px-4 py-2.5 border-b border-gray-200">
        <form action="/katalog" method="GET">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Cari RAM, SSD, GPU bekas teruji..."
              className="w-full h-10 pl-9 pr-3 bg-gray-100 rounded-btn text-xs text-ink placeholder-gray-500 focus:outline-none focus:bg-white focus:border-yellow-500 border border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-yellow-50/60 to-white border-b border-gray-100 overflow-hidden py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200 text-[11px] sm:text-xs font-bold text-ink">
                <ShieldCheck className="size-3.5 sm:size-4 text-yellow-600" />
                <span>100% Teruji Fisik & Garansi Toko 7 Hari</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.2]">
                Beli Komponen PC Bekas{" "}
                <span className="text-yellow-600 underline decoration-yellow-500/40">
                  Tanpa Was-was
                </span>
              </h1>

              <p className="text-xs sm:text-base text-gray-700 max-w-2xl leading-relaxed">
                Platform konsinyasi hardware PC terpercaya (RAM, SSD, GPU). Setiap produk diuji
                menyeluruh dengan tes beban penuh sebelum tayang.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/katalog"
                  className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs sm:text-sm rounded-btn shadow-xs transition-all flex items-center gap-2"
                >
                  Jelajahi Katalog
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/titip-jual"
                  className="px-5 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-ink font-semibold text-xs sm:text-sm rounded-btn transition-colors"
                >
                  Titip Jual Barang
                </Link>
              </div>

              {/* Quick Category Badges */}
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500 overflow-x-auto no-scrollbar pb-1">
                <span className="font-semibold text-gray-700 text-[11px] shrink-0">Kategori:</span>
                <Link href="/katalog?kategori=RAM" className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-bold text-[11px] text-ink transition-colors shrink-0">
                  RAM DDR4/5
                </Link>
                <Link href="/katalog?kategori=SSD" className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-bold text-[11px] text-ink transition-colors shrink-0">
                  SSD NVMe
                </Link>
                <Link href="/katalog?kategori=GPU" className="px-3 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-bold text-[11px] text-ink transition-colors shrink-0">
                  VGA / GPU
                </Link>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-card p-5 sm:p-7 border border-gray-200 shadow-card space-y-4 sm:space-y-5">
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
                  <PackageCheck className="size-4.5 sm:size-5 text-yellow-600" />
                  Standar Pengujian Teknis Hinggo
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">RAM:</strong> MemTest86 & TM5 4 pass bebas error, pin emas bersih.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">SSD:</strong> CrystalDiskInfo Health terverifikasi, uji kecepatan normal.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">GPU:</strong> FurMark & 3DMark stress-test 15 menit, bebas artifact, port HDMI/DP aman.
                    </div>
                  </li>
                </ul>

                <div className="p-3 rounded-btn bg-yellow-50 border border-yellow-200 text-[11px] sm:text-xs text-yellow-900 leading-relaxed">
                  Video bukti rekaman tes hardware dapat ditonton langsung di setiap halaman produk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section - 2 Columns on Mobile */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink">
                Komponen Siap Kirim
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                Lolos inspeksi fisik & siap dikirim dengan garansi 7 hari toko.
              </p>
            </div>
            <Link
              href="/katalog"
              className="text-xs sm:text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
            >
              Lihat Semua
              <ChevronRight className="size-3.5 sm:size-4" />
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-card border border-dashed border-gray-300">
              <p className="text-gray-500 text-xs sm:text-sm">Belum ada barang yang sedang tayang saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How Consignment Works */}
      <section className="py-10 sm:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-3xl font-extrabold text-ink">
            Alur Titip Jual di Hinggo
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto mt-1 sm:mt-2">
            Praktis, aman, dan tanpa repot melayani tawar-menawar pembeli nakal.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12 text-left">
            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-200 shadow-xs">
              <div className="size-7 sm:size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-xs sm:text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-ink text-xs sm:text-base mb-1">Ajukan Online</h3>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Isi spesifikasi, foto fisik, KTP, dan bukti kepemilikan untuk screening awal.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-200 shadow-xs">
              <div className="size-7 sm:size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-xs sm:text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-ink text-xs sm:text-base mb-1">Kirim Barang</h3>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Kirim barang ke gudang Hinggo di Jakarta Selatan dan input nomor resi di dasbor.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-200 shadow-xs">
              <div className="size-7 sm:size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-xs sm:text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-ink text-xs sm:text-base mb-1">Uji & Tayang</h3>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Teknisi menguji hardware, membuat video pengujian, lalu menayangkannya ke katalog.
              </p>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-200 shadow-xs">
              <div className="size-7 sm:size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-xs sm:text-sm mb-3">
                4
              </div>
              <h3 className="font-bold text-ink text-xs sm:text-base mb-1">Pencairan Dana</h3>
              <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                Setelah garansi 7 hari selesai, hasil penjualan langsung ditransfer ke rekening bank Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
