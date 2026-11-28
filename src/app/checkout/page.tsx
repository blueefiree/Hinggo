"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateOrderBreakdown } from "@/lib/fee-calculator";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    recipient_name: "",
    recipient_phone: "",
    shipping_address: "",
    shipping_city: "Jakarta Selatan",
    shipping_postal_code: "12810",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.push("/masuk?redirect=/checkout");
        } else {
          setUser(d.user);
          setForm((prev) => ({
            ...prev,
            recipient_name: d.user.buyer_recipient_name || d.user.name,
            recipient_phone: d.user.buyer_phone || d.user.whatsapp || d.user.phone || "",
            shipping_address: d.user.buyer_full_address || "",
            shipping_city: d.user.buyer_city || "Jakarta",
            shipping_postal_code: d.user.buyer_postal_code || "10000",
          }));
        }
      });

    const saved = localStorage.getItem("hinggo_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, [router]);

  const breakdown = calculateOrderBreakdown(items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: items.map((i) => i.id),
          shippingDetails: form,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pesanan.");
      }

      // Clear cart
      localStorage.removeItem("hinggo_cart");
      window.dispatchEvent(new Event("storage"));

      // Redirect to order detail page
      router.push(`/pesanan/${data.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-1">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <Link href="/keranjang" className="hover:underline">Keranjang</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Checkout & Pembayaran</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2.5">
            <Lock className="size-6 text-yellow-600" />
            Checkout & Pembayaran Rekber
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-[12px] bg-danger-bg border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-5">
            <h3 className="font-bold text-base text-ink pb-3 border-b border-[#ebebeb]">
              Alamat Pengiriman Pembeli
            </h3>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Nama Penerima</label>
              <input
                type="text"
                required
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                className="w-full h-11 px-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Nomor WhatsApp / HP</label>
              <input
                type="text"
                required
                value={form.recipient_phone}
                onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
                className="w-full h-11 px-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Alamat Lengkap (Jalan, RT/RW, No. Rumah, Patokan)</label>
              <textarea
                required
                rows={3}
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                className="w-full p-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Kota / Kabupaten</label>
                <input
                  type="text"
                  required
                  value={form.shipping_city}
                  onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                  className="w-full h-11 px-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Kode Pos</label>
                <input
                  type="text"
                  required
                  value={form.shipping_postal_code}
                  onChange={(e) => setForm({ ...form, shipping_postal_code: e.target.value })}
                  className="w-full h-11 px-3.5 border border-[#ebebeb] rounded-[12px] text-xs sm:text-sm text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#f6f6f4] rounded-[12px] border border-[#ebebeb] text-xs text-[#4b4b4b] flex items-start gap-2.5">
              <CheckCircle2 className="size-4.5 text-[#1f9d55] shrink-0 mt-0.5" />
              <span>
                Dengan menekan &ldquo;Buat Pesanan&rdquo;, barang otomatis dikunci selama <strong>24 jam</strong> untuk Anda (status Ditahan Menunggu Pembayaran) agar tidak dibeli pengguna lain.
              </span>
            </div>
          </div>

          {/* Items & Order Summary (5 cols - Sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-5">
              <h3 className="font-bold text-base text-ink pb-3 border-b border-[#ebebeb]">
                Rincian Pesanan ({items.length} Barang)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={i.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=100&q=80"}
                      alt=""
                      className="size-12 rounded-[10px] object-cover bg-[#fffbeb] border border-[#ebebeb] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink truncate">{i.model}</p>
                      <p className="text-[11px] text-[#8a8a8a]">{i.brand}</p>
                    </div>
                    <span className="font-extrabold text-ink shrink-0">
                      Rp {Number(i.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-[#4b4b4b] pt-3 border-t border-[#ebebeb]">
                <div className="flex justify-between">
                  <span>Subtotal Barang:</span>
                  <span className="font-semibold text-ink">
                    Rp {breakdown.itemsTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim Flat:</span>
                  <span className="font-semibold text-ink">
                    Rp {breakdown.shippingCost.toLocaleString("id-ID")}
                  </span>
                </div>
                {breakdown.insuranceCost > 0 && (
                  <div className="flex justify-between text-yellow-800">
                    <span>Asuransi Wajib Pengiriman:</span>
                    <span className="font-semibold">
                      Rp {breakdown.insuranceCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-[#ebebeb] text-sm font-extrabold text-ink">
                  <span>Total Tagihan:</span>
                  <span className="text-yellow-600 text-lg">
                    Rp {breakdown.totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? "Memproses Kunci Pesanan..." : "Konfirmasi & Buat Pesanan"}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[#8a8a8a] justify-center pt-1">
                <ShieldCheck className="size-4 text-[#1f9d55]" />
                <span>Dana aman di Rekber Hinggo &bull; Garansi 7 Hari</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
