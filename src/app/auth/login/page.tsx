"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  QrCode,
  X,
  Sparkles,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const { user, refreshSession, showToast } = useHingoStore();
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // WhatsApp QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [waStatusMsg, setWaStatusMsg] = useState("");

  // If already logged in, redirect to target or /account
  useEffect(() => {
    if (user) {
      const dest = callbackUrl && !callbackUrl.includes("/auth/") ? callbackUrl : "/account";
      router.replace(dest);
    }
  }, [user, router, callbackUrl]);

  // Check WhatsApp status
  const checkWaStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/qr");
      const data = await res.json();
      setWaConnected(data.isConnected);
      if (data.qr) setQrDataUrl(data.qr);
      if (data.statusMessage) setWaStatusMsg(data.statusMessage);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    checkWaStatus();
  }, []);

  const openQrModal = async () => {
    setQrModalOpen(true);
    setWaLoading(true);
    try {
      const res = await fetch("/api/whatsapp/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      setWaConnected(data.isConnected);
      if (data.qr) setQrDataUrl(data.qr);
      if (data.statusMessage) setWaStatusMsg(data.statusMessage);
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  // Poll for QR updates while modal is open
  useEffect(() => {
    if (!qrModalOpen || waConnected) return;
    const interval = setInterval(() => {
      checkWaStatus();
    }, 2500);
    return () => clearInterval(interval);
  }, [qrModalOpen, waConnected]);

  const handleSubmit = async (e: React.FormEvent, forcedMode?: "phone" | "email") => {
    e.preventDefault();
    setIsLoading(true);

    const mode = forcedMode || authMode;
    const target = (mode === "phone" ? phone : email).trim();

    if (!target) {
      alert(mode === "phone" ? "Mohon masukkan nomor HP Anda" : "Mohon masukkan alamat email Anda");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Kode OTP berhasil dikirim ke ${target}`);
        router.push(
          `/auth/verify-otp?target=${encodeURIComponent(target)}&devOtp=${data.otpCode || ""}&callbackUrl=${encodeURIComponent(callbackUrl)}`
        );
      } else {
        alert(data.error || "Gagal mengirimkan kode OTP");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan koneksi server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
        
        {/* KOLOM KIRI (Figma Editorial Banner - Hidden on Mobile, Visible on Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-8 sm:p-10 flex-col justify-between relative overflow-hidden shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC629] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PRELOVED, RELOVED.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] leading-tight tracking-tight">
              Gear bagus tak harus baru.
            </h2>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mt-3">
              Jual gear lamamu dengan harga wajar, beli gear impian dengan rasa tenang. Semua barang diperiksa langsung oleh teknisi Hingo sebelum dikirim ke pembeli.
            </p>
          </div>

          {/* Keyboard Visual Feature */}
          <div className="my-6 relative rounded-2xl overflow-hidden border border-amber-200/80 shadow-inner aspect-16/9 bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
              alt="Custom Mechanical Keyboard"
              className="h-full w-full object-cover opacity-90 transition hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#FFC629]" />
                <span>100% Lolos Uji Lab & Garansi Uang Kembali 48 Jam</span>
              </span>
            </div>
          </div>

          {/* Card: Satu akun, banyak kesempatan */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xs p-5 border border-amber-200/60 flex flex-col gap-2.5 text-xs">
            <span className="font-black text-sm text-[#1A1A1A]">
              Satu akun, banyak kesempatan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Titip jual transparan (8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Escrow dana aman</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Inspeksi fisik 48 jam</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Chat langsung kurator</span>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (Figma Login Form) */}
        <div className="lg:col-span-6 rounded-3xl border border-[#E5E5E5] bg-white p-8 sm:p-10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFC629] font-black text-xl text-[#1A1A1A] shadow-xs transition group-hover:scale-105">
                  H
                </div>
                <span className="font-black text-lg text-[#1A1A1A] tracking-tight">HINGO</span>
              </Link>

              {/* Status WA Gateway indicator */}
              <button
                type="button"
                onClick={openQrModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                  waConnected
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-[#FFFBEB] text-amber-900 border-[#FDE68A] hover:bg-amber-100"
                }`}
                title="Status Pengirim WhatsApp"
              >
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                <span>{waConnected ? "WhatsApp Aktif" : "Scan QR WA"}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
              Masuk atau daftar
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 mb-6 leading-relaxed">
              Mulai dengan nomor HP, email, atau akun Google.
            </p>

            {/* Method Toggle Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F6F4] rounded-2xl mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode("phone")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
                  authMode === "phone"
                    ? "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B] shadow-xs font-black"
                    : "text-neutral-500 hover:text-black border border-transparent"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Nomor HP</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("email")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${
                  authMode === "email"
                    ? "bg-[#FFFBEB] text-[#92400E] border border-[#F59E0B] shadow-xs font-black"
                    : "text-neutral-500 hover:text-black border border-transparent"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
            </div>

            {/* FORM NOMOR HP */}
            {authMode === "phone" ? (
              <form onSubmit={(e) => handleSubmit(e, "phone")} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1.5">
                    Nomor WhatsApp / Handphone
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-bold text-neutral-500 text-sm">
                      +62
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="812 3456 7890"
                      className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] py-3.5 pl-14 pr-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-[#FFC629] focus:bg-white"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1.5 block">
                    Kami akan mengirimkan 6 digit kode OTP ke WhatsApp nomor ini.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim OTP ke nomor HP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM EMAIL */
              <form onSubmit={(e) => handleSubmit(e, "email")} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-2xl border border-neutral-300 bg-[#F6F6F4] py-3.5 px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-[#FFC629] focus:bg-white"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1.5 block">
                    Kami akan mengirimkan 6 digit kode OTP ke inbox email ini.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FFC629] hover:bg-[#FFC420] py-3.5 text-sm font-black text-[#1A1A1A] shadow-xs transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mengirim OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim OTP ke email</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Separator */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                atau lanjutkan dengan
              </span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => {
                alert("Fitur Google Auth siap digunakan. Untuk saat ini silakan masuk menggunakan OTP WhatsApp / Email langsung.");
              }}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 py-3 text-xs font-bold text-neutral-800 transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Kartu Krem Baru di Hingo */}
            <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-xs text-amber-950 mt-5 shadow-xs">
              <div className="font-extrabold mb-1">Baru di Hingo? Tidak perlu daftar terpisah.</div>
              <div className="text-amber-800 text-[11px] leading-relaxed">
                Cukup masukkan nomor HP atau email aktif, akunmu langsung siap digunakan untuk belanja maupun titip jual gear.
              </div>
            </div>
          </div>

          {/* Privacy Note & Footer Ringkas Mobile */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col gap-3">
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
              Dengan masuk atau mendaftar, kamu menyetujui{" "}
              <Link href="/how-it-works" className="text-neutral-700 underline font-medium">
                Ketentuan Layanan
              </Link>{" "}
              dan{" "}
              <Link href="/how-it-works" className="text-neutral-700 underline font-medium">
                Kebijakan Privasi
              </Link>{" "}
              Hingo.
            </p>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
              <span>© 2026 Hingo</span>
              <div className="flex items-center gap-3">
                <Link href="/how-it-works" className="hover:underline">Privasi</Link>
                <span>·</span>
                <Link href="/how-it-works" className="hover:underline">Bantuan</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SCAN QR WHATSAPP GATEWAY */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-[#1A1A1A]">
                  Tautkan Pengirim WhatsApp
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center text-center gap-3 text-xs">
              {waConnected ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 w-full flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  <strong className="text-sm text-emerald-900">WhatsApp Web Sukses Terhubung!</strong>
                  <p className="text-emerald-700 text-xs">
                    Server Hingo siap mengirimkan chat WhatsApp asli ke nomor tujuan pengguna kapan pun OTP diminta.
                  </p>
                </div>
              ) : qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-neutral-600">
                    Buka WhatsApp di ponsel $\rightarrow$ <strong>Perangkat Tertaut</strong> $\rightarrow$ <strong>Tautkan Perangkat</strong>, lalu scan QR Code di bawah:
                  </p>
                  <div className="p-3 bg-white rounded-2xl border-2 border-[#FFC629] shadow-sm">
                    <img src={qrDataUrl} alt="WhatsApp QR Code" className="h-56 w-56 object-contain" />
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {waStatusMsg || "Menunggu pemindaian QR Code..."}
                  </span>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center gap-3 text-neutral-500">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
                  <span>{waStatusMsg || "Menghubungkan ke WhatsApp Web Engine..."}</span>
                </div>
              )}

              <div className="flex items-center justify-between w-full pt-3 border-t border-neutral-100 text-xs">
                <button
                  type="button"
                  onClick={openQrModal}
                  className="flex items-center gap-1.5 text-neutral-600 hover:text-black font-bold cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Memuat halaman login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
