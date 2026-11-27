import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item } from "@/types";
import { ShieldCheck, Cpu, HardDrive, Monitor, ArrowRight, CheckCircle2, ChevronRight, PackageCheck } from "lucide-react";

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-yellow-50/60 to-white border-b border-gray-100 overflow-hidden py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-xs font-bold text-ink">
                <ShieldCheck className="size-4 text-yellow-600" />
                <span>100% Teruji Fisik & Bergaransi Toko 7 Hari</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink leading-[1.15]">
                Beli Komponen PC Bekas{" "}
                <span className="text-yellow-600 underline decoration-yellow-500/40">
                  Tanpa Rasa Was-was
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-700 max-w-2xl leading-relaxed">
                Hinggo adalah platform konsinyasi periferal & komponen PC (RAM, SSD, GPU). Setiap produk diuji
                menyeluruh oleh teknisi kami dengan tes beban penuh sebelum tayang.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/katalog"
                  className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm sm:text-base rounded-btn shadow-sm transition-all flex items-center gap-2"
                >
                  Jelajahi Katalog
                  <ArrowRight className="size-4.5" />
                </Link>
                <Link
                  href="/titip-jual"
                  className="px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-ink font-semibold text-sm sm:text-base rounded-btn transition-colors flex items-center gap-2"
                >
                  Titip Jual Barang Anda
                </Link>
              </div>

              {/* Quick Category Badges */}
              <div className="pt-4 flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">Kategori Utama:</span>
                <Link href="/katalog?kategori=RAM" className="px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-semibold text-ink transition-colors">
                  RAM DDR4/5
                </Link>
                <Link href="/katalog?kategori=SSD" className="px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-semibold text-ink transition-colors">
                  SSD NVMe
                </Link>
                <Link href="/katalog?kategori=GPU" className="px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-yellow-500 font-semibold text-ink transition-colors">
                  VGA / GPU
                </Link>
              </div>
            </div>

            {/* Right Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-card p-6 sm:p-8 border border-gray-200 shadow-card space-y-6">
                <h3 className="font-bold text-ink text-lg flex items-center gap-2">
                  <PackageCheck className="size-5 text-yellow-600" />
                  Standar Pengujian Teknis Hinggo
                </h3>
                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">RAM:</strong> MemTest86 & TM5 4 pass bebas error, pin emas bebas korosi, dan XMP stabil.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">SSD:</strong> CrystalDiskInfo Health terverifikasi, uji kecepatan CrystalDiskMark, suhu aman.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink">GPU:</strong> FurMark & 3DMark stress-test 15 menit, kipas halus, bebas artifact, port HDMI/DP normal.
                    </div>
                  </li>
                </ul>

                <div className="p-4 rounded-btn bg-yellow-50 border border-yellow-200 text-xs text-yellow-900 leading-relaxed">
                  Laporan hasil pengujian dan rekaman video pengetesan dapat Anda tonton langsung di setiap halaman produk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
                Komponen Siap Kirim
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Seluruh barang berstatus Tayang telah lolos inspeksi teknis tim Hinggo.
              </p>
            </div>
            <Link
              href="/katalog"
              className="text-sm font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 transition-colors"
            >
              Lihat Semua
              <ChevronRight className="size-4" />
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-card border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">Belum ada barang yang sedang tayang saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How Consignment Works */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Cara Kerja Titip Jual di Hinggo
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mt-2">
            Praktis, aman, dan tanpa repot melayani tawar-menawar pembeli nakal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 text-left">
            <div className="bg-white p-6 rounded-card border border-gray-200 shadow-xs relative">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-ink text-base mb-1">Ajukan Online</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Isi form spesifikasi, foto barang, serta unggah KTP dan bukti kepemilikan untuk screening.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-gray-200 shadow-xs relative">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-ink text-base mb-1">Kirim ke Gudang</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Setelah disetujui, kirimkan barang ke gudang Hinggo di Jakarta Selatan dan input nomor resi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-gray-200 shadow-xs relative">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-ink text-base mb-1">Uji & Tayang</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tim teknisi menguji fungsi hardware, membuat video pengujian, lalu menayangkannya ke publik.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-gray-200 shadow-xs relative">
              <div className="size-8 rounded-full bg-yellow-500 text-ink font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h3 className="font-bold text-ink text-base mb-1">Terima Pencairan</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Setelah barang tiba di pembeli dan masa garansi 7 hari selesai, dana langsung ditransfer ke rekening Anda.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/titip-jual"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 font-bold text-sm text-ink rounded-btn shadow-sm transition-all"
            >
              Mulai Titip Jual Sekarang
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
