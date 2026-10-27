"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Search,
  ShieldCheck,
  CheckCheck,
  ShoppingBag,
  ExternalLink,
  Info,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function ChatProductPage() {
  const { chatThreads, sendMessage, addToCart } = useHingoStore();
  const activeThread =
    chatThreads.find((t) => t.id === "product") || chatThreads[0];

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage("product", inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleQuickChip = (text: string) => {
    sendMessage("product", text);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
          Tanya admin Hingo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Tanya kondisi, hasil pengecekan, dan pengiriman barang titipan ke tim Hingo.
        </p>
      </div>

      {/* 3-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs">
        {/* Left Sidebar (Pesan) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-r border-neutral-100 pr-4 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Nama atau barang..."
              className="w-full rounded-xl bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs font-medium text-[#1A1A1A] outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <Link
              href="/chat/product"
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                    Admin Hingo
                  </h4>
                  <span className="text-[10px] text-neutral-400">10.14</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate">
                  Keychron K2 V2
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  Siap, checkout di Hingo ya.
                </p>
              </div>
            </Link>

            <Link
              href="/chat/support"
              className="flex items-start gap-3 rounded-2xl p-3 hover:bg-[#F6F6F4] transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700 font-bold text-xs">
                CS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800 truncate">
                    CS Hingo · Resmi
                  </h4>
                  <span className="text-[10px] text-neutral-400">14.08</span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">
                  Kami siap bantu cek barangmu.
                </p>
              </div>
            </Link>

            <div className="flex items-start gap-3 rounded-2xl p-3 hover:bg-[#F6F6F4] transition">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 font-bold text-xs">
                i
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800 truncate">
                    Info Hingo
                  </h4>
                  <span className="text-[10px] text-neutral-400">Kemarin</span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">
                  Tips aman belanja preloved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Chat Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between h-[580px] px-2 sm:px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Admin Hingo
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif 5 menit lalu
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 text-[11px] font-bold text-amber-900 hidden sm:inline">
              Keychron K2 V2 · Rp850.000
            </span>
          </div>

          {/* Official Transaction Banner */}
          <div className="my-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center gap-2 text-[11px] text-amber-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              <strong>Jaga transaksi tetap di Hingo:</strong> Tanya barang titipan ke admin.
              Bayar hanya melalui kanal resmi Hingo untuk proteksi rekening bersama.
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
            <div className="text-center text-[11px] text-neutral-400 my-1 font-semibold">
              22 Oktober 2026
            </div>

            {activeThread.messages.map((msg) => {
              const isUser = msg.senderRole === "USER";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#FFC629] text-[#1A1A1A] rounded-br-none"
                        : "bg-[#F6F6F4] text-[#1A1A1A] rounded-bl-none border border-neutral-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-neutral-400">
                    <span>{msg.timeLabel}</span>
                    {isUser && <CheckCheck className="h-3 w-3 text-neutral-600" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Reply Chips */}
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleQuickChip("Terima kasih, Kak")}
              className="rounded-full bg-[#F6F6F4] hover:bg-neutral-200 px-3 py-1 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition"
            >
              Terima kasih, Kak
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Boleh minta foto detail switch-nya?")}
              className="rounded-full bg-[#F6F6F4] hover:bg-neutral-200 px-3 py-1 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition"
            >
              Boleh foto detailnya?
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Siap, saya lanjut checkout sekarang ya.")}
              className="rounded-full bg-[#F6F6F4] hover:bg-neutral-200 px-3 py-1 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition"
            >
              Lanjut checkout
            </button>
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSend} className="relative pt-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis pertanyaanmu ke admin Hingo..."
              className="w-full rounded-2xl bg-[#F6F6F4] py-3 pl-4 pr-12 text-xs font-medium text-[#1A1A1A] outline-none border border-transparent focus:border-[#FFC629] focus:bg-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Product Context Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-l border-neutral-100 pl-4 gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Barang yang dibahas
          </h4>

          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs flex flex-col gap-3">
            <img
              src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop"
              alt="Keychron K2 V2"
              className="aspect-4/3 w-full rounded-xl object-cover"
            />
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-400">
                Keychron
              </span>
              <h4 className="text-xs font-bold text-[#1A1A1A]">
                Keychron K2 V2
              </h4>
              <p className="text-[11px] text-neutral-500">
                Sangat baik · Gateron Brown
              </p>
              <span className="text-sm font-black text-[#1A1A1A] mt-1 block">
                Rp850.000
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Dicek dan dikelola tim Hingo</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/product/keychron-k2-v2"
                className="w-full text-center py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Lihat barang
              </Link>
              <Link
                href="/cart"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FFC629] text-xs font-bold text-black hover:bg-[#FFC420] transition"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Tambah keranjang</span>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs text-neutral-700 flex flex-col gap-2">
            <span className="font-bold text-[#1A1A1A]">Ada pertanyaan kendala transaksi?</span>
            <Link
              href="/chat/support"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Chat CS Hingo</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
