"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LogOut,
  Package,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { useHingoStore } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cart, wishlist, logout } = useHingoStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSellerRoute = pathname?.startsWith("/seller");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/catalog");
    }
  };

  const handleProtectedClick = (e: React.MouseEvent, targetPath: string) => {
    if (!user) {
      e.preventDefault();
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md">
      {/* Desktop Sub-header Banner (Hidden on Mobile) */}
      <div className="hidden md:block border-b border-[#F0F0EE] bg-[#FFFBEB] px-4 py-1.5 text-xs text-[#1A1A1A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {isSellerRoute && user ? (
            <>
              <div className="flex items-center gap-6">
                <Link
                  href="/seller/consignments"
                  className={`font-semibold transition hover:text-[#D97706] ${
                    pathname === "/seller/consignments"
                      ? "text-[#D97706] underline decoration-2 underline-offset-4"
                      : "text-neutral-700"
                  }`}
                >
                  Barang titipan saya
                </Link>
                <Link
                  href="/seller/consignments/new"
                  className={`font-semibold transition hover:text-[#D97706] ${
                    pathname === "/seller/consignments/new"
                      ? "text-[#D97706] underline decoration-2 underline-offset-4"
                      : "text-neutral-700"
                  }`}
                >
                  Ajukan titip jual
                </Link>
                <Link
                  href="/how-it-works"
                  className="font-semibold text-neutral-600 hover:text-black"
                >
                  Cara titip jual
                </Link>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Link href="/account" className="hover:underline">
                  Ruang penjual · {user.name}
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A1A1A]">
                  Titip jual gear.
                </span>
                <span className="text-neutral-600">
                  Kami cek, simpan, dan pasarkan.
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600 font-medium">
                <Link
                  href="/how-it-works"
                  className="hover:text-black hover:underline"
                >
                  Konsinyasi dikelola tim kami
                </Link>
                <span>·</span>
                <Link
                  href={user ? "/chat/support" : "/auth/login?callbackUrl=/chat/support"}
                  className="hover:text-black hover:underline"
                >
                  Pusat bantuan
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Top Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2 sm:px-4 sm:py-3.5 gap-3 sm:gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-8.5 w-8.5 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#FFC629] font-black text-lg sm:text-xl text-[#1A1A1A] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#FFC420]">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1A1A1A]">
              Hingo
            </span>
            <span className="text-[10px] font-medium text-neutral-500 -mt-1 hidden sm:block">
              Preloved Gear Marketplace
            </span>
          </div>
        </Link>

        {/* Center Search Bar (Desktop Only) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl items-center relative"
        >
          <div className="relative w-full">
            <input
              id="navbar-search"
              name="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari barang preloved impianmu..."
              aria-label="Cari barang preloved impianmu"
              className="w-full rounded-full bg-[#F6F6F4] py-2.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-neutral-400 outline-none transition border border-transparent focus:border-[#FFC629] focus:bg-white focus:ring-2 focus:ring-[#FFC629]/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          </div>
        </form>

        {/* Right Navigation for Desktop (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-5">
          {/* Quick links */}
          <nav className="flex items-center gap-5 text-sm font-semibold text-neutral-700">
            <Link href="/catalog" className="hover:text-black transition">
              Kategori
            </Link>
            <Link
              href="/promo"
              className="hover:text-black transition flex items-center gap-1"
            >
              Promo
              <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-600">
                Hot
              </span>
            </Link>
            <Link
              href={user ? "/seller/consignments" : "/auth/login?callbackUrl=/seller/consignments"}
              onClick={(e) => handleProtectedClick(e, "/seller/consignments")}
              className="rounded-full bg-[#FFFBEB] px-3.5 py-1.5 text-[#92400E] border border-[#FDE68A] hover:bg-[#FEF3C7] transition flex items-center gap-1 font-bold text-xs"
            >
              Titip jual
              <ArrowRight className="h-3 w-3" />
            </Link>
          </nav>

          {/* Icon buttons desktop */}
          <div className="flex items-center gap-2">
            {/* Chat Icon Button */}
            <Link
              href={user ? "/chat/product" : "/auth/login?callbackUrl=/chat/product"}
              onClick={(e) => handleProtectedClick(e, "/chat/product")}
              aria-label="Chat Admin"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label="Keranjang"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold text-white animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          <div className="h-6 w-px bg-neutral-200" />

          {/* User Section Desktop: If Guest -> Yellow Masuk button; If User -> Yellow Pill with User Name & Dropdown */}
          {!user ? (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-full bg-[#FFC629] px-4 py-2 text-xs font-black text-black shadow-xs hover:bg-[#FFC420] transition active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 rounded-full bg-[#FFC629] px-3.5 py-1.5 text-xs font-black text-[#1A1A1A] shadow-xs hover:bg-[#FFC420] transition cursor-pointer active:scale-95"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-5 w-5 rounded-full object-cover border border-[#1A1A1A]/20"
                  />
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <span className="font-extrabold max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-3 w-3 text-black/60" />
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                    <p className="font-bold text-[#1A1A1A] truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user.email || user.phone}</p>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-[#F6F6F4] transition font-medium"
                  >
                    <User className="h-4 w-4 text-neutral-500" />
                    <span>Pengaturan Akun</span>
                  </Link>

                  <Link
                    href="/seller/consignments"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-[#F6F6F4] transition font-medium"
                  >
                    <Layers className="h-4 w-4 text-neutral-500" />
                    <span>Barang Titipan Saya</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 hover:bg-[#F6F6F4] transition font-medium"
                  >
                    <Package className="h-4 w-4 text-neutral-500" />
                    <span>Daftar Transaksi</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 transition font-bold"
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span>Buka Panel Admin (/admin)</span>
                  </Link>

                  <div className="border-t border-neutral-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition font-bold text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation for Mobile (< 768px): TEPAT 2 IKON BERSIH SESUAI FIGMA */}
        <div className="flex md:hidden items-center gap-1.5">
          {isSellerRoute ? (
            <>
              {/* Ruang Penjual: Ikon Chat dan Ikon Profil */}
              <Link
                href={user ? "/chat/product" : "/auth/login?callbackUrl=/chat/product"}
                onClick={(e) => handleProtectedClick(e, "/chat/product")}
                aria-label="Chat Admin"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition active:scale-95"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </Link>
              <Link
                href={user ? "/account" : "/auth/login?callbackUrl=/account"}
                onClick={(e) => handleProtectedClick(e, "/account")}
                aria-label="Profil"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition active:scale-95"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-[#FFC629]"
                  />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </Link>
            </>
          ) : (
            <>
              {/* Halaman Umum/Pembeli: Hanya 2 Ikon (Chat dan Keranjang) */}
              <Link
                href={user ? "/chat/product" : "/auth/login?callbackUrl=/chat/product"}
                onClick={(e) => handleProtectedClick(e, "/chat/product")}
                aria-label="Chat Admin"
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition active:scale-95"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/cart"
                aria-label="Keranjang"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition active:scale-95"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                {cart.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] font-bold text-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sub-Header Ruang Penjual (< 768px): Krem #FFFBEB dengan 2 Tab Horizontal */}
      {isSellerRoute && (
        <div className="md:hidden border-t border-b border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <Link
              href="/seller/consignments"
              className={`font-extrabold transition ${
                pathname === "/seller/consignments"
                  ? "text-[#D97706] border-b-2 border-[#D97706] pb-0.5"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Barang titipan saya
            </Link>
            <Link
              href="/seller/consignments/new"
              className={`font-extrabold transition ${
                pathname === "/seller/consignments/new"
                  ? "text-[#D97706] border-b-2 border-[#D97706] pb-0.5"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Ajukan titip jual
            </Link>
          </div>
          {user && (
            <span className="text-[10px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md truncate max-w-[90px]">
              {user.name.split(" ")[0]}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
