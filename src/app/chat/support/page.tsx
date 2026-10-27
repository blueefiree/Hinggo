"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Search,
  ShieldCheck,
  CheckCheck,
  Package,
  ExternalLink,
  Clock,
  Headphones,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

export default function ChatSupportPage() {
  const { chatThreads, sendMessage, order } = useHingoStore();
  const activeThread =
    chatThreads.find((t) => t.id === "support") || chatThreads[1];

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage("support", inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleQuickChip = (text: string) => {
    sendMessage("support", text);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
          Pusat bantuan Hingo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Dukungan resmi untuk pembayaran, pengiriman, dan kendala barang.
        </p>
      </div>

      {/* 3-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs">
        {/* Left Sidebar (Thread list) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-r border-neutral-100 pr-4 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari tiket atau pesan..."
              className="w-full rounded-xl bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs font-medium text-[#1A1A1A] outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <Link
              href="/chat/support"
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs">
                CS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                    CS Hingo · Resmi
                  </h4>
                  <span className="text-[10px] text-neutral-400">14.08</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate">
                  Tiket CS-0842 · GRL-20261022-0842
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  Danamu tetap ditahan. Pilih Laporkan...
                </p>
              </div>
            </Link>

            <Link
              href="/chat/product"
              className="flex items-start gap-3 rounded-2xl p-3 hover:bg-[#F6F6F4] transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800 truncate">
                    Admin Hingo
                  </h4>
                  <span className="text-[10px] text-neutral-400">10.14</span>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">
                  Keychron K2 V2 · Siap, checkout...
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Support Chat Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between h-[580px] px-2 sm:px-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xs">
                CS
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  CS Hingo · Resmi — Mira
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Tim Bantuan · Online
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold">
              Tiket CS-0842 · Percakapan aktif
            </span>
          </div>

          {/* Escrow Alert Banner */}
          <div className="my-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center gap-2 text-[11px] text-amber-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              <strong>Pembayaran ditangani Hingo:</strong> Transaksi GRL-20261022-0842 ·
              Rp875.500. Jangan konfirmasi penerimaan jika barang bermasalah.
            </span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
            <div className="text-center text-[11px] text-neutral-400 my-1 font-semibold">
              24 Oktober 2026
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

          {/* Action Chips */}
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-none">
            <Link
              href="/orders/GRL-20261022-0842"
              className="rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1 text-[11px] font-bold text-amber-900 whitespace-nowrap flex items-center gap-1"
            >
              <Package className="h-3 w-3" />
              <span>Lihat transaksi</span>
            </Link>
            <button
              type="button"
              onClick={() =>
                handleQuickChip(
                  "Saya ingin melaporkan tombol spacebar yang agak seret, tolong dibantu panduan retur ya."
                )
              }
              className="rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1 text-[11px] font-bold whitespace-nowrap transition"
            >
              Laporkan masalah barang
            </button>
            <button
              type="button"
              onClick={() => handleQuickChip("Semua fungsi sudah saya cek dan normal.")}
              className="rounded-full bg-[#F6F6F4] hover:bg-neutral-200 px-3 py-1 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition"
            >
              Semua normal, terima kasih
            </button>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="relative pt-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis pesan ke CS Mira seputar tiket CS-0842..."
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

        {/* Right Context Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-l border-neutral-100 pl-4 gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Transaksi terkait
          </h4>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-neutral-500">
                GRL-20261022-0842
              </span>
              <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                Barang tiba
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={order.product.images[0]}
                alt="Product"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <h5 className="text-xs font-bold text-[#1A1A1A]">
                  {order.product.name}
                </h5>
                <p className="text-[11px] text-neutral-500">
                  Rp875.500 (Escrow)
                </p>
              </div>
            </div>

            <Link
              href="/orders/GRL-20261022-0842"
              className="w-full text-center py-2 rounded-xl bg-[#F6F6F4] text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition"
            >
              Detail transaksi
            </Link>
          </div>

          <div className="rounded-2xl bg-[#F6F6F4] p-4 text-xs flex flex-col gap-2 border border-neutral-200">
            <div className="flex items-center gap-2 text-neutral-800 font-bold">
              <Headphones className="h-4 w-4 text-emerald-600" />
              <span>Kami siap membantu</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Jam layanan tim kendala: <strong>08.00–22.00 WIB</strong>. Waktu respons
              biasanya 2–5 menit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
