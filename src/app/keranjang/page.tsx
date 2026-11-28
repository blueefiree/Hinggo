"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { calculateOrderBreakdown } from "@/lib/fee-calculator";
import { Trash2, ShieldCheck, ArrowRight, ShoppingCart } from "lucide-react";

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-1">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Keranjang Belanja</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2.5">
            <ShoppingCart className="size-7 text-yellow-600" />
            Keranjang Belanja
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-[#f6f6f4] rounded-[16px] border border-dashed border-[#ebebeb] space-y-4">
            <p className="text-[#4b4b4b] font-bold text-base">Keranjang Anda masih kosong.</p>
            <p className="text-xs text-[#8a8a8a] max-w-sm mx-auto">
              Barang di keranjang belum ditahan sebelum Anda menyelesaikan checkout.
            </p>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-ink text-xs sm:text-sm font-bold rounded-[12px] shadow-sm hover:bg-yellow-600 active:scale-95 transition-all"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-3.5 bg-[#fffbeb] border border-[#ffe58a] rounded-[12px] text-xs text-[#4b4b4b] flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-yellow-600 shrink-0" />
                <span>
                  <strong>Perhatian:</strong> Barang di keranjang belum dikunci. Segera selesaikan checkout agar barang tidak keduluan pembeli lain.
                </span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-[16px] border border-[#ebebeb] shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
                      alt=""
                      className="size-16 sm:size-20 rounded-[12px] object-cover bg-[#fffbeb] shrink-0 border border-[#ebebeb]"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-bold text-yellow-600 uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-ink truncate mt-0.5">
                        {item.model}
                      </h4>
                      <p className="text-xs sm:text-sm font-extrabold text-ink mt-1">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-[#8a8a8a] hover:text-danger rounded-[10px] hover:bg-gray-100 transition-colors shrink-0"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="size-4.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Box (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-5 sticky top-24">
                <h3 className="font-bold text-base text-ink pb-3 border-b border-[#ebebeb]">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 text-xs text-[#4b4b4b]">
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
                  <div className="flex justify-between pt-3 border-t border-[#ebebeb] text-sm font-extrabold text-ink">
                    <span>Total Pembayaran:</span>
                    <span className="text-yellow-600 text-lg">
                      Rp {breakdown.totalPayment.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink font-bold text-sm rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="size-4.5" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#8a8a8a] justify-center">
                  <ShieldCheck className="size-4 text-[#1f9d55]" />
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
