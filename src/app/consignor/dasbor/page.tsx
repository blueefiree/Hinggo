"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { Item } from "@/types";
import { Package, Truck, ArrowRight, PlusCircle, RefreshCw } from "lucide-react";

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Dasbor Barang Saya (Consignor)</h1>
            <p className="text-xs text-gray-500 mt-1">
              Pantau status 20 tahapan barang titipan Anda dari screening hingga pencairan dana.
            </p>
          </div>

          <Link
            href="/titip-jual"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-ink font-bold text-xs rounded-btn shadow-xs transition-all"
          >
            <PlusCircle className="size-4" />
            Ajukan Barang Baru
          </Link>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-xs">Memuat daftar barang titipan...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-card border border-dashed border-gray-300 space-y-3">
            <Package className="size-8 text-gray-400 mx-auto" />
            <p className="font-semibold text-gray-700 text-sm">Anda belum memiliki barang titip jual.</p>
            <Link
              href="/titip-jual"
              className="inline-block px-4 py-2 bg-yellow-500 text-ink font-bold text-xs rounded-btn"
            >
              Ajukan Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-card border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
                    alt=""
                    className="size-16 rounded-btn object-cover bg-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-yellow-700 uppercase">{item.category}</span>
                      <span className="text-xs font-mono text-gray-400">&bull; {item.item_code}</span>
                    </div>
                    <h4 className="font-bold text-sm text-ink">{item.model}</h4>
                    <p className="text-xs text-gray-500">
                      Harga Harapan: <strong>Rp {Number(item.expected_price).toLocaleString("id-ID")}</strong>
                      {item.current_listing_price && (
                        <span> &bull; Harga Tayang: <strong>Rp {Number(item.current_listing_price).toLocaleString("id-ID")}</strong></span>
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
                      className="px-3.5 py-2 rounded-btn bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="size-3.5" />
                      Isi Resi Pengiriman
                    </button>
                  )}

                  {item.status === "Tayang" && (
                    <Link
                      href={`/produk/${item.id}`}
                      className="px-3 py-1.5 rounded-btn bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800"
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-card p-6 max-w-md w-full border border-gray-200 shadow-card space-y-4">
              <h3 className="font-bold text-base text-ink">Input Nomor Resi ke Gudang Hinggo</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Kirimkan barang <strong>{trackingModalItem.model}</strong> ke alamat:
                <br />
                <span className="font-semibold text-ink">Gudang Hinggo, Jl. Tebet Raya No. 42, Jakarta Selatan 12810</span>
              </p>

              <form onSubmit={handleSendTracking} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor Resi Pengiriman</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JNE / J&T: JP8829102910"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-btn text-xs text-ink focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTrackingModalItem(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-btn"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTracking}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-ink text-xs font-bold rounded-btn"
                  >
                    {submittingTracking ? "Menyimpan..." : "Simpan & Ubah ke Dalam Perjalanan"}
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
