"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "admin@hinggo.id",
    password: "Admin123!",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal masuk.");

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/consignor/dasbor");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar.");

      setSuccessMsg("Pendaftaran berhasil! Akun langsung aktif.");
      setTimeout(() => router.push("/consignor/dasbor"), 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center mb-8">
          <div className="size-12 rounded-[12px] bg-yellow-500 flex items-center justify-center font-extrabold text-2xl text-ink mx-auto mb-3 shadow-xs">
            H
          </div>
          <h1 className="text-2xl font-extrabold text-ink">
            {tab === "LOGIN" ? "Masuk ke Akun Hinggo" : "Daftar Akun Baru"}
          </h1>
          <p className="text-xs text-[#8a8a8a] mt-1">
            Satu akun dapat digunakan sebagai Consignor maupun Pembeli.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-card space-y-6">
          {/* Tabs */}
          <div className="flex rounded-[12px] bg-[#f6f6f4] p-1">
            <button
              onClick={() => { setTab("LOGIN"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all ${
                tab === "LOGIN" ? "bg-white text-ink shadow-xs" : "text-[#8a8a8a] hover:text-ink"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab("REGISTER"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all ${
                tab === "REGISTER" ? "bg-white text-ink shadow-xs" : "text-[#8a8a8a] hover:text-ink"
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-[12px] bg-danger-bg border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-[12px] bg-[#e6f6ec] border border-emerald-200 text-[#1f9d55] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === "LOGIN" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Demo Quick Logins */}
              <div className="p-3.5 bg-[#fffbeb] border border-[#ffe58a] rounded-[12px] text-[11px] text-[#4b4b4b] space-y-1.5">
                <p className="font-bold text-ink">Akun Uji Coba Demo Investor:</p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "admin@hinggo.id", password: "Admin123!" })}
                    className="px-2.5 py-1 bg-yellow-500 text-ink rounded-[8px] font-bold shadow-xs hover:bg-yellow-600 transition-colors"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "seller1@gmail.com", password: "Password123!" })}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-[#ffe58a] rounded-[8px] text-ink font-semibold transition-colors"
                  >
                    Consignor (Budi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "buyer1@gmail.com", password: "Password123!" })}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-[#ffe58a] rounded-[8px] text-ink font-semibold transition-colors"
                  >
                    Pembeli (Dimas)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-[12px] shadow-sm transition-all"
              >
                {loading ? "Memproses Masuk..." : "Masuk ke Akun"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai KTP"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Nomor WhatsApp Aktif</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxx (untuk kontak admin)"
                    value={registerForm.whatsapp}
                    onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#8a8a8a] leading-relaxed">
                Pendaftaran langsung aktif tanpa verifikasi OTP email (sesuai spesifikasi MVP). KTP diunggah saat pertama mengajukan barang titipan.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-[12px] shadow-sm transition-all"
              >
                {loading ? "Mendaftar..." : "Buat Akun Sekarang"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
