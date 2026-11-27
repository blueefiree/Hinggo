"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types";
import { ShoppingBag, Zap, Check } from "lucide-react";

interface AddToCartProps {
  item: Item;
  isAvailable: boolean;
}

export default function AddToCartButton({ item, isAvailable }: AddToCartProps) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!isAvailable) return;
    const existing = localStorage.getItem("hinggo_cart");
    let cart: any[] = [];
    if (existing) {
      try {
        cart = JSON.parse(existing);
      } catch (e) {}
    }

    if (!cart.some((c) => c.id === item.id)) {
      cart.push({
        id: item.id,
        item_code: item.item_code,
        brand: item.brand,
        model: item.model,
        category: item.category,
        price: item.current_listing_price || item.expected_price,
        photos: item.photos,
      });
      localStorage.setItem("hinggo_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addToCart();
    router.push("/checkout");
  };

  if (!isAvailable) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full py-3.5 bg-gray-200 text-gray-500 font-bold text-sm rounded-btn cursor-not-allowed"
        >
          Barang Tidak Tersedia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={addToCart}
        className={`flex-1 py-3.5 px-4 rounded-btn border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          added
            ? "bg-success text-white border-success"
            : "bg-white hover:bg-gray-50 border-gray-300 text-ink"
        }`}
      >
        {added ? (
          <>
            <Check className="size-4.5" />
            Masuk Keranjang
          </>
        ) : (
          <>
            <ShoppingBag className="size-4.5 text-yellow-600" />
            Tambah ke Keranjang
          </>
        )}
      </button>

      <button
        onClick={buyNow}
        className="flex-1 py-3.5 px-4 rounded-btn bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
      >
        <Zap className="size-4.5 fill-current" />
        Beli Sekarang
      </button>
    </div>
  );
}
