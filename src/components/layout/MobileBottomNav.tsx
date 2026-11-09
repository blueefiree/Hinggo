"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Package, User } from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, orders } = useHingoStore();

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

  const checkingCount = orders.filter((o) => o.orderStatus === "DELIVERED_CHECKING").length;

  const handleProtectedClick = (e: React.MouseEvent, targetPath: string) => {
    if (!user) {
      e.preventDefault();
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(targetPath)}`);
    }
  };

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
      isProtected: false,
    },
    {
      label: "Jelajah",
      href: "/catalog",
      icon: Search,
      isActive: pathname === "/catalog",
      isProtected: false,
    },
    {
      label: "Transaksi",
      href: user ? "/orders" : "/auth/login?callbackUrl=/orders",
      icon: Package,
      isActive: pathname.startsWith("/orders"),
      badge: user && checkingCount > 0 ? String(checkingCount) : undefined,
      isProtected: true,
      targetPath: "/orders",
    },
    {
      label: "Akun",
      href: user ? "/account" : "/auth/login?callbackUrl=/account",
      icon: User,
      isActive: pathname === "/account" || pathname.startsWith("/seller"),
      indicator: user && user.kycStatus === "PENDING_REVIEW",
      isProtected: true,
      targetPath: "/account",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#E5E5E5] bg-white/95 px-1 py-1 backdrop-blur-md md:hidden shadow-lg safe-area-bottom">
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
            className={`relative flex flex-1 flex-col items-center justify-center py-1 transition select-none active:scale-95 ${
              item.isActive
                ? "text-[#D97706] font-extrabold"
                : "text-neutral-500 hover:text-neutral-800 font-medium"
            }`}
          >
            <div className="relative">
              <Icon
                className={`h-4.5 w-4.5 ${
                  item.isActive ? "text-[#D97706] stroke-[2.5]" : "stroke-[1.8]"
                }`}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FFC629] text-[8px] font-bold text-black ring-1 ring-white">
                  {item.badge}
                </span>
              )}
              {item.indicator && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full bg-amber-500" />
              )}
            </div>
            <span
              className={`text-[10px] leading-tight mt-0.5 ${
                item.isActive ? "font-bold text-[#D97706]" : "text-neutral-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
