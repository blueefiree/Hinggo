"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Info,
  Camera,
  MessageSquare,
  Sparkles,
  Trash2,
  Plus,
  X,
  FileCheck2,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function NewConsignmentPage() {
  const router = useRouter();
  const { user, refreshConsignments } = useHingoStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Key draf spesifik email user sesuai Aturan 3
  const draftKey = `hingo_consignment_draft_${user?.email ? user.email.trim().toLowerCase() : (user?.id || "guest")}`;

  const [category, setCategory] = useState<"KEYBOARD" | "MOUSE" | "HEADSET" | "MONITOR" | "ACCESSORIES">("KEYBOARD");
  const [brandModel, setBrandModel] = useState("Keychron V1");
  const [variantSpec, setVariantSpec] = useState("75% · K Pro Brown · USB-C");
  const [usageDuration, setUsageDuration] = useState("10 bulan");
  const [additionalSpecs, setAdditionalSpecs] = useState(
    "Warna carbon black, hot-swap PCB, RGB south-facing, layout ANSI, keycaps OSA PBT."
  );
  const [currentCondition, setCurrentCondition] = useState("Bekas · berfungsi normal");
  const [defectDetails, setDefectDetails] = useState(
    "Ada gores halus di sisi bawah casing dekat kaki karet. Tombol dan knob volume normal."
  );
  const [completeness, setCompleteness] = useState(
    "Box lengkap, kabel braided Type-C to Type-C, adapter Type-A, switch puller, keycap puller."
  );
  const [expectedPrice, setExpectedPrice] = useState(850000);
  const [handoverMethod, setHandoverMethod] = useState("SHIP_AFTER_ONLINE");
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
  ]);
  const [urlInput, setUrlInput] = useState("");
  const [consentCheck, setConsentCheck] = useState({
    original: true,
    inspection: true,
    escrow: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // ====================================================================
  // ATURAN 3: PULIHKAN DRAF SAAT HALAMAN DIBUKA / DI-REFRESH
  // ====================================================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.brandModel) setBrandModel(parsed.brandModel);
        if (parsed.variantSpec) setVariantSpec(parsed.variantSpec);
        if (parsed.usageDuration) setUsageDuration(parsed.usageDuration);
        if (parsed.additionalSpecs !== undefined) setAdditionalSpecs(parsed.additionalSpecs);
        if (parsed.currentCondition) setCurrentCondition(parsed.currentCondition);
        if (parsed.defectDetails !== undefined) setDefectDetails(parsed.defectDetails);
        if (parsed.completeness) setCompleteness(parsed.completeness);
        if (parsed.expectedPrice) setExpectedPrice(Number(parsed.expectedPrice));
        if (parsed.handoverMethod) setHandoverMethod(parsed.handoverMethod);
        if (Array.isArray(parsed.photos) && parsed.photos.length > 0) setPhotos(parsed.photos);
        setDraftSavedAt("Draf terakhir dipulihkan otomatis");
      }
    } catch (err) {
      console.warn("Failed to restore draft:", err);
    }
    setHasRestoredDraft(true);
  }, [draftKey]);

  // ====================================================================
  // ATURAN 3: AUTO-SAVE KE LOCALSTORAGE PER EMAIL SETIAP PERUBAHAN INPUT
  // ====================================================================
  useEffect(() => {
    if (!hasRestoredDraft) return;
    try {
      const payload = {
        category,
        brandModel,
        variantSpec,
        usageDuration,
        additionalSpecs,
        currentCondition,
        defectDetails,
        completeness,
        expectedPrice,
        handoverMethod,
        photos,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
      setDraftSavedAt("Tersimpan otomatis");
    } catch (err) {
      console.warn("Auto-save draft failed:", err);
    }
  }, [
    hasRestoredDraft,
    draftKey,
    category,
    brandModel,
    variantSpec,
    usageDuration,
    additionalSpecs,
    currentCondition,
    defectDetails,
    completeness,
    expectedPrice,
    handoverMethod,
    photos,
  ]);

  // Upload Foto dari Perangkat (Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = "";
  };

  const handleAddPhotoUrl = () => {
    if (!urlInput.trim()) return;
    setPhotos((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Simpan Draf atau Kirim Pengajuan ke Database
  const handleSave = async (isDraft: boolean) => {
    setIsSubmitting(true);
    const payload = {
      category,
      brandModel,
      variantSpec,
      usageDuration,
      additionalSpecs,
      currentCondition,
      defectDetails,
      completeness,
      expectedPrice,
      originCity: user?.city || "Jakarta Selatan",
      handoverMethod:
        handoverMethod === "SHIP_AFTER_ONLINE"
          ? "Kirim via kurir setelah online check"
          : "Antar langsung ke gudang Jakarta",
      photos,
      isDraft,
    };

    try {
      const res = await fetch("/api/consignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengajuan titip jual ke database");
      }

      // Hapus draf sementara karena sudah sukses tersimpan permanen di database
      try {
        localStorage.removeItem(draftKey);
      } catch {}

      await refreshConsignments();
      alert(
        data.message ||
          (isDraft
            ? "Draf berhasil disimpan permanen di akunmu."
            : "Pengajuan titip jual berhasil dikirim ke database! Tim kurator Hingo akan mereview dalam 1×24 jam.")
      );
      router.push("/seller/consignments");
    } catch (e: any) {
      alert(e.message || "Terjadi kesalahan saat menyimpan ke database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Eyebrow & Title */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            RUANG PENJUAL / PENGAJUAN BARU
          </span>
          {draftSavedAt && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 animate-in fade-in">
              <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{draftSavedAt} (Anti-Hilang)</span>
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Gear menganggur? Titip jual aja.
          </h1>

          {/* 4-Step Pills */}
          <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
            <span className="rounded-full bg-[#FFC629] text-black px-3 py-1 shadow-xs">
              1 Pengecekan online
            </span>
            <span className="rounded-full bg-neutral-100 text-neutral-500 px-3 py-1">
              2 Kirim ke Hingo
            </span>
            <span className="rounded-full bg-neutral-100 text-neutral-500 px-3 py-1">
              3 Cek fisik
            </span>
            <span className="rounded-full bg-neutral-100 text-neutral-500 px-3 py-1">
              4 Hasil akhir
            </span>
          </div>
        </div>
      </div>

      {/* Instruction Banner */}
      <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
        <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
          <strong className="text-black font-bold">Tahap saat ini: Pengecekan online — </strong>
          Jangan kirim barang fisik sebelum pengajuanmu dinyatakan <strong>lolos review kurasi</strong> oleh tim Hingo.
          Isian form ini memiliki fitur <strong>Auto-Save per Akun</strong>, sehingga tidak akan hilang sekalipun halaman browser di-refresh.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 5-Part Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Part 01: Tentang Barangmu */}
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black text-[#1A1A1A] pb-3 border-b border-neutral-100">
                01 · Tentang barangmu
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kategori Gear
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] bg-white outline-none focus:border-[#FFC629]"
                  >
                    <option value="KEYBOARD">Keyboard Mechanical</option>
                    <option value="MOUSE">Mouse Wireless / Gaming</option>
                    <option value="HEADSET">Headset / Audio</option>
                    <option value="MONITOR">Monitor Gaming / Display</option>
                    <option value="ACCESSORIES">Aksesoris / Keycaps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nama Merek & Seri Model
                  </label>
                  <input
                    type="text"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="Contoh: Keychron V1"
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Varian / Spesifikasi Kunci
                  </label>
                  <input
                    type="text"
                    value={variantSpec}
                    onChange={(e) => setVariantSpec(e.target.value)}
                    placeholder="Contoh: 75% · K Pro Brown · USB-C"
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Lama Pemakaian
                  </label>
                  <input
                    type="text"
                    value={usageDuration}
                    onChange={(e) => setUsageDuration(e.target.value)}
                    placeholder="Contoh: 10 bulan"
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Spesifikasi Tambahan & Catatan Modifikasi
                </label>
                <textarea
                  rows={2}
                  value={additionalSpecs}
                  onChange={(e) => setAdditionalSpecs(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                />
              </div>
            </div>

            {/* Part 02: Kondisi & Kelengkapan */}
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black text-[#1A1A1A] pb-3 border-b border-neutral-100">
                02 · Kondisi & kelengkapan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kondisi Saat Ini
                  </label>
                  <select
                    value={currentCondition}
                    onChange={(e) => setCurrentCondition(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] bg-white outline-none focus:border-[#FFC629]"
                  >
                    <option value="Bekas · berfungsi normal">Bekas · berfungsi 100% normal</option>
                    <option value="Seperti baru · mulus">Seperti baru · mulus tanpa gores</option>
                    <option value="Ada cacat kosmetik minor">Ada goresan kosmetik minor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kelengkapan yang Ikut Dititipkan
                  </label>
                  <input
                    type="text"
                    value={completeness}
                    onChange={(e) => setCompleteness(e.target.value)}
                    placeholder="Contoh: Box original, kabel, keycap puller"
                    className="w-full rounded-xl border border-neutral-300 py-2.5 px-3.5 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Kondisi Aktual & Detail Cacat (Transparan)
                </label>
                <textarea
                  rows={2}
                  value={defectDetails}
                  onChange={(e) => setDefectDetails(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 p-3 text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                />
              </div>
            </div>

            {/* Part 03: Foto Barang Asli (Upload Lokal & URL) */}
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-black text-[#1A1A1A]">
                    03 · Foto barang asli
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Bisa unggah dari galeri HP/laptop atau masukkan URL foto. Minimal 1 foto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC629] hover:bg-[#FFC420] text-black font-extrabold px-3 py-1.5 text-xs shadow-xs transition"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>+ Unggah dari Perangkat</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* URL Input */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Atau tempel link URL foto langsung di sini..."
                  className="flex-1 rounded-xl border border-neutral-300 py-2 px-3 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="rounded-xl border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 text-xs font-bold text-neutral-700 transition"
                >
                  + Tambah Link
                </button>
              </div>

              {/* Photo Grid Preview */}
              {photos.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-neutral-300 p-8 text-center bg-neutral-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-neutral-100 transition"
                >
                  <Camera className="h-8 w-8 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-700">
                    Belum ada foto ditambahkan
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Klik di sini untuk memilih foto dari galeri HP / laptop
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photos.map((src, index) => (
                    <div
                      key={index}
                      className="group relative rounded-2xl border border-neutral-200 bg-[#F6F6F4] p-1.5 overflow-hidden aspect-4/3 flex items-center justify-center"
                    >
                      <img
                        src={src}
                        alt={`Foto ke-${index + 1}`}
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition"
                        title="Hapus foto ini"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>
                  ))}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border-2 border-dashed border-neutral-300 p-3 bg-neutral-50 flex flex-col items-center justify-center gap-1.5 aspect-4/3 cursor-pointer hover:bg-neutral-100 transition"
                  >
                    <Plus className="h-5 w-5 text-neutral-500" />
                    <span className="text-[11px] font-bold text-neutral-600 text-center">
                      + Tambah Foto
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Part 04: Harga yang Diharapkan */}
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black text-[#1A1A1A] pb-3 border-b border-neutral-100">
                04 · Harga yang kamu harapkan
              </h2>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Ekspektasi Harga Bersih (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 py-2.5 pl-10 pr-4 text-sm font-black text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Setelah inspeksi fisik, tim Hingo akan mengusulkan harga pasar terbaik.
                </p>
              </div>
            </div>

            {/* Part 05: Kontak & Penyerahan */}
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-4">
              <h2 className="text-base font-black text-[#1A1A1A] pb-3 border-b border-neutral-100">
                05 · Kontak & penyerahan
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-neutral-700">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Nama Lengkap</span>
                  <strong className="text-sm font-bold text-[#1A1A1A]">{user?.name || "-"}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Nomor WhatsApp</span>
                  <strong className="text-sm font-bold text-[#1A1A1A]">{user?.phone || "-"}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Email Terkunci (Identitas Sesi)</span>
                  <strong className="text-sm font-bold text-amber-900">{user?.email || "-"}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Kota Asal Pemilik</span>
                  <strong className="text-sm font-bold text-[#1A1A1A]">{user?.city || "Jakarta Selatan"}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-xs font-bold text-neutral-700 mb-2">
                  Metode Penyerahan Barang ke Hingo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setHandoverMethod("SHIP_AFTER_ONLINE")}
                    className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col gap-1 ${
                      handoverMethod === "SHIP_AFTER_ONLINE"
                        ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <strong className="text-xs font-bold text-[#1A1A1A]">
                      Kirim setelah lolos pengecekan online
                    </strong>
                    <span className="text-[11px] text-neutral-500">
                      Via JNE / J&T dengan nomor resi terdaftar ke gudang Jakarta
                    </span>
                  </div>

                  <div
                    onClick={() => setHandoverMethod("DROP_OFF")}
                    className={`cursor-pointer rounded-2xl p-4 border transition flex flex-col gap-1 ${
                      handoverMethod === "DROP_OFF"
                        ? "border-[#FFC629] bg-[#FFFBEB] ring-2 ring-[#FFC629]/30"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <strong className="text-xs font-bold text-[#1A1A1A]">
                      Antar langsung ke gudang
                    </strong>
                    <span className="text-[11px] text-neutral-500">
                      Sesuai arahan admin Hingo di Jakarta Selatan
                    </span>
                  </div>
                </div>
              </div>

              {/* Consent check */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2 text-xs text-neutral-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentCheck.original}
                    onChange={(e) =>
                      setConsentCheck({ ...consentCheck, original: e.target.checked })
                    }
                    className="h-4 w-4 rounded-md accent-[#FFC629]"
                  />
                  <span>Barang adalah unit original milik pribadi tanpa masalah hukum.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentCheck.inspection}
                    onChange={(e) =>
                      setConsentCheck({ ...consentCheck, inspection: e.target.checked })
                    }
                    className="h-4 w-4 rounded-md accent-[#FFC629]"
                  />
                  <span>
                    Saya bersedia barang diinspeksi fisik secara objektif oleh tim Hingo.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSave(true)}
                  className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan draf"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-6 py-3 text-xs font-bold text-black shadow-xs transition disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Mengirim..." : "Kirim untuk review"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Setelah kamu mengajukan
            </h3>

            <div className="flex flex-col gap-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFC629] text-[10px] font-black text-black">
                  1
                </span>
                <div>
                  <strong className="text-[#1A1A1A] block">Kurasi Online (1×24 Jam)</strong>
                  <span>Tim memeriksa foto dan kesesuaian harga pasar.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700">
                  2
                </span>
                <div>
                  <strong className="text-[#1A1A1A] block">Kirim Gear ke Hingo</strong>
                  <span>Kemas barang dengan aman dan masukkan nomor resi.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700">
                  3
                </span>
                <div>
                  <strong className="text-[#1A1A1A] block">Inspeksi Fisik</strong>
                  <span>Uji switch, sensor, baterai, dan port USB.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700">
                  4
                </span>
                <div>
                  <strong className="text-[#1A1A1A] block">Dipasarkan & Terjual</strong>
                  <span>Dana langsung cair begitu pembeli konfirmasi.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 shadow-xs flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[#1A1A1A]">
              Belum cocok? Tetap jelas.
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Jika hasil inspeksi fisik berbeda dari kesepakatan awal, kamu berhak meminta
              pengembalian barang tanpa penalti apa pun.
            </p>
            <Link
              href="/chat/product"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-neutral-300 py-2.5 px-4 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Tanya admin Hingo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
