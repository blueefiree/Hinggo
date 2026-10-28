"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  MapPin,
  Building2,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  CreditCard,
  FileText,
  LogOut,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";
import { UserAddress, UserBankAccount } from "@/lib/data";

export default function UserAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const {
    user,
    addresses,
    activeAddress,
    setActiveAddress,
    addAddress,
    bankAccounts,
    activeBankAccount,
    addBankAccount,
    logout,
  } = useHingoStore();

  // Modals state
  const [addAddressModalOpen, setAddAddressModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newRecipient, setNewRecipient] = useState(user?.name || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Jakarta Selatan");
  const [newPostal, setNewPostal] = useState("");
  const [newIsPrimary, setNewIsPrimary] = useState(false);

  const [addBankModalOpen, setAddBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState(user?.name || "");

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress({
      label: newLabel || "Alamat Baru",
      recipientName: newRecipient,
      phone: newPhone,
      fullAddress: newAddress,
      city: newCity,
      postalCode: newPostal || "12000",
      isPrimary: newIsPrimary,
    });
    setAddAddressModalOpen(false);
    setNewLabel("");
    setNewAddress("");
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;
    addBankAccount({
      bankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim() || user?.name || "Pemilik Rekening",
      isPrimary: true,
    });
    setAddBankModalOpen(false);
    setAccountNumber("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            PENGATURAN AKUN SAYA
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Akun & Keamanan {user?.name || "Pengguna"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola profil, verifikasi identitas KYC, buku alamat pengiriman, dan rekening bank pencairan.
          </p>
        </div>

        <Link
          href="/seller/consignments"
          className="flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition self-start sm:self-auto"
        >
          <span>Masuk Ruang Penjual</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Profile Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFC629] text-2xl font-black text-black shadow-xs uppercase">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#1A1A1A]">
                {user?.name || "Pengguna Hingo"}
              </h2>
              <p className="text-xs text-neutral-500">{user?.email || user?.phone || "-"}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                <CheckCircle2 className="h-3 w-3" /> No. HP Terverifikasi
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  user?.kycStatus === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}
              >
                <Clock className="h-3 w-3" />
                {user?.kycStatus === "VERIFIED" ? "KYC Terverifikasi" : "KYC Menunggu Review"}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-2.5 shadow-xs flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeTab === "profile"
                  ? "bg-[#FFFBEB] text-amber-950 font-extrabold"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <User className="h-4 w-4 text-amber-600" />
              <span>Profil & Verifikasi Identitas (KYC)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeTab === "address"
                  ? "bg-[#FFFBEB] text-amber-950 font-extrabold"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <MapPin className="h-4 w-4 text-amber-600" />
              <span>Buku Alamat Pengiriman ({addresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left ${
                activeTab === "bank"
                  ? "bg-[#FFFBEB] text-amber-950 font-extrabold"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Building2 className="h-4 w-4 text-amber-600" />
              <span>Rekening Bank Pencairan ({bankAccounts.length})</span>
            </button>

            <div className="border-t border-neutral-100 my-1" />

            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TAB 1: Profile & KYC */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {/* Account Data Card */}
              <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Informasi Akun
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Data kontak terdaftar untuk notifikasi kurasi dan resi transaksi.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                    <span className="text-[11px] text-neutral-400 block mb-1">Nama Lengkap</span>
                    <strong className="text-sm font-bold text-neutral-900">{user?.name || "-"}</strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                    <span className="text-[11px] text-neutral-400 block mb-1">Email Terdaftar</span>
                    <strong className="text-sm font-bold text-neutral-900">{user?.email || "-"}</strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-neutral-400">Nomor WhatsApp / HP</span>
                      <span className="text-[10px] font-bold text-emerald-700">✓ Terverifikasi</span>
                    </div>
                    <strong className="text-sm font-bold text-neutral-900 font-mono">
                      {user?.phone || "-"}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                    <span className="text-[11px] text-neutral-400 block mb-1">Kota Domisili</span>
                    <strong className="text-sm font-bold text-neutral-900">{user?.city || "Jakarta Selatan"}</strong>
                  </div>
                </div>
              </div>

              {/* KYC Status Card */}
              <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1A1A1A]">
                      Verifikasi Identitas Resmi (KYC)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Syarat penarikan dana konsinyasi tanpa batas nominal.
                    </p>
                  </div>
                  <StatusBadge
                    label={user?.kycStatus === "VERIFIED" ? "Terverifikasi" : "Menunggu Peninjauan"}
                    variant={user?.kycStatus === "VERIFIED" ? "verified" : "warning"}
                  />
                </div>

                <div className="rounded-2xl bg-[#FFFBEB] p-4 border border-[#FDE68A] text-xs text-neutral-800 leading-relaxed">
                  <div className="font-bold text-black mb-1">
                    Dokumen Identitas:
                  </div>
                  {user?.kycDocument ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200">
                        <FileText className="h-4 w-4 text-amber-700" />
                        <div>
                          <span className="font-bold block text-neutral-900">
                            {user.kycDocument.ktpFileName || "ktp_user.jpg"}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            NIK: {user.kycDocument.maskedNik || "3174**********01"} · {user.kycDocument.ktpFileSize || "1.8 MB"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-200">
                        <FileText className="h-4 w-4 text-amber-700" />
                        <div>
                          <span className="font-bold block text-neutral-900">
                            {user.kycDocument.selfieFileName || "selfie_user.jpg"}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Selfie Wajah · {user.kycDocument.selfieFileSize || "2.1 MB"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 mt-1">
                      Belum ada dokumen identitas yang diunggah. Lengkapi KYC untuk dapat menarik hasil penjualan barang konsinyasimu.
                    </p>
                  )}
                </div>

                <Link
                  href="/auth/verify-identity"
                  className="w-full sm:w-auto self-start flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold transition"
                >
                  <span>Buka Halaman Verifikasi Identitas</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: Address Book */}
          {activeTab === "address" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Buku Alamat Pengiriman
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Alamat penerima paket belanja dan asal penjemputan barang titip jual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddAddressModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs font-bold text-black transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              <div className="flex flex-col gap-3.5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl p-5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      addr.isPrimary
                        ? "border-[#FFC629] bg-[#FFFBEB]/50 ring-1 ring-[#FFC629]"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {addr.recipientName}
                        </span>
                        <span className="text-neutral-400">· {addr.phone}</span>
                        {addr.isPrimary && (
                          <span className="rounded-md bg-[#FFFBEB] text-amber-900 border border-[#FDE68A] px-2 py-0.5 text-[10px] font-bold">
                            Utama
                          </span>
                        )}
                        <span className="rounded-md bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] font-semibold">
                          {addr.label}
                        </span>
                      </div>
                      <p className="text-neutral-600 font-medium leading-relaxed mt-1 max-w-xl">
                        {addr.fullAddress} ({addr.city} {addr.postalCode})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {!addr.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setActiveAddress(addr.id)}
                          className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition"
                        >
                          Jadikan Utama
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Bank Accounts */}
          {activeTab === "bank" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Rekening Bank Pencairan Konsinyasi
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Rekening tujuan saat dana penjualan peripheral dicairkan oleh sistem escrow Hingo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddBankModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs font-bold text-black transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              <div className="flex flex-col gap-3.5">
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-2xl p-5 border transition flex items-center justify-between gap-4 ${
                      b.isPrimary
                        ? "border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-14 items-center justify-center rounded-xl bg-blue-700 text-white font-black text-xs tracking-wider">
                        {b.bankName.includes("BCA") ? "BCA" : "MANDIRI"}
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-sm font-black text-neutral-900">
                            {b.accountNumber}
                          </strong>
                          {b.isPrimary && (
                            <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                              Rekening Utama Pencairan
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-500 mt-0.5">
                          {b.bankName} · a.n. {b.accountHolder}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-[#F6F6F4] p-4 text-xs text-neutral-600 border border-neutral-200 leading-relaxed">
                <strong className="text-black font-bold block mb-1">
                  Aturan Keamanan Pencairan:
                </strong>
                Nama pemilik rekening bank <strong>wajib sama persis</strong> dengan nama KTP yang diverifikasi pada identitas KYC {user?.name || "pengguna"} untuk mencegah fraud dan pencucian uang.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Tambah Alamat */}
      {addAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tambah Alamat Pengiriman Baru
              </h3>
              <button
                type="button"
                onClick={() => setAddAddressModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="mt-4 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Label Alamat</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Contoh: Kantor / Studio / Kosan"
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                    placeholder="12810"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsPrimary}
                  onChange={(e) => setNewIsPrimary(e.target.checked)}
                  className="accent-[#FFC629]"
                />
                <span className="font-semibold text-neutral-700">Jadikan alamat utama pengiriman</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAddAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-bold text-black"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Rekening */}
      {addBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tambah Rekening Bank Pencairan
              </h3>
              <button
                type="button"
                onClick={() => setAddBankModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="mt-4 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">BRI</option>
                  <option value="GoPay">GoPay (E-Wallet)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 4370192831"
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-mono text-sm font-bold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Wajib sesuai nama KTP: {user?.name || "KTP terverifikasi"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAddBankModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-bold text-black"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
