"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { Item } from "@/types";
import { Package, Truck, PlusCircle } from "lucide-react";

export default function ConsignorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingModalItem, setTrackingModalItem] = useState<Item | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submittingTracking, setSubmittingTracking] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          window.location.href = "/masuk?redirect=/consignor/dasbor";
        } else {
          setUser(d.user);
          loadItems(d.user.id);
        }
      });
  }, []);

  const loadItems = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consignor/items?userId=${userId}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleSendTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalItem || !trackingNumber) return;

    setSubmittingTracking(true);
    try {
      const res = await fetch(`/api/items/${trackingModalItem.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "Dalam perjalanan ke Hingo",
          trackingNumber,
          notes: `Nomor resi pengiriman diisi oleh Consignor: ${trackingNumber}`,
        }),
      });

      if (res.ok) {
        setTrackingModalItem(null);
        setTrackingNumber("");
        if (user) loadItems(user.id);
      }
    } catch (e) {
    } finally {
      setSubmittingTracking(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-1">
              <Link href="/" className="hover:underline">Beranda</Link>
              <span>/</span>
              <span className="text-ink font-semibold">Dasbor Consignor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Dasbor Barang Saya</h1>
            <p className="text-xs text-[#8a8a8a] mt-1">
              Pantau status 20 tahapan barang titipan Anda dari screening hingga pencairan dana.
            </p>
          </div>

          <Link
            href="/titip-jual"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-ink font-bold text-xs sm:text-sm rounded-[12px] shadow-sm transition-all shrink-0"
          >
            <PlusCircle className="size-4" />
            Ajukan Barang Baru
          </Link>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-16 text-[#8a8a8a] text-xs">Memuat daftar barang titipan...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-[#f6f6f4] rounded-[20px] border border-dashed border-[#ebebeb] space-y-4">
            <Package className="size-10 text-[#8a8a8a] mx-auto" />
            <p className="font-bold text-ink text-sm sm:text-base">Anda belum memiliki barang titip jual.</p>
            <p className="text-xs text-[#8a8a8a]">Titipkan RAM, SSD, atau GPU bekas Anda dengan fee terjangkau dan penanganan teknis profesional.</p>
            <Link
              href="/titip-jual"
              className="inline-block px-5 py-2.5 bg-yellow-500 text-ink font-bold text-xs rounded-[12px] shadow-sm hover:bg-yellow-600 transition-all"
            >
              Ajukan Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 sm:p-6 rounded-[20px] border border-[#ebebeb] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-yellow-500/60 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
                    alt=""
                    className="size-16 sm:size-20 rounded-[12px] object-cover bg-[#fffbeb] border border-[#ebebeb] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">{item.category}</span>
                      <span className="text-xs font-mono text-[#8a8a8a]">&bull; {item.item_code}</span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-ink">{item.model}</h4>
                    <p className="text-xs text-[#8a8a8a] mt-0.5">
                      Harga Harapan: <strong className="text-ink">Rp {Number(item.expected_price).toLocaleString("id-ID")}</strong>
                      {item.current_listing_price && (
                        <span> &bull; Harga Tayang: <strong className="text-ink">Rp {Number(item.current_listing_price).toLocaleString("id-ID")}</strong></span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={item.status} size="md" />

                  {/* If Approved, Awaiting Shipping Tracking */}
                  {item.status === "Disetujui, menunggu kiriman" && (
                    <button
                      onClick={() => setTrackingModalItem(item)}
                      className="px-4 py-2 rounded-[10px] bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Truck className="size-3.5" />
                      Isi Resi Pengiriman
                    </button>
                  )}

                  {item.status === "Tayang" && (
                    <Link
                      href={`/produk/${item.id}`}
                      className="px-4 py-2 rounded-[10px] bg-[#f6f6f4] hover:bg-yellow-500 hover:text-ink text-xs font-bold text-ink transition-all"
                    >
                      Lihat di Web
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Isi Resi */}
        {trackingModalItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] p-6 max-w-md w-full border border-[#ebebeb] shadow-card space-y-4">
              <h3 className="font-bold text-base text-ink">Input Nomor Resi ke Gudang Hinggo</h3>
              <p className="text-xs text-[#4b4b4b] leading-relaxed">
                Silakan kirimkan unit <strong>{trackingModalItem.model}</strong> ke gudang Hinggo di Jakarta Selatan, lalu masukkan kurir dan nomor resi di bawah:
              </p>

              <form onSubmit={handleSendTracking} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Kurir & Nomor Resi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JNE Reguler - 0123456789"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full h-11 px-3.5 border border-[#ebebeb] rounded-[12px] text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTrackingModalItem(null)}
                    className="flex-1 py-2.5 bg-[#f6f6f4] hover:bg-gray-200 text-ink text-xs font-semibold rounded-[10px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTracking}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-[10px] shadow-xs"
                  >
                    {submittingTracking ? "Menyimpan..." : "Kirim Resi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
