"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHingoStore } from "@/lib/store";
import { ShieldCheck, User, ArrowLeftRight, Settings, Sparkles } from "lucide-react";

export default function RoleSwitcherWidget() {
  const { role, setRole, toggleRole, user } = useHingoStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded quick modal if clicked */}
      {isOpen && (
        <div className="mb-2 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl text-xs text-[#1A1A1A] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
            <span className="font-extrabold uppercase tracking-wider text-neutral-500 text-[10px]">
              Demo Role Switcher
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                role === "ADMIN"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {role === "ADMIN" ? "Admin Mode" : "User Mode"}
            </span>
          </div>

          <p className="text-neutral-600 mb-3 leading-relaxed text-[11px]">
            Gunakan tombol ini untuk mendemokan alur 2 arah Hingo: Verifikasi KYC, persetujuan hasil inspeksi, rincian biaya, update resi, dan live chat.
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setRole("USER");
                setIsOpen(false);
                if (isAdminPage) router.push("/seller/consignments");
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                role === "USER"
                  ? "bg-[#FFFBEB] border-[#FFC629] font-bold text-black"
                  : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <div className="text-left">
                  <div className="font-bold text-xs">{user?.name || "Mode Pengguna"}</div>
                  <div className="text-[10px] text-neutral-500">Pembeli & Penjual Gear</div>
                </div>
              </div>
              {role === "USER" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("ADMIN");
                setIsOpen(false);
                router.push("/admin");
              }}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                role === "ADMIN"
                  ? "bg-[#1A1A1A] border-black font-bold text-white"
                  : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#FFC629]" />
                <div className="text-left">
                  <div className="font-bold text-xs">Admin & Tim Inspeksi</div>
                  <div className={`text-[10px] ${role === "ADMIN" ? "text-neutral-400" : "text-neutral-500"}`}>
                    Dashboard Verifikasi & Escrow
                  </div>
                </div>
              </div>
              {role === "ADMIN" && <span className="h-2 w-2 rounded-full bg-[#FFC629]" />}
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="font-bold text-amber-700 hover:underline flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Buka Panel Admin
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-black font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
          role === "ADMIN"
            ? "bg-[#1A1A1A] text-white border-amber-400/50 shadow-amber-500/10"
            : "bg-white text-neutral-800 border-neutral-200 shadow-neutral-900/10 hover:border-[#FFC629]"
        }`}
        title="Klik untuk beralih mode Pengguna / Admin Hingo"
      >
        <span
          className={`flex h-2.5 w-2.5 rounded-full ${
            role === "ADMIN" ? "bg-[#FFC629] animate-pulse" : "bg-emerald-500"
          }`}
        />
        <span className="text-xs font-black tracking-tight">
          {role === "ADMIN" ? "Mode: Admin Hingo" : `Mode: ${user?.name || "Pengguna"}`}
        </span>
        <ArrowLeftRight className="h-3.5 w-3.5 text-neutral-400" />
      </button>
    </div>
  );
}
