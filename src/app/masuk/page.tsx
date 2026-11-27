"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
          <p className="text-xs text-gray-500 mt-1">
            Satu akun dapat digunakan sebagai Consignor maupun Pembeli.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 shadow-card space-y-6">
          {/* Tabs */}
          <div className="flex rounded-btn bg-gray-100 p-1">
            <button
              onClick={() => { setTab("LOGIN"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all ${
                tab === "LOGIN" ? "bg-white text-ink shadow-xs" : "text-gray-500 hover:text-ink"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setTab("REGISTER"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-xs font-bold rounded-[10px] transition-all ${
                tab === "REGISTER" ? "bg-white text-ink shadow-xs" : "text-gray-500 hover:text-ink"
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-btn bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === "LOGIN" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Demo Quick Logins */}
              <div className="p-3 bg-yellow-50/70 border border-yellow-200 rounded-btn text-[11px] text-gray-700 space-y-1">
                <p className="font-bold text-ink">Akun Uji Coba Demo:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "admin@hinggo.id", password: "Admin123!" })}
                    className="px-2 py-0.5 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-900 font-semibold"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "seller1@gmail.com", password: "Password123!" })}
                    className="px-2 py-0.5 bg-white hover:bg-gray-100 border border-yellow-200 rounded text-gray-800 font-medium"
                  >
                    Consignor (Budi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: "buyer1@gmail.com", password: "Password123!" })}
                    className="px-2 py-0.5 bg-white hover:bg-gray-100 border border-yellow-200 rounded text-gray-800 font-medium"
                  >
                    Pembeli (Dimas)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs rounded-btn shadow-xs transition-all"
              >
                {loading ? "Memproses Masuk..." : "Masuk ke Akun"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nama sesuai KTP"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp Aktif</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxx (untuk kontak admin)"
                    value={registerForm.whatsapp}
                    onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-gray-500 leading-relaxed">
                Pendaftaran langsung aktif tanpa verifikasi OTP email (sesuai spesifikasi MVP). KTP diunggah saat pertama mengajukan barang titipan.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-xs rounded-btn shadow-xs transition-all"
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
