"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSellerRoute = pathname?.startsWith("/seller");
  const isAuthRoute = pathname?.startsWith("/auth");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/catalog");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md">
      {/* Sub-header Banner */}
      <div className="border-b border-[#F0F0EE] bg-[#FFFBEB] px-4 py-1.5 text-xs text-[#1A1A1A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {isSellerRoute ? (
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
              </div>
              <div className="hidden sm:flex items-center gap-2 text-neutral-600 font-medium">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ruang penjual · Naya Putri</span>
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
                <span className="flex items-center gap-1 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Konsinyasi dikelola tim kami
                </span>
                <span>·</span>
                <Link
                  href="/chat/support"
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
            <Link
              href="/catalog"
              className="hover:text-black transition"
            >
              Kategori
            </Link>
            <Link
              href="/catalog?promo=true"
              className="hover:text-black transition flex items-center gap-1"
            >
              Promo
              <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-600">
                Hot
              </span>
            </Link>
            <Link
              href="/seller/consignments"
              className="rounded-full bg-[#FFFBEB] px-3 py-1 text-[#92400E] border border-[#FDE68A] hover:bg-[#FEF3C7] transition flex items-center gap-1"
            >
              Titip jual
              <ArrowRight className="h-3 w-3" />
            </Link>
          </nav>

          {/* Icon buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Chat Icon Button */}
            <Link
              href="/chat/product"
              aria-label="Chat Admin"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFC629]"></span>
              </span>
            </Link>

            {/* Wishlist Button */}
            <Link
              href="/catalog"
              aria-label="Wishlist"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart Button */}
            <Link
              href="/cart"
              aria-label="Keranjang"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 hover:bg-[#F6F6F4] transition"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#1A1A1A] text-[10px] font-bold text-white">
                1
              </span>
            </Link>
          </div>

          <div className="hidden sm:block h-6 w-px bg-neutral-200" />

          {/* User Pill / Login Link */}
          <Link
            href="/auth/verify-identity"
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-[#F6F6F4] p-1.5 pr-3 hover:bg-[#EAEAEA] transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC629] text-xs font-bold text-black">
              N
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight text-[#1A1A1A]">
                Naya
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold leading-none">
                KYC Review
              </span>
            </div>
          </Link>

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
            href="/seller/consignments"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Ruang Penjual (9 Titipan)
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 font-bold">
              4 Tindakan
            </span>
          </Link>
          <Link
            href="/seller/consignments/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Ajukan Titip Jual Baru
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <Link
            href="/orders/GRL-20261022-0842"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Status Pesanan & Escrow
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 font-bold">
              Paket Tiba
            </span>
          </Link>
          <Link
            href="/auth/verify-identity"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-800"
          >
            Verifikasi Identitas (KYC Naya)
            <ArrowRight className="h-4 w-4 text-neutral-400" />
          </Link>
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold"
            >
              Ganti Akun / Masuk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
