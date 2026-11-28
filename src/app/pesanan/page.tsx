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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full space-y-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-1">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Pesanan Saya</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2.5">
            <ShoppingBag className="size-7 text-yellow-600" />
            Pesanan Saya
          </h1>
          <p className="text-xs text-[#8a8a8a] mt-1">
            Riwayat pesanan, status verifikasi rekber, resi pengiriman, dan klaim garansi toko 7 hari.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#8a8a8a] text-xs">Memuat daftar pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-[#f6f6f4] rounded-[20px] border border-dashed border-[#ebebeb] space-y-4">
            <p className="font-bold text-ink text-sm sm:text-base">Belum ada riwayat pesanan.</p>
            <p className="text-xs text-[#8a8a8a]">Jelajahi ratusan komponen teruji siap kirim dengan garansi 7 hari.</p>
            <Link
              href="/katalog"
              className="inline-block px-5 py-2.5 bg-yellow-500 text-ink font-bold text-xs rounded-[12px] shadow-sm hover:bg-yellow-600 transition-all"
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white p-5 sm:p-6 rounded-[20px] border border-[#ebebeb] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-yellow-500/60 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs sm:text-sm text-ink">{o.order_code}</span>
                    <span className="text-xs text-[#8a8a8a]">&bull;</span>
                    <span className="text-xs text-[#8a8a8a]">
                      {new Date(o.created_at || "").toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-ink">
                    Rp {Number(o.total_amount).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-[#8a8a8a]">
                    Penerima: {o.recipient_name} ({o.shipping_city})
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={o.order_status} size="sm" />
                  <Link
                    href={`/pesanan/${o.id}`}
                    className="px-4 py-2 bg-[#f6f6f4] hover:bg-yellow-500 hover:text-ink text-xs font-bold text-ink rounded-[10px] transition-all flex items-center gap-1"
                  >
                    Detail
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
