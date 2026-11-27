"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    // Check logged in user
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-6 flex items-center gap-2">
          <Lock className="size-6 text-yellow-600" />
          Checkout & Pembayaran Aman
        </h1>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-btn bg-danger-bg border border-danger/30 text-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Shipping Form (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 rounded-card border border-gray-200 space-y-4">
            <h3 className="font-bold text-base text-ink">Alamat Pengiriman</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Penerima</label>
              <input
                type="text"
                required
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                required
                value={form.recipient_phone}
                onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah)</label>
              <textarea
                required
                rows={3}
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  required
                  value={form.shipping_city}
                  onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kode Pos</label>
                <input
                  type="text"
                  required
                  value={form.shipping_postal_code}
                  onChange={(e) => setForm({ ...form, shipping_postal_code: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-btn border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span>
                Dengan menekan &ldquo;Buat Pesanan&rdquo;, barang akan dikunci selama 24 jam untuk Anda (status Ditahan Menunggu Pembayaran).
              </span>
            </div>
          </div>

          {/* Items & Payment Breakdown (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-gray-50 p-6 rounded-card border border-gray-200 space-y-4">
              <h3 className="font-bold text-base text-ink">Ringkasan Pesanan</h3>

              {/* Items summary */}
              <div className="space-y-3 pb-3 border-b border-gray-200 max-h-48 overflow-y-auto">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs">
                    <span className="font-medium text-gray-800 line-clamp-1 max-w-[180px]">{i.model}</span>
                    <span className="font-bold text-ink">Rp {Number(i.price).toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>

              {/* Breakdown costs */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Barang:</span>
                  <span className="font-semibold text-ink">Rp {breakdown.itemsTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir Tetap:</span>
                  <span className="font-semibold text-ink">Rp {breakdown.shippingCost.toLocaleString("id-ID")}</span>
                </div>
                {breakdown.insuranceCost > 0 && (
                  <div className="flex justify-between text-yellow-800">
                    <span>Asuransi (&gt; Rp 500rb):</span>
                    <span className="font-semibold">Rp {breakdown.insuranceCost.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold text-ink">
                  <span>Total Tagihan:</span>
                  <span className="text-yellow-600 text-base">
                    Rp {breakdown.totalPayment.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 disabled:bg-gray-300 text-ink font-bold text-sm rounded-btn shadow-xs transition-all"
              >
                {loading ? "Mengunci Barang..." : "Buat Pesanan & Bayar"}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 justify-center">
                <ShieldCheck className="size-3.5 text-success" />
                <span>Dana aman lewat Rekber Hinggo</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
