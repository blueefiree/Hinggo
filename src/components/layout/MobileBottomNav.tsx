"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Package, User } from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, orders } = useHingoStore();

  // If in chat fullscreen on mobile, do not show bottom nav so input is never blocked
  if (pathname.startsWith("/chat/")) {
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
      icon: Compass,
      isActive: pathname === "/catalog" || pathname.startsWith("/product"),
      isProtected: false,
    },
    {
      label: "Transaksi",
      href: user ? "/orders" : "/auth/login?callbackUrl=/orders",
      icon: Package,
      isActive: pathname.startsWith("/orders") || pathname === "/checkout" || pathname === "/cart",
      badge: user && checkingCount > 0 ? String(checkingCount) : undefined,
      isProtected: true,
      targetPath: "/orders",
    },
    {
      label: user ? "Profil" : "Masuk",
      href: user ? "/account" : "/auth/login?callbackUrl=/account",
      icon: User,
      isActive: pathname === "/account" || pathname.startsWith("/seller") || pathname.startsWith("/auth"),
      indicator: user && user.kycStatus === "PENDING_REVIEW",
      isProtected: true,
      targetPath: "/account",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#E5E5E5] bg-white/95 px-2 py-1 backdrop-blur-md md:hidden">
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
            className={`relative flex flex-1 flex-col items-center justify-center py-1 transition ${
              item.isActive
                ? "text-[#1A1A1A] font-bold"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 ${
                  item.isActive ? "text-[#1A1A1A] stroke-[2.5]" : "stroke-[1.8]"
                }`}
              />
              {item.badge && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFC629] text-[9px] font-bold text-black ring-1 ring-white">
                  {item.badge}
                </span>
              )}
              {item.indicator && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              )}
            </div>
            <span className="mt-1 text-[11px] leading-tight">
              {item.label}
            </span>
            {item.isActive && (
              <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-[#FFC629]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
