"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, User, LogOut, MessageCircle, Heart } from "lucide-react";
import { User as UserType } from "@/types";

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    const updateCart = () => {
      const savedCart = localStorage.getItem("hinggo_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCartCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch (e) {}
      } else {
        setCartCount(0);
      }
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#ebebeb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 h-[72px] flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="size-9 rounded-[10px] bg-yellow-500 flex items-center justify-center font-extrabold text-xl text-ink shadow-sm group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-ink">
            Hinggo
          </span>
        </Link>

        {/* Search Bar — desktop only */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <form action="/katalog" method="GET" className="w-full">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
              <input
                type="text"
                name="q"
                placeholder="Cari keyboard, mouse, headset, monitor…"
                className="w-full h-11 pl-10 pr-4 bg-[#f6f6f4] border border-transparent rounded-[12px] text-sm text-ink placeholder-[#8a8a8a] focus:bg-white focus:border-yellow-500 focus:outline-none transition-all"
              />
            </div>
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4b4b4b]">
          <Link href="/katalog" className="hover:text-yellow-600 transition-colors">
            Kategori
          </Link>
          <Link href="/kebijakan" className="hover:text-yellow-600 transition-colors">
            Promo
          </Link>
          <Link href="/titip-jual" className="hover:text-yellow-600 transition-colors font-semibold text-ink">
            Jual
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="px-2.5 py-1 bg-yellow-100 text-ink text-xs font-bold rounded-full border border-yellow-200 hover:bg-yellow-200"
            >
              Dasbor Admin
            </Link>
          )}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Chat icon */}
          <button className="hidden lg:flex p-2 text-[#4b4b4b] hover:text-yellow-600 rounded-full hover:bg-gray-100 transition-colors" title="Chat">
            <MessageCircle className="size-5" />
          </button>

          {/* Wishlist icon */}
          <button className="hidden lg:flex p-2 text-[#4b4b4b] hover:text-yellow-600 rounded-full hover:bg-gray-100 transition-colors" title="Favorit">
            <Heart className="size-5" />
          </button>

          {/* Cart icon */}
          <Link
            href="/keranjang"
            className="relative p-2 text-[#4b4b4b] hover:text-yellow-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Keranjang"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-ink text-[10px] font-bold size-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User / Auth */}
          {user ? (
            <div className="flex items-center gap-1 ml-1">
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/consignor/dasbor"}
                className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
              >
                <User className="size-4 text-[#4b4b4b]" />
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-[#8a8a8a] hover:text-danger rounded-[12px] hover:bg-gray-100 transition-colors"
                title="Keluar"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              className="ml-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink text-sm font-semibold rounded-[12px] shadow-sm transition-all"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
