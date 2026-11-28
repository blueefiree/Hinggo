import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, TestReport } from "@/types";
import { ShieldCheck, Eye, CheckCircle2, Clock, Video, AlertCircle, Lock } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const revalidate = 0;

interface ProductDetailProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailProps) {
  const itemId = params.id;

  // 1. Fetch item
  const { data: itemData, error: itemErr } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (itemErr || !itemData) {
    notFound();
  }

  const item: Item = itemData as Item;

  // Increment view count asynchronously
  await supabaseAdmin
    .from("items")
    .update({ view_count: (item.view_count || 0) + 1 })
    .eq("id", itemId);

  // 2. Fetch test report
  const { data: testData } = await supabaseAdmin
    .from("test_reports")
    .select("*")
    .eq("item_id", itemId)
    .single();

  const testReport: TestReport | null = (testData as TestReport) || null;

  const isAvailable = item.status === "Tayang";
  const displayPrice = item.current_listing_price || item.expected_price;
  const mainPhoto = item.photos && item.photos.length > 0
    ? item.photos[0]
    : "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6 sm:py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8a8a8a] mb-6">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:underline">Katalog</Link>
          <span>/</span>
          <Link href={`/katalog?kategori=${item.category}`} className="hover:underline text-ink font-medium">
            {item.category}
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{item.model}</span>
        </div>

        {/* Unavailable Banner if not Tayang */}
        {!isAvailable && (
          <div className="mb-6 p-4 rounded-[16px] bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-900">Barang ini sedang Tidak Tersedia untuk Dibeli</p>
                <p className="text-xs text-amber-700">Status saat ini: {item.status}</p>
              </div>
            </div>
            <StatusBadge status={item.status} size="lg" />
          </div>
        )}

        {/* Main Product Layout — 12 Column Grid matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Photos & Technical Reports (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Product Image Container */}
            <div className="relative aspect-4/3 rounded-[20px] bg-[#fffbeb] overflow-hidden border border-[#ebebeb] flex items-center justify-center">
              <img
                src={mainPhoto}
                alt={`${item.brand} ${item.model}`}
                className="size-full object-cover"
              />

              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-ink/85 text-white tracking-wider uppercase backdrop-blur-xs">
                  {item.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1f9d55] flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="size-3.5 stroke-[2.5]" />
                  Lolos Uji Teknis
                </span>
              </div>
            </div>

