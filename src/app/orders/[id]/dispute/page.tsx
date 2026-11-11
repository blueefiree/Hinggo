"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Upload,
  Camera,
  Video,
  ShieldCheck,
  ChevronRight,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function OrderDisputePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useHingoStore();

  const orderId = (params?.id as string) || "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      id: "FUNCTION_DEFECT",
      label: "Tombol / fungsi / switch bermasalah",
      desc: "Tombol macet, switch chattering, scroll wheel lompat, atau bluetooth gagal pairing.",
    },
    {
      id: "COSMETIC_MISMATCH",
      label: "Kondisi fisik tidak sesuai laporan inspeksi",
      desc: "Ada retak, baret dalam, atau cacat kasat mata yang tidak tercantum di laporan kurator.",
    },
    {
      id: "MISSING_PARTS",
      label: "Kelengkapan kurang / tidak ada",
      desc: "Kabel, dongle USB wireless, box, atau keycap puller tidak ada di dalam paket.",
    },
    {
      id: "SHIPPING_DAMAGE",
      label: "Paket rusak saat pengiriman kurir",
      desc: "Kardus penyok parah, basah, atau barang pecah saat dibuka.",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [description, setDescription] = useState(
    "Saat mencoba tombol Spacebar dan Bluetooth channel 2, koneksi sering terputus-putus dan switch terasa agak seret dibanding tombol lainnya."
  );
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([
    "unboxing_video_k2.mp4",
    "foto_spacebar_detail.jpg",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          setOrder(null);
          return;
        }
        const data = await res.json();
        setOrder(data.order || null);
      } catch (err) {
        console.error("Error fetching order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleAddSampleFile = () => {
    setEvidenceFiles((prev) => [...prev, `bukti_tambahan_${prev.length + 1}.jpg`]);
  };

  const handleRemoveFile = (idx: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Mohon jelaskan kendala yang kamu temukan secara rinci.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order?.id || orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCategory: selectedCategory,
          description: description.trim(),
          evidenceUrls: evidenceFiles,
        }),
      });

      if (res.ok) {
        showToast("Laporan kendala berhasil dikirimkan ke CS!");
        router.push(`/orders/${order?.orderCode || orderId}?dispute=created`);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengirimkan laporan kendala");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mengirimkan laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
        <p className="text-sm font-semibold text-neutral-500">Memuat formulir laporan kendala...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-neutral-500 max-w-md">
          Pesanan dengan kode <span className="font-mono font-bold text-neutral-700">{orderId}</span> tidak ditemukan.
        </p>
        <Link
          href="/orders"
          className="rounded-xl bg-[#1A1A1A] text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 transition"
        >
          Kembali ke Daftar Transaksi
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
        <Link href="/orders" className="hover:text-black">
          TRANSAKSI
        </Link>
        <span>/</span>
        <Link href={`/orders/${order.orderCode}`} className="hover:text-black">
          {order.orderCode}
        </Link>
        <span>/</span>
        <span className="text-[#1A1A1A] font-bold">LAPORKAN MASALAH</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-red-100 text-red-800 px-3 py-0.5 text-xs font-bold border border-red-200">
            Pusat Resolusi Escrow Hingo
          </span>
          <span className="font-mono text-xs font-bold text-neutral-400">{order.orderCode}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
          Laporkan Kendala Barang
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          Uang pembayaranmu senilai {formatRupiah(order.totalAmount)} tetap dibekukan di rekening Hingo hingga kendala ini selesai ditangani bersama CS.
        </p>
      </div>

      {/* Escrow Protection Banner */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-5 sm:p-6 mb-8 flex items-start gap-4 shadow-xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFC629] text-black">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1 text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
          <strong className="text-black font-bold block mb-1">
            Dana {formatRupiah(order.totalAmount)} Tetap Aman Ditahan Hingo
          </strong>
          Penjual tidak akan menerima pencairan sepeser pun sampai tim teknisi dan CS Hingo
          memeriksa bukti yang kamu kirimkan. Kamu berhak atas retur pengembalian dana 100% jika barang terbukti tidak sesuai.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Step 1: Category Selection */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-extrabold text-[#1A1A1A]">
              1. Pilih Kategori Masalah
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Pilih kendala yang paling sesuai dengan kondisi barang yang kamu terima.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col gap-1.5 ${
                  selectedCategory === cat.id
                    ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {cat.label}
                  </span>
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                    className="accent-[#FFC629]"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {cat.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Description Detail */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-extrabold text-[#1A1A1A]">
              2. Jelaskan Kendala Secara Detail
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Ceritakan bagian mana yang rusak atau tidak berfungsi saat kamu menguji gear.
            </p>
          </div>

          <label htmlFor="disputeDescription" className="sr-only">Jelaskan Kendala Secara Detail</label>
          <textarea
            id="disputeDescription"
            name="disputeDescription"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Lampu backlight RGB sisi kanan mati total, dan tombol F5 tidak merespon saat ditekan..."
            className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] p-4 text-xs sm:text-sm text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
          />
        </div>

        {/* Step 3: Evidence Files */}
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#1A1A1A]">
                3. Unggah Bukti Video Unboxing & Foto Cacat
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Wajib sertakan video tanpa terputus saat pertama membuka kemasan paket.
              </p>
            </div>
            <span className="text-xs font-bold text-neutral-400">
              {evidenceFiles.length} file terunggah
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {evidenceFiles.map((fname, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-[#F6F6F4] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {fname.endsWith(".mp4") ? (
                    <Video className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Camera className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="font-semibold text-neutral-800">{fname}</span>
                  <span className="text-[10px] text-neutral-400">
                    {fname.endsWith(".mp4") ? "Video · 24.5 MB" : "Foto · 2.1 MB"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Dropzone Box */}
            <button
              type="button"
              onClick={handleAddSampleFile}
              className="rounded-2xl border-2 border-dashed border-neutral-300 p-6 flex flex-col items-center justify-center gap-2 bg-[#F6F6F4]/50 hover:bg-[#FFFBEB] hover:border-[#FFC629] transition text-center cursor-pointer"
            >
              <Upload className="h-6 w-6 text-neutral-400" />
              <div className="text-xs font-bold text-neutral-800">
                Tarik file ke sini atau <span className="text-amber-800 underline">pilih dari galeri</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                Format MP4, MOV, JPG, PNG (Maks 100MB per file)
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link
            href={`/orders/${order.orderCode}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition text-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-8 py-3.5 text-xs sm:text-sm font-black text-white shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Mengirim Laporan...</span>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Kirim Laporan & Tahan Dana Escrow</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
