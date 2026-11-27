"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { Order } from "@/types";
import { ShoppingBag, ChevronRight } from "lucide-react";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.user) {
          window.location.href = "/masuk?redirect=/pesanan";
          return;
        }

        const res = await fetch(`/api/orders?buyerId=${d.user.id}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2">
            <ShoppingBag className="size-7 text-yellow-600" />
            Pesanan Saya
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Riwayat pesanan, status pembayaran, nomor resi pengiriman, dan klaim garansi 7 hari.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-xs">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-card border border-dashed border-gray-300 space-y-3">
            <p className="font-semibold text-gray-700 text-sm">Belum ada riwayat pesanan.</p>
            <Link
              href="/katalog"
              className="inline-block px-4 py-2 bg-yellow-500 text-ink font-bold text-xs rounded-btn"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/pesanan/${o.id}`}
                className="block bg-white p-5 rounded-card border border-gray-200 hover:border-yellow-500 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-ink">{o.order_code}</span>
                      <span className="text-xs text-gray-400">&bull; {new Date(o.created_at || "").toLocaleDateString("id-ID")}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tujuan: <strong>{o.recipient_name}</strong> ({o.shipping_city})
                    </p>
                    <p className="text-sm font-extrabold text-ink mt-1">
                      Rp {Number(o.total_amount).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={o.order_status} size="md" />
                    <ChevronRight className="size-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
