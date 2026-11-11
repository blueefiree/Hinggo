"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  PackagePlus,
  MessageCircle,
  User,
  Search,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useHingoStore();
  const [mobileSearch, setMobileSearch] = useState("");

  // Sembunyikan MobileBottomNav pada halaman fokus penuh/chat/checkout/detail produk/auth
  const isHiddenPage =
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/product/") ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/chat/");

  if (isHiddenPage) {
    return null;
  }

  const handleProtectedClick = (e: React.MouseEvent, targetPath: string) => {
    if (!user) {
      e.preventDefault();
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(targetPath)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(mobileSearch.trim())}`);
    } else {
      router.push("/catalog");
    }
  };

  const showSearchBar = pathname === "/" || pathname === "/catalog";

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      isProtected: false,
      isSpecial: false,
    },
    {
      label: "Belanja",
      href: "/catalog",
      icon: ShoppingBag,
      isActive: pathname === "/catalog",
      isProtected: false,
      isSpecial: false,
    },
    {
      label: "Titip jual",
      href: user ? "/seller/consignments" : "/auth/login?callbackUrl=/seller/consignments",
      icon: PackagePlus,
      isActive: pathname.startsWith("/seller"),
      isProtected: true,
      targetPath: "/seller/consignments",
      isSpecial: true,
    },
    {
      label: "Chat",
      href: user ? "/chat/product" : "/auth/login?callbackUrl=/chat/product",
      icon: MessageCircle,
      isActive: pathname.startsWith("/chat"),
      isProtected: true,
      targetPath: "/chat/product",
      isSpecial: false,
    },
    {
      label: "Akun",
      href: user ? "/account" : "/auth/login?callbackUrl=/account",
      icon: User,
      isActive: pathname === "/account",
      isProtected: true,
      targetPath: "/account",
      isSpecial: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-[#EBEBEB] bg-white/95 backdrop-blur-md md:hidden shadow-lg safe-area-bottom">
      {/* Search Bar (shown on Beranda & Catalog) sesuai Figma node 48:2963 ("Cari peripheral") */}
      {showSearchBar && (
        <div className="px-3.5 pt-2 pb-1">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 rounded-xl bg-[#F6F6F4] px-3 py-2 border border-neutral-200/60 focus-within:border-[#FFC629] focus-within:bg-white transition"
          >
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              id="mobile-bottom-search"
              name="search"
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Cari keyboard, mouse, headset..."
              aria-label="Cari keyboard, mouse, headset"
              className="w-full bg-transparent text-xs text-[#1A1A1A] placeholder:text-neutral-400 outline-none"
            />
          </form>
        </div>
      )}

      {/* Navigasi Utama (5 Tujuan Navigasi sesuai Figma) */}
      <nav className="flex h-[58px] items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.isProtected && item.targetPath) {
                  handleProtectedClick(e, item.targetPath);
                }
              }}
              className="flex flex-1 flex-col items-center justify-center gap-1 transition select-none active:scale-95"
            >
              {/* Icon Container */}
              <div
                className={`flex h-7.5 w-12 items-center justify-center rounded-xl transition ${
                  item.isSpecial
                    ? "bg-[#FFC629] text-[#1A1A1A] shadow-xs"
                    : item.isActive
                    ? "bg-[#FFF3C4] text-[#1A1A1A]"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    item.isActive || item.isSpecial
                      ? "stroke-[2.2] text-[#1A1A1A]"
                      : "stroke-[1.8] text-neutral-600"
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] leading-none ${
                  item.isActive || item.isSpecial
                    ? "font-extrabold text-[#1A1A1A]"
                    : "font-medium text-neutral-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
