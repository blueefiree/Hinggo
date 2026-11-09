"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Send,
  Building2,
  DollarSign,
  UserCheck,
  Package,
  Clock,
  ArrowRight,
  Eye,
  Check,
  X,
  MessageSquare,
  Search,
  RefreshCw,
  Plus,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    user,
    role,
    setRole,
    logout,
    consignments,
    orders,
    payouts,
    chatThreads,
    sendMessage,
    adminApproveKyc,
    adminSubmitInspection,
    adminReleaseEscrow,
    adminUpdateTracking,
  } = useHingoStore();

  const [activeTab, setActiveTab] = useState<"kyc" | "inspection" | "orders" | "chat" | "add_product">("kyc");

  // KYC review state
  const [kycFeedback, setKycFeedback] = useState<string | null>(null);

  // Inspection form state
  const [selectedConsignmentCode, setSelectedConsignmentCode] = useState<string>("HG-261018-031");
  const selectedConsignment =
    consignments.find((c) => c.code === selectedConsignmentCode) || consignments[0];

  const [inspectionSpecs, setInspectionSpecs] = useState(
    "Sensor Darkfield 8000 DPI, koneksi Logi Bolt & Bluetooth, baterai 500mAh"
  );
  const [inspectionFunction, setInspectionFunction] = useState(
    "Sensor optik 100% responsif, MagSpeed scroll wheel normal, semua 7 tombol klik senyap dan taktil."
  );
  const [inspectionCosmetic, setInspectionCosmetic] = useState(
    "Terdapat gores halus pada area karet sandaran jempol kiri bekas gesekan jam tangan. Casing atas mulus."
  );
  const [inspectionCompleteness, setInspectionCompleteness] = useState(
    "Unit mouse, receiver Logi Bolt USB, kabel USB-C original, box lengkap."
  );
  const [inspectionPrice, setInspectionPrice] = useState<number>(950000);
  const [inspectionSubmitted, setInspectionSubmitted] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // New Catalog Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("KEYBOARD");
  const [newProdCondition, setNewProdCondition] = useState("Sangat baik");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState("");
  const [newProdVariant, setNewProdVariant] = useState("");
  const [newProdCompleteness, setNewProdCompleteness] = useState("Unit lengkap dengan box");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImageUrl, setNewProdImageUrl] = useState("");
  const [isSubmittingNewProd, setIsSubmittingNewProd] = useState(false);
  const [newProdSuccessMsg, setNewProdSuccessMsg] = useState<string | null>(null);

  // Escrow tracking state
  const [trackingInput, setTrackingInput] = useState<string>("JNE2201040842");
  const [escrowSuccessMsg, setEscrowSuccessMsg] = useState<string | null>(null);

  // Chat reply state
  const [activeThreadId, setActiveThreadId] = useState<string>("support");
  const [chatSender, setChatSender] = useState<"ADMIN" | "CS">("CS");
  const [replyText, setReplyText] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleKycAction = (action: "VERIFIED" | "NEEDS_REVISION") => {
    adminApproveKyc(action);
    setKycFeedback(
      action === "VERIFIED"
        ? "✓ Dokumen KTP & Selfie berhasil disetujui. Akun kini berstatus VERIFIED."
        : "Permintaan revisi dokumen dikirimkan ke Pengguna."
    );
    setTimeout(() => setKycFeedback(null), 4000);
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Math.round(inspectionPrice * 0.08); // 8%
    const handling = 19000;
    const net = inspectionPrice - fee - handling;

    adminSubmitInspection(
      selectedConsignmentCode,
      {
        specs: inspectionSpecs,
        functionTest: inspectionFunction,
        conditionAndDefect: inspectionCosmetic,
        completenessReceived: inspectionCompleteness,
      },
      inspectionPrice,
      fee,
      net
    );

    setInspectionSubmitted(true);
    setTimeout(() => setInspectionSubmitted(false), 3500);
  };

  const handleApproveAndPublish = async () => {
    try {
      const res = await fetch(`/api/consignments/${selectedConsignmentCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_PRICE",
          proposedPrice: inspectionPrice,
        }),
      });

      if (res.ok) {
        setPublishSuccessMsg(`✓ Barang titipan ${selectedConsignmentCode} berhasil lolos inspeksi dan resmi tayang di Katalog!`);
      } else {
        // Direct product publish fallback
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedConsignment?.brandModel || "Peripheral Gaming Hingo",
            brand: selectedConsignment?.brandModel?.split(" ")[0] || "HINGO",
            category: selectedConsignment?.category || "KEYBOARD",
            condition: "Sangat baik",
            price: inspectionPrice,
            originalNewPrice: Math.round(inspectionPrice * 1.5),
            switchOrVariant: inspectionSpecs.slice(0, 40),
            completeness: inspectionCompleteness,
            description: `${inspectionFunction}. ${inspectionCosmetic}`,
            defectNotes: inspectionCosmetic,
            images: selectedConsignment?.photos || [],
          }),
        });
        setPublishSuccessMsg(`✓ Barang titipan berhasil lolos inspeksi dan resmi diterbitkan ke Katalog!`);
      }
      setTimeout(() => setPublishSuccessMsg(null), 5000);
    } catch (e: any) {
      alert("Gagal menayangkan barang ke katalog: " + e.message);
    }
  };

  const handleCreateNewCatalogProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert("Nama dan harga produk wajib diisi");
      return;
    }
    setIsSubmittingNewProd(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          brand: newProdBrand || "CUSTOM",
          category: newProdCategory,
          condition: newProdCondition,
          price: Number(newProdPrice),
          originalNewPrice: newProdOriginalPrice ? Number(newProdOriginalPrice) : undefined,
          switchOrVariant: newProdVariant || "Varian Standar",
          completeness: newProdCompleteness,
          description: newProdDesc,
          images: newProdImageUrl ? [newProdImageUrl] : [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewProdSuccessMsg(`✓ "${newProdName}" berhasil diterbitkan ke database Katalog! Silakan cek di /catalog.`);
        setNewProdName("");
        setNewProdBrand("");
        setNewProdPrice("");
        setNewProdOriginalPrice("");
        setNewProdVariant("");
        setNewProdDesc("");
        setNewProdImageUrl("");
        setTimeout(() => setNewProdSuccessMsg(null), 6000);
      } else {
        alert(data.error || "Gagal menambahkan produk");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmittingNewProd(false);
    }
  };

  const handleReleaseEscrow = (orderCode: string) => {
    adminReleaseEscrow(orderCode);
    setEscrowSuccessMsg(`Dana escrow ${orderCode} berhasil dicairkan ke rekening penjual!`);
    setTimeout(() => setEscrowSuccessMsg(null), 4000);
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessage(activeThreadId, replyText.trim(), chatSender);
    setReplyText("");
  };

  const currentChatThread =
    chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Top Banner with Role Switch */}
      <div className="rounded-3xl bg-[#1A1A1A] text-white p-6 sm:p-8 mb-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFC629] text-black font-black text-xl">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Internal Hingo Back-Office
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Panel Kurator & Inspeksi Hingo
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kelola verifikasi KYC, penentuan harga konsinyasi, pencairan escrow, dan CS support.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (user?.role === "ADMIN") {
                await logout();
              } else {
                setRole("USER");
                router.push(user ? "/account" : "/");
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition border border-white/15 cursor-pointer"
          >
            <span>Beralih ke Tampilan Pengguna ({user && user.role !== "ADMIN" ? user.name : "Tamu / Belum Login"})</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-xs">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Verifikasi KYC</span>
            <strong className="text-xl font-black text-neutral-900">
              {user?.kycStatus === "VERIFIED" ? "0 Pending" : "1 Menunggu"}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Titipan Perlu Review</span>
            <strong className="text-xl font-black text-neutral-900">4 Barang</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Escrow Aktif</span>
            <strong className="text-xl font-black text-neutral-900">Rp875.500</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Pencairan Sukses</span>
            <strong className="text-xl font-black text-neutral-900">{payouts.length} Mutasi</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-6 overflow-x-auto text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("kyc")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "kyc"
              ? "bg-[#FFC629] text-black font-black shadow-xs"
              : "bg-[#F6F6F4] text-neutral-600 hover:text-black"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Verifikasi KYC ({user?.kycStatus === "VERIFIED" ? "Selesai" : "1 Pending"})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inspection")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "inspection"
              ? "bg-[#FFC629] text-black font-black shadow-xs"
              : "bg-[#F6F6F4] text-neutral-600 hover:text-black"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Inspeksi Fisik & Penetapan Harga</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-[#FFC629] text-black font-black shadow-xs"
              : "bg-[#F6F6F4] text-neutral-600 hover:text-black"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Kelola Escrow & Resi Pembeli ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "chat"
              ? "bg-[#FFC629] text-black font-black shadow-xs"
              : "bg-[#F6F6F4] text-neutral-600 hover:text-black"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Live Support Desk (Admin / CS Mira)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("add_product")}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === "add_product"
              ? "bg-[#FFC629] text-black font-black shadow-xs"
              : "bg-[#F6F6F4] text-neutral-600 hover:text-black"
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>+ Tambah Produk Katalog</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {kycFeedback && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
          {kycFeedback}
        </div>
      )}

      {/* TAB 1: VERIFIKASI KYC */}
      {activeTab === "kyc" && (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1A]">
                Peninjauan Dokumen Identitas (KYC)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verifikasi kesesuaian dokumen KTP dengan foto selfie wajah pemilik gear.
              </p>
            </div>
            <StatusBadge
              label={user?.kycStatus === "VERIFIED" ? "Terverifikasi" : "Menunggu Persetujuan Admin"}
              variant={user?.kycStatus === "VERIFIED" ? "verified" : "warning"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* KTP Document Card */}
            <div className="rounded-2xl border border-neutral-200 bg-[#F6F6F4] p-5 flex flex-col gap-3">
              <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                1. Foto e-KTP Pemohon
              </span>
              <div className="relative aspect-16/10 rounded-xl bg-neutral-800 text-white p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">
                      REPUBLIK INDONESIA · e-KTP
                    </span>
                    <div className="font-mono font-black text-sm text-amber-400 mt-1">
                      {user?.kycDocument?.maskedNik || "3174**********01"}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-sm">
                    {user?.kycDocument?.ktpFileSize || "1.8 MB"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold block">{user?.name || "Pemohon KYC"}</span>
                  <span className="text-[10px] text-neutral-400">{user?.city || "Jakarta Selatan"}</span>
                </div>

                <div className="absolute right-3 bottom-3 h-12 w-10 bg-neutral-600 rounded-sm border border-neutral-500 flex items-center justify-center text-[9px] text-neutral-300">
                  Pasfoto
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                Nama file: <code className="font-mono text-black">{user?.kycDocument?.ktpFileName || "ktp_sample.jpg"}</code>
              </span>
            </div>

            {/* Selfie Document Card */}
            <div className="rounded-2xl border border-neutral-200 bg-[#F6F6F4] p-5 flex flex-col gap-3">
              <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                2. Foto Selfie Wajah
              </span>
              <div className="relative aspect-16/10 rounded-xl bg-neutral-800 text-white p-4 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">
                    Liveness Verification
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-sm">
                    {user?.kycDocument?.selfieFileSize || "2.1 MB"}
                  </span>
                </div>

                <div className="flex items-center justify-center flex-1">
                  <div className="h-16 w-16 rounded-full bg-neutral-600 border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-neutral-200">
                    Selfie
                  </div>
                </div>

                <div className="text-center text-[10px] text-neutral-400">
                  Wajah terlihat jelas tanpa kacamata hitam
                </div>
              </div>
              <span className="text-[11px] text-neutral-500">
                Nama file: <code className="font-mono text-black">{user?.kycDocument?.selfieFileName || "selfie_sample.jpg"}</code>
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => handleKycAction("NEEDS_REVISION")}
              className="px-5 py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition cursor-pointer"
            >
              Minta Pengguna Unggah Ulang Foto
            </button>
            <button
              type="button"
              onClick={() => handleKycAction("VERIFIED")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Setujui Verifikasi KYC</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: INSPEKSI FISIK & PENETAPAN HARGA */}
      {activeTab === "inspection" && (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1A]">
                Input Laporan Inspeksi Fisik & Rincian Biaya
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Catat hasil tes laboratorium teknisi Hingo untuk gear yang berada di gudang.
              </p>
            </div>
          </div>

          {inspectionSubmitted && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              ✓ Laporan inspeksi fisik dan usulan harga berhasil dikirimkan ke akun Penjual!
            </div>
          )}

          {publishSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              {publishSuccessMsg}
            </div>
          )}

          <form onSubmit={handleInspectionSubmit} className="flex flex-col gap-5 text-xs">
            {/* Gear Selector */}
            <div>
              <label className="block font-bold text-neutral-700 mb-1.5">
                Pilih Barang Titipan di Gudang
              </label>
              <select
                value={selectedConsignmentCode}
                onChange={(e) => setSelectedConsignmentCode(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
              >
                {consignments.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} · {c.brandModel} ({c.badgeLabel})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  1. Hasil Uji Fungsi Elektronik
                </label>
                <textarea
                  rows={2}
                  required
                  value={inspectionFunction}
                  onChange={(e) => setInspectionFunction(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  2. Catatan Kondisi Fisik & Cacat Kosmetik
                </label>
                <textarea
                  rows={2}
                  required
                  value={inspectionCosmetic}
                  onChange={(e) => setInspectionCosmetic(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  3. Spesifikasi Teknis Terverifikasi
                </label>
                <textarea
                  rows={2}
                  required
                  value={inspectionSpecs}
                  onChange={(e) => setInspectionSpecs(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  4. Kelengkapan Fisik Diterima
                </label>
                <textarea
                  rows={2}
                  required
                  value={inspectionCompleteness}
                  onChange={(e) => setInspectionCompleteness(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>
            </div>

            {/* Price Proposal & Automatic Fee Calc */}
            <div className="rounded-2xl bg-[#FFFBEB] p-5 border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  Usulan Harga Jual ke Pembeli (Rp)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={inspectionPrice}
                  onChange={(e) => setInspectionPrice(Number(e.target.value))}
                  className="rounded-xl border border-amber-300 bg-white px-3.5 py-2 font-mono text-base font-bold text-[#1A1A1A] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs text-neutral-700 text-right sm:border-l sm:border-amber-200/80 sm:pl-6">
                <div>
                  Komisi Hingo (8%):{" "}
                  <strong>- {formatRupiah(Math.round(inspectionPrice * 0.08))}</strong>
                </div>
                <div>
                  Biaya Penanganan: <strong>- Rp19.000</strong>
                </div>
                <div className="text-sm font-black text-[#16A34A] pt-1">
                  Hasil Bersih Penjual:{" "}
                  {formatRupiah(inspectionPrice - Math.round(inspectionPrice * 0.08) - 19000)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleApproveAndPublish}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Loloskan Inspeksi & Tayangkan ke Katalog</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Kirim Rincian Biaya & Hasil Bersih ke Penjual</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: KELOLA ESCROW & RESI */}
      {activeTab === "orders" && (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="pb-3 border-b border-neutral-100">
            <h2 className="text-base font-extrabold text-[#1A1A1A]">
              Manajemen Pesanan Rekening Bersama (Escrow)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Update resi kurir pengiriman dan eksekusi pencairan dana ke rekening penjual.
            </p>
          </div>

          {escrowSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              ✓ {escrowSuccessMsg}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-2xl border border-neutral-200 p-5 bg-[#F6F6F4] flex flex-col gap-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{ord.orderCode}</span>
                    <span className="text-neutral-400">·</span>
                    <span>Pembeli: {ord.buyerName}</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.escrowStatus === "RELEASED_TO_SELLER"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : ord.escrowStatus === "DISPUTED"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    Escrow: {ord.escrowStatus}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#1A1A1A]">
                      {ord.product?.name} ({formatRupiah(ord.totalAmount)})
                    </h4>
                    <p className="text-neutral-500 text-[11px] mt-0.5">
                      Alamat: {ord.buyerAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.escrowStatus === "HELD_BY_HINGO" && (
                      <button
                        type="button"
                        onClick={() => handleReleaseEscrow(ord.orderCode)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Cairkan Dana ke Penjual
                      </button>
                    )}
                    <Link
                      href={`/orders/${ord.orderCode}`}
                      className="px-4 py-2 rounded-xl bg-white border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-50 transition"
                    >
                      Buka Pesanan
                    </Link>
                  </div>
                </div>

                {/* Tracking input section */}
                <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center gap-3">
                  <span className="text-neutral-600 font-medium">Update Resi Kurir:</span>
                  <input
                    type="text"
                    defaultValue={ord.trackingNumber}
                    id={`tracking-${ord.id}`}
                    placeholder="Masukkan no resi..."
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 font-mono font-bold text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`tracking-${ord.id}`) as HTMLInputElement;
                      if (input?.value) {
                        adminUpdateTracking(ord.orderCode, input.value.trim());
                        alert(`Resi ${ord.orderCode} berhasil diperbarui ke ${input.value.trim()}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] text-white font-bold text-xs"
                  >
                    Simpan Resi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE CS SUPPORT & CHAT DESK */}
      {activeTab === "chat" && (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1A]">
                Live Chat Support & CS Desk
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Balas pesan langsung ke Pengguna sebagai Admin Hingo atau CS Mira.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">Balas Sebagai:</span>
              <button
                type="button"
                onClick={() => setChatSender("CS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  chatSender === "CS"
                    ? "bg-amber-600 text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Mira · CS Hingo
              </button>
              <button
                type="button"
                onClick={() => setChatSender("ADMIN")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  chatSender === "ADMIN"
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Admin Hingo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Thread selector */}
            <div className="md:col-span-4 flex flex-col gap-2">
              {chatThreads.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setActiveThreadId(th.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    activeThreadId === th.id
                      ? "border-[#FFC629] bg-[#FFFBEB]"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-neutral-900">{th.title}</strong>
                    <span className="text-[10px] text-neutral-400">{th.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-1">
                    {th.lastMessage}
                  </p>
                </button>
              ))}
            </div>

            {/* Conversation view & reply box */}
            <div className="md:col-span-8 flex flex-col justify-between h-[450px] border border-neutral-200 rounded-2xl p-4 bg-[#F6F6F4]">
              {/* Messages stream */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-none">
                {currentChatThread.messages.map((msg) => {
                  const isStaff = msg.senderRole === "ADMIN" || msg.senderRole === "CS";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isStaff ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-neutral-400 mb-0.5">
                        {msg.senderName} · {msg.timeLabel}
                      </span>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isStaff
                            ? "bg-[#1A1A1A] text-white rounded-br-xs"
                            : "bg-white border border-neutral-200 text-neutral-900 rounded-bl-xs shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendAdminReply} className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Ketik balasan sebagai ${chatSender === "CS" ? "Mira · CS Hingo" : "Admin Hingo"}...`}
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs transition cursor-pointer"
                >
                  Kirim
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TAMBAH PRODUK KATALOG */}
      {activeTab === "add_product" && (
        <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1A]">
                Tambah Barang Katalog Baru (Langsung ke Database)
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Barang yang didaftarkan di sini akan langsung tampil di halaman /catalog dan / (Home) secara real-time.
              </p>
            </div>
          </div>

          {newProdSuccessMsg && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
              {newProdSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateNewCatalogProduct} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Produk / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keychron K2 V2 Wireless Mechanical"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Brand / Merek</label>
                <input
                  type="text"
                  placeholder="Contoh: Keychron, Logitech, Sony, dll."
                  value={newProdBrand}
                  onChange={(e) => setNewProdBrand(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kategori *</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                >
                  <option value="KEYBOARD">Keyboard</option>
                  <option value="MOUSE">Mouse</option>
                  <option value="HEADSET">Audio / Headset</option>
                  <option value="MONITOR">Monitor</option>
                  <option value="ACCESSORIES">Aksesoris</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kondisi</label>
                <select
                  value={newProdCondition}
                  onChange={(e) => setNewProdCondition(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                >
                  <option value="Seperti baru">Seperti baru (Like New)</option>
                  <option value="Sangat baik">Sangat baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Switch / Spesifikasi Singkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Gateron G Pro Brown / 8000 DPI"
                  value={newProdVariant}
                  onChange={(e) => setNewProdVariant(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Harga Jual Hingo (Rp) *</label>
                <input
                  type="number"
                  required
                  step="1000"
                  placeholder="Contoh: 850000"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Harga Beli Baru Asli (Rp, Opsional)</label>
                <input
                  type="number"
                  step="1000"
                  placeholder="Contoh: 1400000"
                  value={newProdOriginalPrice}
                  onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kelengkapan</label>
                <input
                  type="text"
                  placeholder="Contoh: Fullset unit, box, kabel original, keycap puller"
                  value={newProdCompleteness}
                  onChange={(e) => setNewProdCompleteness(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">URL Foto Produk (Opsional)</label>
                <input
                  type="url"
                  placeholder="Contoh: https://images.unsplash.com/photo-..."
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Deskripsi & Catatan Hasil Inspeksi</label>
              <textarea
                rows={3}
                placeholder="Fungsi switch dan koneksi bluetooth 100% normal. Bodi bersih tanpa retak."
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingNewProd}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{isSubmittingNewProd ? "Menerbitkan..." : "Terbitkan Produk ke Katalog"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
