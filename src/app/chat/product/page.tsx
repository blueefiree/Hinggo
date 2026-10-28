"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Search,
  ShieldCheck,
  CheckCheck,
  ShoppingBag,
  ExternalLink,
  Info,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";
import { PRODUCTS, Product } from "@/lib/data";

function ChatProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get("productId");

  const { user, addToCart, showToast } = useHingoStore();

  // Selected product logic
  const targetProduct: Product =
    PRODUCTS.find((p) => p.id === queryProductId || p.slug === queryProductId) ||
    PRODUCTS[0];

  const [activeProductId, setActiveProductId] = useState<string>(targetProduct.id);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      senderRole: "USER" | "ADMIN" | "CS";
      senderName: string;
      content: string;
      timeLabel: string;
    }>
  >([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userThreads, setUserThreads] = useState<any[]>([]);
  const [searchThreadQuery, setSearchThreadQuery] = useState("");
  // On mobile: "list" (show threads) or "chat" (show full-screen active room)
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Fetch initial chat data for this product/user
  useEffect(() => {
    if (!user) return;

    fetch(`/api/chat?type=PRODUCT_ADMIN&productId=${activeProductId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.threads) {
          setUserThreads(d.threads);
        }
        if (d?.thread) {
          setThreadId(d.thread.id);
          setMessages(d.messages || []);
        } else {
          // Starts from 0!
          setThreadId(null);
          setMessages([]);
        }
      })
      .catch((e) => {
        setMessages([]);
      });
  }, [user, activeProductId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    const currentTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 1. Optimistic user bubble
    const userMsg = {
      id: `user-${Date.now()}`,
      senderRole: "USER" as const,
      senderName: user?.name || "Saya",
      content: text,
      timeLabel: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          productId: activeProductId,
          type: "PRODUCT_ADMIN",
          content: text,
        }),
      });

      const data = await res.json();

      // Show typing indicator for 1.5 seconds as instructed
      setTimeout(() => {
        setIsTyping(false);
        if (data?.autoReply) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.autoReply.id,
              senderRole: data.autoReply.senderRole,
              senderName: data.autoReply.senderName,
              content: data.autoReply.content,
              timeLabel: data.autoReply.timeLabel,
            },
          ]);
        }
        if (data?.threadId) {
          setThreadId(data.threadId);
        }
      }, 1500);
    } catch (e) {
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const quickChips = [
    "Halo Kak, apakah barang ini masih tersedia?",
    "Apakah semua tombol dan fungsinya normal?",
    "Kelengkapan box dan kabelnya masih lengkap?",
    "Bisa dikirim hari ini kalau saya checkout sekarang?",
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 md:py-8">
      {/* Header (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
          Tanya Admin Hingo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Tanya kondisi, hasil kurasi fisik 12 poin, dan pengiriman barang titipan langsung ke tim inspeksi Hingo.
        </p>
      </div>

      {/* 3-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs">
        {/* Left Sidebar (Desktop list or Mobile thread list when mobileView === "list") */}
        <div
          className={`${
            mobileView === "list" ? "flex flex-col w-full" : "hidden"
          } lg:flex lg:col-span-3 flex-col border-r border-neutral-100 pr-0 lg:pr-4 gap-3`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 lg:hidden">
            <h2 className="text-base font-black text-[#1A1A1A]">Daftar Percakapan</h2>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchThreadQuery}
              onChange={(e) => setSearchThreadQuery(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full rounded-xl bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs font-medium text-[#1A1A1A] outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            {/* Active Product Admin Thread */}
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] transition text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                    Admin Hingo
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate">
                  {targetProduct.name}
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {messages.length > 0
                    ? messages[messages.length - 1].content
                    : "Mulai percakapan dengan admin..."}
                </p>
              </div>
            </button>

            {/* Support Center Link */}
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
                    CS Mira · Pusat Bantuan
                  </h4>
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">
                  Bantuan transaksi, resi, & kendala
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Chat Panel */}
        <div
          className={`${
            mobileView === "chat" ? "flex flex-col w-full" : "hidden"
          } lg:flex lg:col-span-6 flex-col justify-between min-h-[580px] h-[calc(100vh-140px)] md:h-[580px] px-1 sm:px-4`}
        >
          {/* Top Bar with Mobile Back Button */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Mobile Back to List Button */}
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="flex lg:hidden h-8 w-8 items-center justify-center rounded-xl bg-[#F6F6F4] text-neutral-700 hover:bg-neutral-200"
                aria-label="Kembali ke daftar percakapan"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Admin Hingo · Tim Inspeksi
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif membalas cepat
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 text-[11px] font-bold text-amber-900 hidden sm:inline">
              {targetProduct.name} · {formatRupiah(targetProduct.price)}
            </span>
          </div>

          {/* Compact Product Banner for Mobile & Context Pin */}
          <div className="my-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={targetProduct.images[0]}
                alt={targetProduct.name}
                className="h-10 w-10 rounded-xl object-cover border border-[#FDE68A] shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                  {targetProduct.name}
                </h4>
                <p className="text-[11px] font-black text-amber-900">
                  {formatRupiah(targetProduct.price)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await addToCart(targetProduct);
                showToast("Berhasil ditambahkan ke keranjang!");
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shrink-0 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="h-3 w-3" />
              <span className="hidden sm:inline">Tambah Keranjang</span>
              <span className="sm:hidden">+ Keranjang</span>
            </button>
          </div>

          {/* Messages Scrollable Area */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
            {messages.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center justify-center p-6 text-neutral-400 gap-2">
                <div className="h-12 w-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">
                  Mulai Percakapan dengan Admin Hingo
                </h4>
                <p className="text-[11px] text-neutral-500 max-w-xs">
                  Tanyakan ketersediaan, fungsi tombol, kelengkapan kabel/dus, atau jadwal pengiriman barang titipan ini.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
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
                          ? "bg-[#FFC629] text-[#1A1A1A] rounded-br-none font-semibold"
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
              })
            )}

            {/* Typing Animation Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in">
                <div className="rounded-2xl rounded-bl-none bg-[#F6F6F4] border border-neutral-200 px-4 py-2.5 text-xs text-neutral-600 flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                  </div>
                  <span className="font-semibold text-[11px] text-neutral-500">
                    Admin Hingo sedang mengetik...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Reply Chips */}
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-none shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="rounded-full bg-[#F6F6F4] hover:bg-amber-100 hover:text-amber-900 border border-neutral-200 px-3 py-1.5 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleFormSubmit} className="relative pt-1 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis pertanyaanmu ke admin Hingo..."
              className="w-full rounded-2xl bg-[#F6F6F4] py-3 pl-4 pr-12 text-xs font-medium text-[#1A1A1A] outline-none border border-transparent focus:border-[#FFC629] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`absolute right-2 top-2.5 flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
                inputMessage.trim() && !isTyping
                  ? "bg-[#FFC629] hover:bg-[#FFC420] text-black"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right Product Context Sidebar (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-l border-neutral-100 pl-4 gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Barang yang dibahas
          </h4>

          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs flex flex-col gap-3">
            <img
              src={targetProduct.images[0]}
              alt={targetProduct.name}
              className="aspect-4/3 w-full rounded-xl object-cover"
            />
            <div>
              <span className="text-[10px] font-bold uppercase text-neutral-400">
                {targetProduct.brand}
              </span>
              <h4 className="text-xs font-bold text-[#1A1A1A]">
                {targetProduct.name}
              </h4>
              <p className="text-[11px] text-neutral-500">
                {targetProduct.condition} · {targetProduct.switchOrVariant}
              </p>
              <span className="text-sm font-black text-[#1A1A1A] mt-1 block">
                {formatRupiah(targetProduct.price)}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Dicek 12 poin inspeksi Hingo</span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href={`/product/${targetProduct.slug}`}
                className="w-full text-center py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 hover:bg-neutral-50 transition"
              >
                Lihat barang
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await addToCart(targetProduct);
                  showToast("Berhasil ditambahkan ke keranjang!");
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FFC629] text-xs font-bold text-black hover:bg-[#FFC420] transition cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Tambah keranjang</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs text-neutral-700 flex flex-col gap-2">
            <span className="font-bold text-[#1A1A1A]">Punya kendala transaksi?</span>
            <Link
              href="/chat/support"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              <span>Hubungi CS Mira Hingo</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Memuat ruang chat admin...</div>}>
      <ChatProductContent />
    </Suspense>
  );
}
