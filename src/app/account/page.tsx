"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Camera,
  ShoppingBag,
  Package,
  Heart,
  DollarSign,
  Loader2,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const {
    user,
    addresses,
    bankAccounts,
    orders,
    consignments,
    wishlist,
    payouts,
    refreshSession,
    showToast,
    logout,
  } = useHingoStore();

  // Profile edit state
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [cityInput, setCityInput] = useState(user?.city || "Jakarta Selatan");
  const [bioInput, setBioInput] = useState((user as any)?.bio || "");
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatarUrl || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Avatar Modal
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Contact Link Modal state
  const [linkContactModalOpen, setLinkContactModalOpen] = useState(false);
  const [contactType, setContactType] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [contactTarget, setContactTarget] = useState("");
  const [contactOtp, setContactOtp] = useState("");
  const [contactOtpSent, setContactOtpSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactDevOtp, setContactDevOtp] = useState<string | null>(null);

  // Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState("Rumah");
  const [addrRecipient, setAddrRecipient] = useState(user?.name || "");
  const [addrPhone, setAddrPhone] = useState(user?.phone || "");
  const [addrFull, setAddrFull] = useState("");
  const [addrCity, setAddrCity] = useState("Jakarta Selatan");
  const [addrPostal, setAddrPostal] = useState("12810");
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);
  const [addrSubmitting, setAddrSubmitting] = useState(false);

  // Bank Modal state
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState(user?.name || "");
  const [bankIsPrimary, setBankIsPrimary] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);

  // Keep form inputs synced when user is loaded
  useEffect(() => {
    if (user) {
      setNameInput(user.name || "");
      setCityInput(user.city || "Jakarta Selatan");
      setBioInput((user as any)?.bio || "");
      setAvatarUrlInput(user.avatarUrl || "");
      if (!addrRecipient) setAddrRecipient(user.name || "");
      if (!addrPhone) setAddrPhone(user.phone || "");
      if (!accountHolder) setAccountHolder(user.name || "");
    }
  }, [user]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          city: cityInput,
          bio: bioInput,
          avatarUrl: avatarUrlInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await refreshSession();
        setProfileSuccessMsg("✓ Perubahan profil berhasil disimpan ke database!");
        showToast("Profil berhasil diperbarui");
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        alert(data.error || "Gagal menyimpan profil");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi server");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Avatar Quick Pick
  const handleSelectPresetAvatar = async (url: string) => {
    setAvatarUrlInput(url);
    setAvatarModalOpen(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      if (res.ok) {
        await refreshSession();
        showToast("Foto profil diperbarui!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Contact Link (Request OTP)
  const handleRequestContactOtp = async () => {
    if (!contactTarget.trim()) {
      setContactError("Mohon masukkan nomor WhatsApp atau email");
      return;
    }
    setContactLoading(true);
    setContactError(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: contactTarget.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setContactOtpSent(true);
        if (data.otpCode) {
          setContactDevOtp(data.otpCode);
        }
        showToast(`Kode OTP dikirimkan ke ${contactTarget}`);
      } else {
        setContactError(data.error || "Gagal mengirimkan kode OTP");
      }
    } catch (err) {
      setContactError("Terjadi kesalahan jaringan");
    } finally {
      setContactLoading(false);
    }
  };

  // Contact Link (Verify & Link)
  const handleVerifyLinkContact = async () => {
    if (contactOtp.length !== 6) {
      setContactError("Masukkan 6 digit kode OTP");
      return;
    }
    setContactLoading(true);
    setContactError(null);

    try {
      const res = await fetch("/api/user/link-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contactType,
          target: contactTarget.trim(),
          otpCode: contactOtp.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshSession();
        setLinkContactModalOpen(false);
        setContactOtpSent(false);
        setContactTarget("");
        setContactOtp("");
        setContactDevOtp(null);
        showToast(data.message || "Kontak berhasil ditautkan!");
      } else {
        setContactError(data.error || "Kode OTP salah atau telah kadaluarsa");
      }
    } catch (err) {
      setContactError("Terjadi kesalahan sistem");
    } finally {
      setContactLoading(false);
    }
  };

  // Address Handlers
  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddrLabel("Rumah");
    setAddrRecipient(user?.name || "");
    setAddrPhone(user?.phone || "");
    setAddrFull("");
    setAddrCity(user?.city || "Jakarta Selatan");
    setAddrPostal("12810");
    setAddrIsPrimary(addresses.length === 0);
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipientName);
    setAddrPhone(addr.phone);
    setAddrFull(addr.fullAddress);
    setAddrCity(addr.city);
    setAddrPostal(addr.postalCode);
    setAddrIsPrimary(addr.isPrimary);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSubmitting(true);

    try {
      const endpoint = "/api/user/addresses";
      const method = editingAddressId ? "PUT" : "POST";
      const body = {
        ...(editingAddressId ? { id: editingAddressId } : {}),
        label: addrLabel,
        recipientName: addrRecipient,
        phone: addrPhone,
        fullAddress: addrFull,
        city: addrCity,
        postalCode: addrPostal,
        isPrimary: addrIsPrimary,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await refreshSession();
        setAddressModalOpen(false);
        showToast(editingAddressId ? "Alamat berhasil diperbarui" : "Alamat baru berhasil ditambahkan");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan alamat");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Hapus alamat ini dari buku alamat?")) return;
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshSession();
        showToast("Alamat berhasil dihapus");
      }
    } catch (err) {
      alert("Gagal menghapus alamat");
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    try {
      const res = await fetch("/api/user/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPrimary: true }),
      });
      if (res.ok) {
        await refreshSession();
        showToast("Alamat utama berhasil diubah");
      }
    } catch (err) {
      alert("Gagal mengubah alamat utama");
    }
  };

  // Bank Account Handlers
  const openNewBankModal = () => {
    setEditingBankId(null);
    setBankName("BCA");
    setAccountNumber("");
    setAccountHolder(user?.name || "");
    setBankIsPrimary(bankAccounts.length === 0);
    setBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;
    setBankSubmitting(true);

    try {
      const endpoint = "/api/user/bank-accounts";
      const method = editingBankId ? "PUT" : "POST";
      const body = {
        ...(editingBankId ? { id: editingBankId } : {}),
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim() || user?.name || "Pemilik Rekening",
        isPrimary: bankIsPrimary,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await refreshSession();
        setBankModalOpen(false);
        showToast(editingBankId ? "Rekening berhasil diperbarui" : "Rekening berhasil ditambahkan");
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan rekening");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setBankSubmitting(false);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm("Hapus rekening pencairan ini?")) return;
    try {
      const res = await fetch(`/api/user/bank-accounts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshSession();
        showToast("Rekening berhasil dihapus");
      }
    } catch (err) {
      alert("Gagal menghapus rekening");
    }
  };

  const handleSetPrimaryBank = async (id: string) => {
    try {
      const res = await fetch("/api/user/bank-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPrimary: true }),
      });
      if (res.ok) {
        await refreshSession();
        showToast("Rekening utama berhasil diubah");
      }
    } catch (err) {
      alert("Gagal mengatur rekening utama");
    }
  };

  // Activity summary metrics
  const totalPayoutDisbursed = payouts
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.netDisbursed || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            PROFIL PENGGUNA RESMI HINGO
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Akun & Keamanan {user?.name || "Pengguna"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Data pribadi, kontak terverifikasi, verifikasi identitas KYC, buku alamat, dan rekening pencairan konsinyasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seller/consignments"
            className="flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition shadow-xs"
          >
            <span>Ruang Titip Jual</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Section 5) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-xs">
        <Link
          href="/orders"
          className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-[#FFC629] hover:shadow-md flex items-center justify-between"
        >
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Pesanan Saya</span>
            <strong className="text-xl font-black text-neutral-900 group-hover:text-amber-800">
              {orders.length} Transaksi
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </Link>

        <Link
          href="/seller/consignments"
          className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-[#FFC629] hover:shadow-md flex items-center justify-between"
        >
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Barang Titipan</span>
            <strong className="text-xl font-black text-neutral-900 group-hover:text-amber-800">
              {consignments.length} Pengajuan
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </Link>

        <Link
          href="/wishlist"
          className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-[#FFC629] hover:shadow-md flex items-center justify-between"
        >
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Wishlist Tersimpan</span>
            <strong className="text-xl font-black text-neutral-900 group-hover:text-amber-800">
              {wishlist.length} Item
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Heart className="h-5 w-5" />
          </div>
        </Link>

        <Link
          href="/seller/payouts"
          className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs transition hover:border-[#FFC629] hover:shadow-md flex items-center justify-between"
        >
          <div>
            <span className="text-neutral-400 font-bold block mb-1">Total Pencairan</span>
            <strong className="text-xl font-black text-[#16A34A] group-hover:text-emerald-700">
              {formatRupiah(totalPayoutDisbursed)}
            </strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Profile Summary Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col items-center text-center gap-3">
            <div className="relative group">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-3xl object-cover border-2 border-[#FFC629] shadow-xs"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FFC629] text-3xl font-black text-black shadow-xs uppercase">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-neutral-800 transition shadow-md border-2 border-white cursor-pointer"
                title="Ubah Foto Profil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#1A1A1A]">
                {user?.name || "Pengguna Hingo"}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {user?.city || "Jakarta Selatan"} · {user?.role === "ADMIN" ? "Admin Kurator" : "Member"}
              </p>
              {(user as any)?.bio && (
                <p className="text-xs text-neutral-600 italic mt-1.5 px-3">
                  "{(user as any).bio}"
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[11px]">
              {user?.phoneVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 font-bold">
                  <CheckCircle2 className="h-3 w-3" /> WhatsApp Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-0.5 font-medium">
                  WA Belum Ditautkan
                </span>
              )}

              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 font-bold">
                  <CheckCircle2 className="h-3 w-3" /> Email Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-600 px-2.5 py-0.5 font-medium">
                  Email Belum Ditautkan
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold border ${user?.kycStatus === "VERIFIED"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : user?.kycStatus === "PENDING_REVIEW"
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-neutral-100 text-neutral-600 border-neutral-300"
                  }`}
              >
                <ShieldCheck className="h-3 w-3" />
                {user?.kycStatus === "VERIFIED"
                  ? "KYC Terverifikasi"
                  : user?.kycStatus === "PENDING_REVIEW"
                    ? "KYC Menunggu Review"
                    : "KYC Belum Verifikasi"}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-2.5 shadow-xs flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${activeTab === "profile"
                ? "bg-[#FFFBEB] text-amber-950 font-black shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <User className="h-4 w-4 text-amber-600" />
              <span>Profil & Kontak Terverifikasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("kyc")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${activeTab === "kyc"
                ? "bg-[#FFFBEB] text-amber-950 font-black shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Verifikasi Identitas KYC ({user?.kycStatus === "VERIFIED" ? "Aktif" : "Perlu"})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("address")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${activeTab === "address"
                ? "bg-[#FFFBEB] text-amber-950 font-black shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <MapPin className="h-4 w-4 text-amber-600" />
              <span>Buku Alamat Pengiriman ({addresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${activeTab === "bank"
                ? "bg-[#FFFBEB] text-amber-950 font-black shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <Building2 className="h-4 w-4 text-amber-600" />
              <span>Rekening Bank Pencairan ({bankAccounts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${activeTab === "security"
                ? "bg-[#FFFBEB] text-amber-950 font-black shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Keamanan Sesi (30 Hari Aktif)</span>
            </button>

            <div className="border-t border-neutral-100 my-1" />

            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TAB 1: Profile & Verified Contacts */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              {profileSuccessMsg && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
                  {profileSuccessMsg}
                </div>
              )}

              {/* Form Data Diri */}
              <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Edit Data Diri Pengguna
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Data nama dan kota domisili tersimpan permanen di database.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Nama lengkap kamu"
                        className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Kota Domisili *</label>
                      <input
                        type="text"
                        required
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Contoh: Jakarta Selatan, Semarang, Bandung"
                        className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Bio Singkat</label>
                    <textarea
                      rows={2}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="Contoh: Enthusiast mechanical keyboard, audiophile, dan minimal desk setup."
                      className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Ubah Foto Profil Avatar</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Manajemen Kontak Terverifikasi (WA & Email) */}
              <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-5">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Sinkronisasi Kontak Terverifikasi (WhatsApp & Email)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Hubungkan nomor WhatsApp dan Email kamu untuk menerima resi kurir, notifikasi inspeksi gear, dan OTP login.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* WhatsApp Card */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Nomor WhatsApp / HP</span>
                        </span>
                        {user?.phoneVerified && user?.phone ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            ✓ Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Belum Terhubung
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-sm font-black text-neutral-900">
                        {user?.phone || "Belum ada nomor WhatsApp"}
                      </p>
                    </div>

                    {(!user?.phoneVerified || !user?.phone) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContactType("PHONE");
                          setContactTarget("");
                          setContactOtp("");
                          setContactOtpSent(false);
                          setContactError(null);
                          setLinkContactModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer text-center"
                      >
                        + Tambah / Verifikasi Nomor WhatsApp
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setContactType("PHONE");
                          setContactTarget(user.phone || "");
                          setContactOtp("");
                          setContactOtpSent(false);
                          setContactError(null);
                          setLinkContactModalOpen(true);
                        }}
                        className="text-neutral-500 hover:text-black font-bold text-[11px] text-right"
                      >
                        Ubah Nomor WhatsApp
                      </button>
                    )}
                  </div>

                  {/* Email Card */}
                  <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-neutral-700 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                          <span>Alamat Email</span>
                        </span>
                        {user?.emailVerified && user?.email ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            ✓ Terverifikasi
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                            Belum Terhubung
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-neutral-900 truncate">
                        {user?.email || "Belum ada email terdaftar"}
                      </p>
                    </div>

                    {(!user?.emailVerified || !user?.email) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setContactType("EMAIL");
                          setContactTarget("");
                          setContactOtp("");
                          setContactOtpSent(false);
                          setContactError(null);
                          setLinkContactModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer text-center"
                      >
                        + Tambah / Verifikasi Email
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setContactType("EMAIL");
                          setContactTarget(user.email || "");
                          setContactOtp("");
                          setContactOtpSent(false);
                          setContactError(null);
                          setLinkContactModalOpen(true);
                        }}
                        className="text-neutral-500 hover:text-black font-bold text-[11px] text-right"
                      >
                        Ubah Alamat Email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KYC Verification (Section 2) */}
          {activeTab === "kyc" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Verifikasi Identitas Resmi (KYC)
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Kepatuhan identitas sesuai regulasi untuk menjamin keamanan transaksi & pencairan dana titip jual.
                  </p>
                </div>
                <StatusBadge
                  label={
                    user?.kycStatus === "VERIFIED"
                      ? "Terverifikasi"
                      : user?.kycStatus === "PENDING_REVIEW"
                        ? "Menunggu Peninjauan"
                        : "Belum Verifikasi"
                  }
                  variant={
                    user?.kycStatus === "VERIFIED"
                      ? "verified"
                      : user?.kycStatus === "PENDING_REVIEW"
                        ? "warning"
                        : "neutral"
                  }
                />
              </div>

              {/* Status Specific Card */}
              {user?.kycStatus === "VERIFIED" ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Akun Anda Telah Terverifikasi Penuh!</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Identitas KTP dan foto selfie wajah Anda telah lolos pengecekan tim inspeksi Hingo. Anda memiliki akses pencairan dana konsinyasi tanpa batas dan prioritas penayangan gear di katalog.
                  </p>
                  {user.kycDocument && (
                    <div className="mt-2 text-xs bg-white/80 p-3 rounded-xl border border-emerald-200">
                      <span className="text-neutral-500">Nama KTP: </span>
                      <strong className="text-black">{user.kycDocument.fullNameKtp || user.name}</strong>
                      <span className="text-neutral-500 ml-3">NIK: </span>
                      <strong className="text-black font-mono">{user.kycDocument.maskedNik || "3174**********01"}</strong>
                    </div>
                  )}
                </div>
              ) : user?.kycStatus === "PENDING_REVIEW" ? (
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-6 flex flex-col gap-4 text-xs text-neutral-800">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span>Dokumen KYC Sedang Ditinjau Tim Hingo (Maks. 1 × 24 Jam)</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">
                    Terima kasih telah mengunggah dokumen KTP dan foto selfie. Tim kurator kami sedang mencocokkan kelayakan data Anda.
                  </p>
                  {user?.kycDocument && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-amber-200">
                        <span className="text-neutral-400 block text-[10px]">Nama KTP:</span>
                        <strong className="text-neutral-900 text-xs">{user.kycDocument.fullNameKtp || user.name}</strong>
                        <span className="text-neutral-400 block text-[10px] mt-1">NIK Tersamar:</span>
                        <code className="font-mono text-xs font-bold text-amber-900">{user.kycDocument.maskedNik || "3174**********01"}</code>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-center">
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Foto KTP & Selfie Berhasil Diunggah
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-1">
                          Estimasi hasil review selesai hari ini
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-900 mb-1">
                      Mulai Verifikasi Identitas (KTP & Selfie)
                    </h4>
                    <p className="text-xs text-neutral-600 max-w-lg leading-relaxed">
                      Selesaikan verifikasi KYC sekali saja agar Anda dapat menarik saldo hasil titip jual keyboard & peripheral langsung ke rekening bank Anda tanpa potongan biaya penalti.
                    </p>
                  </div>
                  <Link
                    href="/auth/verify-identity"
                    className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black px-5 py-3 text-xs font-black transition active:scale-95 shadow-xs"
                  >
                    <span>Mulai Verifikasi Sekarang</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Address Book (Section 3) */}
          {activeTab === "address" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Buku Alamat Pengiriman
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Alamat utama otomatis terpilih saat checkout pembelian dan asal penjemputan barang titip jual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewAddressModal}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs font-bold text-black transition cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-8 text-center flex flex-col items-center gap-2">
                  <MapPin className="h-8 w-8 text-amber-600" />
                  <p className="font-bold text-sm text-[#1A1A1A]">Belum Ada Alamat Pengiriman</p>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    Tambahkan alamat rumah atau kantor Anda untuk mempermudah pengiriman paket pembelian.
                  </p>
                  <button
                    type="button"
                    onClick={openNewAddressModal}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    + Tambah Alamat Sekarang
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl p-5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${addr.isPrimary
                        ? "border-[#FFC629] bg-[#FFFBEB]/40 ring-1 ring-[#FFC629]"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                    >
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-neutral-900 text-sm">
                            {addr.recipientName}
                          </span>
                          <span className="text-neutral-400">· {addr.phone}</span>
                          {addr.isPrimary && (
                            <span className="rounded-md bg-[#FFFBEB] text-amber-900 border border-[#FDE68A] px-2 py-0.5 text-[10px] font-bold">
                              Alamat Utama
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
                            onClick={() => handleSetPrimaryAddress(addr.id)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-black transition cursor-pointer"
                          title="Edit Alamat"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-2 rounded-xl border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Alamat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Bank Accounts (Section 4) */}
          {activeTab === "bank" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">
                    Rekening Bank & E-Wallet Pencairan Konsinyasi
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Rekening tujuan saat hasil penjualan gear dicairkan oleh sistem escrow Hingo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewBankModal}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs font-bold text-black transition cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-8 text-center flex flex-col items-center gap-2">
                  <Building2 className="h-8 w-8 text-amber-600" />
                  <p className="font-bold text-sm text-[#1A1A1A]">Belum Ada Rekening Bank Terdaftar</p>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    Tambahkan rekening bank atau e-wallet Anda untuk menerima pencairan dana hasil titip jual.
                  </p>
                  <button
                    type="button"
                    onClick={openNewBankModal}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    + Tambah Rekening Sekarang
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {bankAccounts.map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-2xl p-5 border transition flex items-center justify-between gap-4 ${b.isPrimary
                        ? "border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-14 items-center justify-center rounded-xl bg-neutral-900 text-[#FFC629] font-black text-xs tracking-wider">
                          {b.bankName.slice(0, 4).toUpperCase()}
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
                            {b.bankName} · a.n. <strong>{b.accountHolder}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!b.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryBank(b.id)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteBank(b.id)}
                          className="p-2 rounded-xl border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Rekening"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-[#F6F6F4] p-4 text-xs text-neutral-600 border border-neutral-200 leading-relaxed">
                <strong className="text-black font-bold block mb-1">
                  Aturan Keamanan Pencairan Escrow:
                </strong>
                Nama pemilik rekening bank <strong>wajib sama persis</strong> dengan nama KTP yang diverifikasi pada identitas KYC {user?.name || "pengguna"} demi mencegah transaksi ilegal dan pencucian uang.
              </div>
            </div>
          )}

          {/* TAB 5: Security & Session (Section 5) */}
          {activeTab === "security" && (
            <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
              <div className="pb-3 border-b border-neutral-100">
                <h3 className="text-base font-extrabold text-[#1A1A1A]">
                  Keamanan Sesi & Informasi Login Aktif
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Sesi login Anda tersimpan aman selama 30 hari di database Supabase dan cookie HTTP-only.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                  <span className="text-neutral-400 block mb-1">Status Sesi Login</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif (Persistent 30 Hari)
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Anda tidak perlu login berulang kali saat membuka browser atau refresh tab.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-neutral-200">
                  <span className="text-neutral-400 block mb-1">Metode Autentikasi Utama</span>
                  <strong className="text-sm font-bold text-neutral-900">
                    {user?.phone ? "Nomor WhatsApp OTP" : user?.email ? "Email OTP" : "Sesi Akun"}
                  </strong>
                  <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                    {user?.phone || user?.email || user?.id}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <strong className="text-rose-900 block font-bold text-sm">Keluar dari Akun</strong>
                  <p className="text-rose-700 mt-0.5 max-w-md">
                    Menghapus sesi login aktif di database dan cookie browser. Anda akan kembali ke mode Guest (Belum Login).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  Keluar Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Ubah Foto Avatar */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Pilih Foto Profil Avatar</h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-xs">
              <p className="text-neutral-500">Pilih salah satu avatar kurator Hingo atau masukkan URL gambar kustom:</p>

              {/* Preset Avatars */}
              <div className="grid grid-cols-4 gap-3 py-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                ].map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(url)}
                    className="relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#FFC629] focus:border-[#FFC629] transition aspect-square"
                  >
                    <img src={url} alt={`Avatar ${i}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Atau Masukkan URL Gambar Sendiri</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectPresetAvatar(avatarUrlInput);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-black text-black cursor-pointer"
                >
                  Gunakan URL Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Link Contact (WA / Email with OTP) */}
      {linkContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                {contactType === "EMAIL" ? "Tautkan Alamat Email" : "Tautkan Nomor WhatsApp"}
              </h3>
              <button
                type="button"
                onClick={() => setLinkContactModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3.5 text-xs">
              {contactError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                  {contactError}
                </div>
              )}

              {contactDevOtp && (
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-amber-900 font-bold flex items-center justify-between">
                  <span>Dev OTP Aktif: <code className="font-mono text-sm bg-amber-200 px-1.5 py-0.5 rounded">{contactDevOtp}</code></span>
                  <button
                    type="button"
                    onClick={() => setContactOtp(contactDevOtp)}
                    className="underline text-amber-800"
                  >
                    Isi
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {contactType === "EMAIL" ? "Alamat Email Tujuan" : "Nomor WhatsApp (+62 / 08...)"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={contactType === "EMAIL" ? "email" : "tel"}
                    required
                    disabled={contactOtpSent}
                    value={contactTarget}
                    onChange={(e) => setContactTarget(e.target.value)}
                    placeholder={contactType === "EMAIL" ? "nama@domain.com" : "081234567890"}
                    className="flex-1 rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-900 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                  {!contactOtpSent && (
                    <button
                      type="button"
                      disabled={contactLoading}
                      onClick={handleRequestContactOtp}
                      className="px-4 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {contactLoading ? "Mengirim..." : "Kirim OTP"}
                    </button>
                  )}
                </div>
              </div>

              {contactOtpSent && (
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Masukkan 6 Digit Kode OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={contactOtp}
                    onChange={(e) => setContactOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-lg font-black rounded-xl border border-neutral-300 bg-white p-2.5 text-neutral-900 outline-none focus:border-[#FFC629]"
                  />
                  <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                    <span>Berlaku selama 5 menit</span>
                    <button
                      type="button"
                      onClick={handleRequestContactOtp}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      Kirim Ulang OTP
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setLinkContactModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                {contactOtpSent && (
                  <button
                    type="button"
                    disabled={contactLoading || contactOtp.length !== 6}
                    onClick={handleVerifyLinkContact}
                    className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-black cursor-pointer disabled:opacity-50"
                  >
                    {contactLoading ? "Memverifikasi..." : "Verifikasi & Tautkan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Tambah / Edit Alamat */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                {editingAddressId ? "Edit Alamat Pengiriman" : "Tambah Alamat Pengiriman Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
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
                  value={addrLabel}
                  onChange={(e) => setAddrLabel(e.target.value)}
                  placeholder="Contoh: Rumah / Kantor / Studio"
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  required
                  value={addrFull}
                  onChange={(e) => setAddrFull(e.target.value)}
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
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={addrPostal}
                    onChange={(e) => setAddrPostal(e.target.value)}
                    placeholder="12810"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-semibold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrIsPrimary}
                  onChange={(e) => setAddrIsPrimary(e.target.checked)}
                  className="accent-[#FFC629]"
                />
                <span className="font-semibold text-neutral-700">Jadikan alamat utama pengiriman</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addrSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-black text-black cursor-pointer disabled:opacity-50"
                >
                  {addrSubmitting ? "Menyimpan..." : "Simpan Alamat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Tambah Rekening Bank */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-extrabold text-[#1A1A1A]">
                Tambah Rekening Bank Pencairan
              </h3>
              <button
                type="button"
                onClick={() => setBankModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="mt-4 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Bank / E-Wallet</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 font-bold text-neutral-800 outline-none focus:border-[#FFC629] focus:bg-white"
                >
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="GoPay">GoPay (E-Wallet)</option>
                  <option value="OVO">OVO (E-Wallet)</option>
                  <option value="DANA">DANA (E-Wallet)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nomor Rekening / No. HP E-Wallet *</label>
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
                <label className="block font-bold text-neutral-700 mb-1">Nama Pemilik Rekening *</label>
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

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bankIsPrimary}
                  onChange={(e) => setBankIsPrimary(e.target.checked)}
                  className="accent-[#FFC629]"
                />
                <span className="font-semibold text-neutral-700">Jadikan rekening utama pencairan</span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] font-black text-black cursor-pointer disabled:opacity-50"
                >
                  {bankSubmitting ? "Menyimpan..." : "Simpan Rekening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

