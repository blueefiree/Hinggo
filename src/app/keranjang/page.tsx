"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateOrderBreakdown } from "@/lib/fee-calculator";
import { Trash2, ShieldCheck, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hinggo_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const removeItem = (id: string) => {
    const updated = cartItems.filter((i) => i.id !== id);
    setCartItems(updated);
    localStorage.setItem("hinggo_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const breakdown = calculateOrderBreakdown(cartItems);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-6 flex items-center gap-2">
          <ShoppingBag className="size-7 text-yellow-600" />
          Keranjang Belanja
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-card border border-dashed border-gray-300 space-y-4">
            <p className="text-gray-600 font-semibold">Keranjang Anda masih kosong.</p>
            <p className="text-xs text-gray-500">
              Barang di keranjang belum ditahan sebelum Anda menyelesaikan checkout.
            </p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-ink text-xs font-bold rounded-btn shadow-xs hover:bg-yellow-600"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-btn text-xs text-amber-900">
                Catatan: Barang di keranjang belum ditahan. Segera selesaikan checkout agar barang tidak dibeli pengguna lain.
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-card border border-gray-200 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
                      alt=""
                      className="size-16 rounded-btn object-cover bg-gray-100"
                    />
                    <div>
                      <span className="text-[11px] font-bold text-yellow-700 uppercase">{item.brand}</span>
                      <h4 className="font-bold text-sm text-ink">{item.model}</h4>
                      <p className="text-xs font-bold text-ink mt-0.5">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-danger rounded-btn hover:bg-gray-100 transition-colors"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="size-4.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Box (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 p-6 rounded-card border border-gray-200 space-y-4 sticky top-24">
                <h3 className="font-bold text-base text-ink">Ringkasan Belanja</h3>

                <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Total Harga Barang:</span>
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
                      <span>Asuransi Wajib (&gt; Rp 500rb):</span>
                      <span className="font-semibold">
                        Rp {breakdown.insuranceCost.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200 text-sm font-extrabold text-ink">
                    <span>Total Pembayaran:</span>
                    <span className="text-yellow-600 text-base">
                      Rp {breakdown.totalPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-btn shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="size-4.5" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 justify-center">
                  <ShieldCheck className="size-3.5 text-success" />
                  <span>Garansi Toko 7 Hari Sejak Diterima</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
