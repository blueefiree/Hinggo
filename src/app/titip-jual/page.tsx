"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PackagePlus, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { calculateConsignmentFee } from "@/lib/fee-calculator";

export default function SubmitConsignmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    category: "RAM",
    brand: "",
    model: "",
    condition: "Bekas Normal",
    usage_duration: "1 tahun",
    completeness: "Unit Only",
    expected_price: 500000,
    min_price: 450000,
    photo_url: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80",
    ktp_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    ownership_proof_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    ownership_proof_type: "NOTA_PEMBELIAN",
    declaration_own_item: false,
    agree_fee: false,
    agree_shipping: false,
    agree_warranty: false,
    agree_proposal: false,
    agree_end_term: false,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/masuk?redirect=/titip-jual");
        } else {
          setUser(d.user);
        }
      });
  }, [router]);

  const feeCalc = calculateConsignmentFee(form.expected_price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.declaration_own_item) {
      setErrorMsg("Anda wajib menyatakan bahwa barang ini adalah milik pribadi yang sah.");
      return;
    }
    if (!form.agree_fee || !form.agree_shipping || !form.agree_warranty) {
      setErrorMsg("Anda wajib menyetujui seluruh ketentuan penitipan Hinggo.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/consignor/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan barang.");

      router.push("/consignor/dasbor");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center mx-auto mb-2">
            <PackagePlus className="size-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Formulir Pengajuan Titip Jual</h1>
          <p className="text-xs text-gray-500 mt-1">
            Langkah {step} dari 3 — Khusus kategori RAM, SSD, dan GPU bekas.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`size-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === s
                    ? "bg-yellow-500 text-ink shadow-xs"
                    : step > s
                    ? "bg-success text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              <span className="text-xs font-medium text-gray-600 hidden sm:inline">
                {s === 1 ? "Info Hardware" : s === 2 ? "Harga & Dokumen" : "Persetujuan"}
              </span>
              {s < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 shadow-card space-y-6">
          {/* STEP 1: Hardware Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-ink">Informasi Spesifikasi Hardware</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Komponen</label>
                <div className="grid grid-cols-3 gap-3">
                  {["RAM", "SSD", "GPU"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`py-2.5 rounded-btn text-xs font-bold border transition-all ${
                        form.category === cat
                          ? "bg-yellow-500 text-ink border-yellow-500 shadow-xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Merek / Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Corsair, Samsung, ASUS"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Model Lengkap & Varian</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Vengeance LPX 16GB (2x8GB) 3200MHz"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Kondisi Fisik</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bekas Normal, Pin Emas Bersih"
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lama Pemakaian</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1 tahun 2 bulan"
                    value={form.usage_duration}
                    onChange={(e) => setForm({ ...form, usage_duration: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kelengkapan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Unit + Box Mika Asli / Fullset"
                  value={form.completeness}
                  onChange={(e) => setForm({ ...form, completeness: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL Foto Fisik Barang</label>
                <input
                  type="url"
                  required
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!form.brand || !form.model}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 text-ink text-xs font-bold rounded-btn shadow-xs flex items-center gap-2"
                >
                  Lanjut ke Dokumen & Harga
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing & Documents */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-ink">Penetapan Harga & Unggah Dokumen Privat</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga Yang Diinginkan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={50000}
                    step={10000}
                    value={form.expected_price}
                    onChange={(e) => setForm({ ...form, expected_price: Number(e.target.value) })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Harga Minimum Penurunan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={50000}
                    step={10000}
                    value={form.min_price}
                    onChange={(e) => setForm({ ...form, min_price: Number(e.target.value) })}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Batas terendah jika ada usulan penurunan harga otomatis.</p>
                </div>
              </div>

              {/* Live Fee Calculator Preview */}
              <div className="p-4 bg-yellow-50 rounded-btn border border-yellow-200 text-xs space-y-1">
                <div className="flex justify-between text-yellow-900">
                  <span>Fee Hinggo ({feeCalc.feeRateText}):</span>
                  <span className="font-bold">Rp {feeCalc.feeAmount.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-ink font-bold pt-1 border-t border-yellow-200">
                  <span>Estimasi Bersih Diterima Consignor:</span>
                  <span className="text-yellow-700">Rp {feeCalc.consignorAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Private Documents */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-ink">Dokumen Privat (Tersimpan di Private Bucket)</h4>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">URL Foto KTP</label>
                  <input
                    type="url"
                    required
                    value={form.ktp_url}
                    onChange={(e) => setForm({ ...form, ktp_url: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">Tipe Bukti Kepemilikan</label>
                  <select
                    value={form.ownership_proof_type}
                    onChange={(e) => setForm({ ...form, ownership_proof_type: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="NOTA_PEMBELIAN">Nota / Bukti Pembelian</option>
                    <option value="DUS_ORIGINAL">Foto Dus Asli dengan Serial Number</option>
                    <option value="SERIAL_KERTAS_NAMA">Foto Serial Number + Kertas Nama & Tanggal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">URL Bukti Kepemilikan</label>
                  <input
                    type="url"
                    required
                    value={form.ownership_proof_url}
                    onChange={(e) => setForm({ ...form, ownership_proof_url: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-btn hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-btn shadow-xs flex items-center gap-2"
                >
                  Lanjut ke Persetujuan Syarat
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Terms & Submission */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-ink">Pernyataan & Persetujuan Syarat Penitipan</h3>

              <div className="space-y-3 p-4 bg-gray-50 rounded-btn border border-gray-200 text-xs text-gray-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.declaration_own_item}
                    onChange={(e) => setForm({ ...form, declaration_own_item: e.target.checked })}
                    className="mt-0.5 rounded text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>
                    <strong>Pernyataan Kepemilikan:</strong> Saya menyatakan bahwa barang ini adalah milik saya secara sah dan bukan barang curian atau sengketa.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agree_fee}
                    onChange={(e) => setForm({ ...form, agree_fee: e.target.checked })}
                    className="mt-0.5 rounded text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>
                    Saya menyetujui skema fee Hinggo (Rp 10.000 flat untuk harga &le; Rp 200rb, atau 5% untuk harga &gt; Rp 200rb).
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agree_shipping}
                    onChange={(e) => setForm({ ...form, agree_shipping: e.target.checked })}
                    className="mt-0.5 rounded text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>
                    Saya bersedia menanggung ongkos kirim pengiriman barang ke gudang Hinggo di Jakarta Selatan.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.agree_warranty}
                    onChange={(e) => setForm({ ...form, agree_warranty: e.target.checked })}
                    className="mt-0.5 rounded text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>
                    Saya memahami pencairan dana penjualan dilakukan setelah masa garansi toko 7 hari pembeli selesai tanpa klaim aktif.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-btn hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 active:scale-95 disabled:bg-gray-300 text-ink text-xs font-bold rounded-btn shadow-xs transition-all"
                >
                  {loading ? "Mengirimkan Pengajuan..." : "Kirim Pengajuan Titip Jual"}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>

      <Footer />
    </div>
  );
}