            {/* Multi-photo Thumbnails */}
            {item.photos && item.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {item.photos.map((photo, idx) => (
                  <div key={idx} className="size-20 sm:size-24 rounded-[12px] bg-[#fffbeb] overflow-hidden border border-[#ebebeb] shrink-0 hover:border-yellow-500 transition-colors cursor-pointer">
                    <img src={photo} alt="" className="size-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Technical Inspection Report Checklist */}
            {testReport && (
              <div className="p-6 rounded-[20px] bg-white border border-[#ebebeb] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-emerald-100 text-[#1f9d55] flex items-center justify-center shrink-0">
                      <ShieldCheck className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-ink">
                        Laporan Uji Teknis Kategori {item.category}
                      </h4>
                      <p className="text-[11px] text-[#8a8a8a]">
                        Diuji oleh tim teknisi bersertifikasi Hinggo
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e6f6ec] text-[#1f9d55] border border-emerald-200">
                    {testReport.test_result === "PASSED" ? "LULUS UJI" : testReport.test_result}
                  </span>
                </div>

                {/* Checklist Results */}
                <div className="space-y-2.5 pt-1">
                  {testReport.checklist_results &&
                    Object.entries(testReport.checklist_results).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-[10px] bg-[#f6f6f4] text-xs">
                        <span className="text-[#4b4b4b] capitalize font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#1f9d55]">
                          <CheckCircle2 className="size-3.5" />
                          {val ? "Lulus / Normal" : "Gagal"}
                        </span>
                      </div>
                    ))}
                </div>

                {testReport.tester_notes && (
                  <div className="text-xs text-[#4b4b4b] pt-3 border-t border-[#ebebeb]">
                    <span className="font-semibold block text-ink mb-0.5">Catatan Teknisi:</span>
                    <p className="italic bg-[#fffbeb] p-3 rounded-[10px] border border-[#ffe58a]">
                      &ldquo;{testReport.tester_notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* YouTube Test Video Embed if available */}
            {testReport?.youtube_video_url && (
              <div className="p-6 rounded-[20px] bg-white border border-[#ebebeb] shadow-xs space-y-3">
                <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
                  <Video className="size-5 text-danger" />
                  Video Rekaman Pengujian Fisik
                </h3>
                <p className="text-xs text-[#8a8a8a]">
                  Video bukti pengujian fungsi hardware oleh teknisi Hinggo sebelum barang disetujui tayang.
                </p>
                <div className="aspect-video rounded-[12px] overflow-hidden bg-black shadow-xs">
                  <iframe
                    src={`https://www.youtube.com/embed/${testReport.youtube_video_url.includes("v=") ? testReport.youtube_video_url.split("v=")[1].split("&")[0] : "dQw4w9WgXcQ"}`}
                    title="Uji Teknis Hinggo"
                    className="size-full border-0"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Details & Purchase Box (Right 5 Cols - Sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-5">
              {/* Brand & Views */}
              <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                <span className="font-bold uppercase tracking-wider text-yellow-600">{item.brand}</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Eye className="size-3.5" />
                  {item.view_count || 1} dilihat
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
                {item.model}
              </h1>

              {/* Price card */}
              <div className="p-4 rounded-[12px] bg-[#fffbeb] border border-[#ffe58a]">
                <span className="text-[10px] text-[#8a8a8a] uppercase font-bold tracking-wider block">
                  Harga Tayang Bersih
                </span>
                <p className="text-3xl font-extrabold text-ink mt-0.5">
                  Rp {displayPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-[#4b4b4b] mt-1">
                  Termasuk garansi toko 7 hari & verifikasi kondisi unit asli.
                </p>
              </div>

              {/* Action Buttons */}
              <AddToCartButton item={item} isAvailable={isAvailable} />

              {/* Condition Specs Table */}
              <div className="pt-4 border-t border-[#ebebeb] space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#8a8a8a]">
                  Ringkasan Kondisi Unit
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-[10px] bg-[#f6f6f4]">
                    <span className="text-[#8a8a8a] block text-[10px]">Kondisi Fisik:</span>
                    <span className="font-semibold text-ink">{item.condition}</span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#f6f6f4]">
                    <span className="text-[#8a8a8a] block text-[10px]">Lama Pemakaian:</span>
                    <span className="font-semibold text-ink">{item.usage_duration}</span>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-[10px] bg-[#f6f6f4]">
                    <span className="text-[#8a8a8a] block text-[10px]">Kelengkapan:</span>
                    <span className="font-semibold text-ink">{item.completeness}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Callout — Figma node 10:25598 */}
            <div className="p-5 rounded-[20px] bg-white border border-[#ebebeb] shadow-xs flex items-start gap-3.5 text-xs text-[#4b4b4b]">
              <div className="size-9 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <strong className="text-ink font-bold block text-sm">Masa Garansi Toko 7 Hari</strong>
                <p className="leading-relaxed text-[#8a8a8a]">
                  Barang dapat dicoba langsung begitu tiba. Jika ada kendala teknis fungsi, ajukan klaim retur dengan mudah di dasbor pesanan Anda.
                </p>
              </div>
            </div>

            {/* Rekber Callout — Figma node 10:25623 */}
            <div className="p-5 rounded-[20px] bg-[#f6f6f4] border border-[#ebebeb] flex items-start gap-3.5 text-xs text-[#4b4b4b]">
              <div className="size-9 rounded-full bg-ink/10 text-ink flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="size-4.5" />
              </div>
              <div className="space-y-0.5">
                <strong className="text-ink font-bold block text-sm">Transaksi Aman Rekening Bersama (Rekber)</strong>
                <p className="leading-relaxed text-[#8a8a8a]">
                  Dana pembayaran Anda ditahan aman di Hinggo dan baru diteruskan ke consignor setelah masa garansi 7 hari selesai tanpa klaim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
