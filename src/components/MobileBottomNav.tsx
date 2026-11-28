"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, PackagePlus, ShoppingCart, User } from "lucide-react";
import { User as UserType } from "@/types";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});

    const updateCart = () => {
      const saved = localStorage.getItem("hinggo_cart");
      if (saved) {
        try {
          setCartCount(JSON.parse(saved).length);
        } catch (e) {}
      } else {
        setCartCount(0);
      }
    };
    updateCart();
    window.addEventListener("storage", updateCart);
    return () => window.removeEventListener("storage", updateCart);
  }, []);

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Katalog", href: "/katalog", icon: ShoppingBag },
    { label: "Titip Jual", href: "/titip-jual", icon: PackagePlus },
    { label: "Keranjang", href: "/keranjang", icon: ShoppingCart, badge: cartCount },
    {
      label: user ? (user.role === "ADMIN" ? "Admin" : "Dasbor") : "Masuk",
      href: user ? (user.role === "ADMIN" ? "/admin" : "/consignor/dasbor") : "/masuk",
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] px-2 py-1 shadow-lg pb-safe">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive ? "text-yellow-600 font-bold" : "text-[#8a8a8a] hover:text-ink font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`size-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-yellow-500 text-ink text-[10px] font-extrabold size-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
