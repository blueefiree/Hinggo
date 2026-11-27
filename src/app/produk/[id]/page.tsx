import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, TestReport } from "@/types";
import { ShieldCheck, Eye, CheckCircle2, Clock, Truck, Video, AlertCircle } from "lucide-react";
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <Link href="/katalog" className="hover:underline">Katalog</Link>
          <span>/</span>
          <Link href={`/katalog?kategori=${item.category}`} className="hover:underline">{item.category}</Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{item.model}</span>
        </div>

        {/* Unavailable Banner if not Tayang */}
        {!isAvailable && (
          <div className="mb-6 p-4 rounded-card bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
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

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Photos & Videos (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-4/3 rounded-card bg-gray-100 overflow-hidden border border-gray-200 relative">
              <img
                src={mainPhoto}
                alt={`${item.brand} ${item.model}`}
                className="size-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-ink text-white">
                  {item.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-success text-white flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="size-3.5" />
                  Lolos Uji Teknis
                </span>
              </div>
            </div>

            {/* Multi-photo Thumbnails */}
            {item.photos && item.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.photos.map((photo, idx) => (
                  <div key={idx} className="size-20 rounded-btn bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    <img src={photo} alt="" className="size-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* YouTube Test Video Embed if available */}
            {testReport?.youtube_video_url && (
              <div className="p-6 rounded-card bg-gray-50 border border-gray-200 space-y-3">
                <h3 className="font-bold text-ink text-base flex items-center gap-2">
                  <Video className="size-5 text-danger" />
                  Video Rekaman Pengujian Fisik
                </h3>
                <p className="text-xs text-gray-500">
                  Video bukti pengujian fungsi hardware oleh teknisi Hinggo sebelum barang disetujui tayang.
                </p>
                <div className="aspect-video rounded-btn overflow-hidden bg-black">
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

          {/* Product Details & Purchase Box (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold uppercase tracking-wider text-yellow-600">{item.brand}</span>
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5" />
                  {item.view_count || 1} dilihat
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">
                {item.model}
              </h1>

              <div className="mt-4 p-4 rounded-btn bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium">Harga Transparan</p>
                <p className="text-3xl font-black text-ink mt-0.5">
                  Rp {displayPrice.toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Termasuk garansi toko 7 hari & verifikasi kondisi unit asli.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <AddToCartButton item={item} isAvailable={isAvailable} />

            {/* Quick Specs */}
            <div className="p-5 rounded-card border border-gray-200 space-y-3">
              <h4 className="font-bold text-sm text-ink">Ringkasan Kondisi Unit</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Kondisi Fisik:</span>
                  <span className="font-semibold text-ink">{item.condition}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Lama Pemakaian:</span>
                  <span className="font-semibold text-ink">{item.usage_duration}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Kelengkapan:</span>
                  <span className="font-semibold text-ink">{item.completeness}</span>
                </div>
              </div>
            </div>

            {/* Technical Inspection Report Checklist */}
            {testReport && (
              <div className="p-5 rounded-card bg-emerald-50/50 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-ink flex items-center gap-1.5">
                    <ShieldCheck className="size-4.5 text-success" />
                    Hasil Uji Kategori ({item.category})
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-success text-white">
                    {testReport.test_result}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {testReport.checklist_results &&
                    Object.entries(testReport.checklist_results).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="size-4 text-success shrink-0" />
                        <span className="capitalize">{key.replace(/_/g, " ")}: <strong>{val ? "Lulus" : "Gagal"}</strong></span>
                      </div>
                    ))}
                </div>

                {testReport.tester_notes && (
                  <div className="text-xs text-gray-700 pt-2 border-t border-emerald-200/60">
                    <span className="font-semibold block text-ink">Catatan Teknisi:</span>
                    <p className="mt-0.5 italic text-gray-600">{testReport.tester_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Guarantee Callout */}
            <div className="p-4 rounded-card bg-gray-50 border border-gray-200 flex items-start gap-3 text-xs text-gray-600">
              <Clock className="size-4 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink block">Masa Garansi 7 Hari</strong>
                Barang dapat dicoba langsung saat tiba. Jika terjadi kendala fungsi, Anda dapat mengajukan klaim garansi di dasbor pesanan.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
