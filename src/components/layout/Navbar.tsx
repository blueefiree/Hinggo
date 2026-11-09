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
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LogOut,
  Package,
  Layers,
  Settings,
} from "lucide-react";

import { useHingoStore } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cart, wishlist, logout, isLoadingUser } = useHingoStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* Sub-header Banner */}
      <div className="border-b border-[#F0F0EE] bg-[#FFFBEB] px-4 py-1.5 text-xs text-[#1A1A1A]">
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
                  className="font-semibold text-neutral-600 hover:text-black hidden sm:inline"
                >
                  Cara titip jual
                </Link>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-neutral-600 font-medium">
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
              <div className="hidden sm:flex items-center gap-4 text-neutral-600">
                <Link
                  href="/how-it-works"
                  className="flex items-center gap-1 font-medium hover:text-black hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Cara titip jual
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-3.5 gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC629] font-black text-xl text-[#1A1A1A] shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#FFC420]">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">
              Hingo
            </span>
            <span className="text-[10px] font-medium text-neutral-500 -mt-1 hidden sm:block">
              Preloved Gear Marketplace
            </span>
          </div>
        </Link>

        {/* Center Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl items-center relative"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keyboard, mouse, headset, monitor..."
              className="w-full rounded-full bg-[#F6F6F4] py-2.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder-neutral-400 outline-none transition border border-transparent focus:border-[#FFC629] focus:bg-white focus:ring-2 focus:ring-[#FFC629]/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          </div>
        </form>

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Quick links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-neutral-700">
            <Link href="/catalog" className="hover:text-black transition">
              Katalog
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

          {/* Icon buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
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
              href={user ? "/wishlist" : "/auth/login?callbackUrl=/wishlist"}
              onClick={(e) => handleProtectedClick(e, "/wishlist")}
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <Heart className="h-5 w-5" />
              {user && wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              href={user ? "/cart" : "/auth/login?callbackUrl=/cart"}
              onClick={(e) => handleProtectedClick(e, "/cart")}
              aria-label="Keranjang"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <ShoppingBag className="h-5 w-5" />
              {user && cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold text-white animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          <div className="hidden sm:block h-6 w-px bg-neutral-200" />

          {/* User Section: If Guest -> Yellow Masuk button; If User -> Profil Pill with Dropdown */}
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
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-[#F6F6F4] px-3 py-1.5 hover:bg-[#EAEAEA] transition cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-[#FFC629]"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFC629] text-[10px] font-bold text-black uppercase">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-bold text-[#1A1A1A]">
                  Profil
                </span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
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

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Input in Sub-bar */}
      <div className="md:hidden px-4 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gear preloved..."
            className="w-full rounded-full bg-[#F6F6F4] py-2 pl-10 pr-4 text-sm text-[#1A1A1A] outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 md:hidden flex flex-col gap-3 shadow-lg">
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Katalog & Pencarian
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href={user ? "/seller/consignments" : "/auth/login?callbackUrl=/seller/consignments"}
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleProtectedClick(e, "/seller/consignments");
            }}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Ruang Penjual (Titip Jual)
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href={user ? "/orders" : "/auth/login?callbackUrl=/orders"}
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleProtectedClick(e, "/orders");
            }}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Daftar Pesanan & Transaksi
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href="/promo"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Kupon & Voucher Promo
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 font-bold">
              Hot
            </span>
          </Link>
          <Link
            href={user ? "/wishlist" : "/auth/login?callbackUrl=/wishlist"}
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleProtectedClick(e, "/wishlist");
            }}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Gear Impian (Wishlist)
            {user && wishlist.length > 0 && (
              <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Cara Titip Jual & Rekening Bersama
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href={user ? "/account" : "/auth/login?callbackUrl=/account"}
            onClick={(e) => {
              setMobileMenuOpen(false);
              handleProtectedClick(e, "/account");
            }}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Pengaturan Akun & Rekening Bank
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            {!user ? (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#FFC629] text-black text-sm font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#FFC629] text-black text-sm font-bold shadow-xs flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-red-600 text-xs font-bold cursor-pointer"
                >
                  Keluar (Logout)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
