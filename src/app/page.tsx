import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item } from "@/types";
import {
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  Search,
  Clock,
  RefreshCcw,
  Truck,
  Cpu,
  HardDrive,
  Layers,
} from "lucide-react";

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
      <div className="md:hidden bg-white px-4 py-2.5 border-b border-[#ebebeb]">
        <form action="/katalog" method="GET">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
            <input
              type="text"
              name="q"
              placeholder="Cari keyboard, mouse, headset, monitor…"
              className="w-full h-10 pl-10 pr-3 bg-[#f6f6f4] rounded-[12px] text-xs text-ink placeholder-[#8a8a8a] focus:outline-none focus:bg-white focus:border-yellow-500 border border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#fffbeb]/40 border-b border-[#ebebeb] overflow-hidden py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ebebeb] text-[11px] sm:text-xs font-semibold text-[#1f9d55] shadow-xs">
                <ShieldCheck className="size-3.5 sm:size-4 text-[#1f9d55]" />
                <span>Konsinyasi dikelola tim kami &bull; Garansi 7 Hari</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.18]">
                Beli Komponen PC Bekas{" "}
                <span className="text-yellow-600 underline decoration-yellow-500/40">
                  Tanpa Was-was
                </span>
              </h1>

              <p className="text-xs sm:text-base text-[#4b4b4b] max-w-2xl leading-relaxed">
                Platform konsinyasi hardware PC terpercaya (RAM, SSD, GPU). Setiap produk diuji
                menyeluruh dengan tes beban penuh sebelum tayang ke pembeli.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/katalog"
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs sm:text-sm rounded-[12px] shadow-sm transition-all flex items-center gap-2"
                >
                  Belanja sekarang
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/kebijakan#rekber"
                  className="px-6 py-3 bg-white hover:bg-gray-50 border border-[#ebebeb] text-ink font-semibold text-xs sm:text-sm rounded-[12px] transition-colors"
                >
                  Lihat cara Rekber
                </Link>
                <Link
                  href="/titip-jual"
                  className="px-6 py-3 bg-[#f6f6f4] hover:bg-gray-200 text-ink font-semibold text-xs sm:text-sm rounded-[12px] transition-colors"
                >
                  Titip Jual Barang
                </Link>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[20px] p-5 sm:p-7 border border-[#ebebeb] shadow-card space-y-4 sm:space-y-5">
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
                  <PackageCheck className="size-4.5 sm:size-5 text-yellow-600" />
                  Standar Pengujian Teknis Hinggo
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-[#4b4b4b]">
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">RAM:</strong> MemTest86 & TM5 4 pass bebas error, pin emas bersih bebas korosi.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">SSD:</strong> CrystalDiskInfo Health terverifikasi, uji kecepatan baca/tulis normal.
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 sm:size-4.5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">GPU:</strong> FurMark & 3DMark stress-test 15 menit, bebas artifact, port HDMI/DP aman.
                    </div>
                  </li>
                </ul>

                <div className="p-3 rounded-[12px] bg-[#fffbeb] border border-[#ffe58a] text-[11px] sm:text-xs text-[#4b4b4b] leading-relaxed">
                  Video bukti rekaman tes hardware dapat ditonton langsung di setiap halaman produk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Row Section — Figma node 6:92 */}
      <section className="bg-white border-b border-[#ebebeb] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#f6f6f4]/60">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-ink">Garansi 7 hari</p>
              <p className="text-[11px] text-[#8a8a8a]">Perlindungan untuk pembeli</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#f6f6f4]/60">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0">
              <RefreshCcw className="size-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-ink">Fee Rp 10.000 atau 5%</p>
              <p className="text-[11px] text-[#8a8a8a]">Biaya layanan titip jual</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#f6f6f4]/60">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-ink">Penitipan 60 hari</p>
              <p className="text-[11px] text-[#8a8a8a]">Masa penitipan barang di Hinggo</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#f6f6f4]/60">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-ink">Pengiriman terlacak</p>
              <p className="text-[11px] text-[#8a8a8a]">Resi otomatis di setiap pesanan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Populer Section — Figma node 6:126 */}
      <section className="py-8 sm:py-12 bg-white border-b border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink">
                Kategori populer
              </h2>
              <p className="text-xs sm:text-sm text-[#8a8a8a] mt-0.5">
                Mulai dari yang paling dicari
              </p>
            </div>
            <Link
              href="/katalog"
              className="text-xs sm:text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
            >
              Lihat semua
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Link
              href="/katalog?kategori=RAM"
              className="group p-5 rounded-[16px] border border-[#ebebeb] hover:border-yellow-500 bg-[#f6f6f4]/40 hover:bg-yellow-50/30 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="font-extrabold text-lg sm:text-xl text-ink group-hover:text-yellow-600 transition-colors block">
                  RAM DDR4 & DDR5
                </span>
                <p className="text-xs text-[#8a8a8a]">Tersedia modul teruji MemTest86</p>
              </div>
              <div className="size-12 rounded-[12px] bg-yellow-500/20 text-yellow-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Layers className="size-6" />
              </div>
            </Link>

            <Link
              href="/katalog?kategori=SSD"
              className="group p-5 rounded-[16px] border border-[#ebebeb] hover:border-yellow-500 bg-[#f6f6f4]/40 hover:bg-yellow-50/30 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="font-extrabold text-lg sm:text-xl text-ink group-hover:text-yellow-600 transition-colors block">
                  SSD NVMe & SATA
                </span>
                <p className="text-xs text-[#8a8a8a]">Kesehatan CrystalDisk terverifikasi</p>
              </div>
              <div className="size-12 rounded-[12px] bg-yellow-500/20 text-yellow-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <HardDrive className="size-6" />
              </div>
            </Link>

            <Link
              href="/katalog?kategori=GPU"
              className="group p-5 rounded-[16px] border border-[#ebebeb] hover:border-yellow-500 bg-[#f6f6f4]/40 hover:bg-yellow-50/30 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="font-extrabold text-lg sm:text-xl text-ink group-hover:text-yellow-600 transition-colors block">
                  VGA / GPU Card
                </span>
                <p className="text-xs text-[#8a8a8a]">Lolos uji stress FurMark bebas artifact</p>
              </div>
              <div className="size-12 rounded-[12px] bg-yellow-500/20 text-yellow-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Cpu className="size-6" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Items Section — 2 Columns on Mobile, 4 Columns on Desktop */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink">
                Komponen Siap Kirim
              </h2>
              <p className="text-xs sm:text-sm text-[#8a8a8a] mt-0.5 sm:mt-1">
                Paling banyak dicari & siap dikirim dengan garansi toko 7 hari.
              </p>
            </div>
            <Link
              href="/katalog"
              className="text-xs sm:text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
            >
              Lihat semua
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-[#f6f6f4] rounded-[16px] border border-dashed border-[#ebebeb]">
              <p className="text-[#8a8a8a] text-xs sm:text-sm">Belum ada barang yang sedang tayang saat ini.</p>
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

      {/* How Consignment Works / Cara Kerja — Figma node 6:346 */}
      <section className="py-12 sm:py-16 bg-[#f6f6f4]/60 border-t border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Rekber: belanja online tanpa was-was
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8a8a] mt-2">
              Kamu bayar lewat sistem rekber Hinggo. Dana baru diteruskan ke penjual setelah barang diterima dan garansi 7 hari terlewati.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 rounded-[16px] border border-[#ebebeb] shadow-xs space-y-3">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-ink text-sm sm:text-base">Ajukan barang</h3>
              <p className="text-xs text-[#4b4b4b] leading-relaxed">
                Isi spesifikasi, foto fisik, KTP, dan bukti kepemilikan untuk screening awal oleh admin.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[16px] border border-[#ebebeb] shadow-xs space-y-3">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-ink text-sm sm:text-base">Screening & uji oleh Hinggo</h3>
              <p className="text-xs text-[#4b4b4b] leading-relaxed">
                Kirim barang ke gudang. Teknisi melakukan uji stres beban penuh hingga tuntas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[16px] border border-[#ebebeb] shadow-xs space-y-3">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-ink text-sm sm:text-base">Tayang di katalog</h3>
              <p className="text-xs text-[#4b4b4b] leading-relaxed">
                Setelah lolos uji, produk tayang di katalog dengan video rekaman uji teknis asli.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[16px] border border-[#ebebeb] shadow-xs space-y-3">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-extrabold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-ink text-sm sm:text-base">Dibayar setelah garansi 7 hari</h3>
              <p className="text-xs text-[#4b4b4b] leading-relaxed">
                Dana hasil penjualan langsung ditransfer ke rekening bank penjual tanpa potongan tersembunyi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
