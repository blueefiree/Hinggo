"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, ShieldCheck, User, LogOut, PackagePlus } from "lucide-react";
import { User as UserType } from "@/types";

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Fetch logged in user
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    // Read cart from localStorage
    const savedCart = localStorage.getItem("hinggo_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch (e) {}
    }

    const handleStorageChange = () => {
      const c = localStorage.getItem("hinggo_cart");
      if (c) {
        try {
          setCartCount(JSON.parse(c).length);
        } catch (e) {}
      } else {
        setCartCount(0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="size-9 rounded-[10px] bg-yellow-500 flex items-center justify-center font-extrabold text-xl text-ink shadow-sm group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-ink">
            Hinggo
          </span>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <form action="/katalog" method="GET" className="w-full">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-gray-500" />
              <input
                type="text"
                name="q"
                placeholder="Cari RAM DDR4, SSD NVMe, GPU RTX..."
                className="w-full h-11 pl-10 pr-4 bg-gray-100 border border-transparent rounded-btn text-sm text-ink placeholder-gray-500 focus:bg-white focus:border-yellow-500 focus:outline-none transition-all"
              />
            </div>
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/katalog" className="hover:text-yellow-600 transition-colors">
            Katalog
          </Link>
          <Link href="/kebijakan" className="hover:text-yellow-600 transition-colors">
            Garansi 7 Hari
          </Link>
          <Link
            href="/titip-jual"
            className="flex items-center gap-1.5 text-ink font-semibold hover:text-yellow-600 transition-colors"
          >
            <PackagePlus className="size-4 text-yellow-600" />
            Titip Jual
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Icon */}
          <Link
            href="/keranjang"
            className="relative p-2 text-ink hover:text-yellow-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Keranjang Belanja"
          >
            <ShoppingBag className="size-5.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-ink text-xs font-bold size-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/consignor/dasbor"}
                className="flex items-center gap-2 px-3 py-2 rounded-btn bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
              >
                <User className="size-4 text-gray-700" />
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-danger rounded-btn hover:bg-gray-100 transition-colors"
                title="Keluar"
              >
                <LogOut className="size-4.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-ink text-sm font-semibold rounded-btn shadow-sm transition-all"
            >
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
