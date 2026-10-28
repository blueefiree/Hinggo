"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";

function ChatSupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");

  const { user, order, showToast } = useHingoStore();

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
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/chat?type=CS_SUPPORT${orderIdParam ? `&orderId=${orderIdParam}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.thread) {
          setThreadId(d.thread.id);
          setMessages(d.messages || []);
        } else {
          setThreadId(null);
          setMessages([]);
        }
      })
      .catch(() => {
        setMessages([]);
      });
  }, [user, orderIdParam]);

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
          type: "CS_SUPPORT",
          orderId: orderIdParam,
          content: text,
        }),
      });

      const data = await res.json();

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
    "Halo Kak, bagaimana status pengiriman pesanan saya?",
    "Bagaimana sistem rekening bersama (escrow) di Hingo?",
    "Bagaimana cara mengajukan komplain jika ada minus?",
    "Berapa lama estimasi pencairan dana titip jual saya?",
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 md:py-8">
      {/* Header (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">
          Pusat Bantuan & Komplain Hingo
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Dukungan resmi untuk pembayaran, pelacakan ekspedisi, klaim proteksi escrow, dan panduan konsinyasi.
        </p>
      </div>

      {/* 3-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs">
        {/* Left Sidebar */}
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
              placeholder="Cari tiket bantuan..."
              className="w-full rounded-xl bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs font-medium text-[#1A1A1A] outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] transition text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs">
                CS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                    CS Mira · Resmi
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate">
                  Pusat Bantuan & Rekening Bersama
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {messages.length > 0
                    ? messages[messages.length - 1].content
                    : "Mulai percakapan dengan CS..."}
                </p>
              </div>
            </button>

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
                </div>
                <p className="text-[11px] text-neutral-500 truncate mt-1">
                  Tanya spesifikasi gear & inspeksi
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
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="flex lg:hidden h-8 w-8 items-center justify-center rounded-xl bg-[#F6F6F4] text-neutral-700 hover:bg-neutral-200"
                aria-label="Kembali ke daftar percakapan"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs">
                CS
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Mira · CS Hingo Resmi
                </h3>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online siap membantu
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hidden sm:inline">
              🛡️ Proteksi Escrow Aktif
            </span>
          </div>

          {/* Official Escrow Assurance Strip */}
          <div className="my-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center gap-2 text-[11px] text-amber-900 shrink-0">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              <strong>Layanan Resmi Hingo:</strong> CS kami siap mengawal setiap pesanan dari gudang hingga tuntas masa uji 48 jam.
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
            {messages.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center justify-center p-6 text-neutral-400 gap-2">
                <div className="h-12 w-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-amber-600 border border-[#FDE68A]">
                  <Headphones className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-bold text-[#1A1A1A]">
                  Pusat Bantuan Pelanggan Hingo
                </h4>
                <p className="text-[11px] text-neutral-500 max-w-xs">
                  Sampaikan kendala transaksi atau pertanyaan seputar rekening bersama Hingo melalui chat ini.
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

            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in">
                <div className="rounded-2xl rounded-bl-none bg-[#F6F6F4] border border-neutral-200 px-4 py-2.5 text-xs text-neutral-600 flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-100" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce delay-200" />
                  </div>
                  <span className="font-semibold text-[11px] text-neutral-500">
                    CS Mira sedang mengetik...
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
              placeholder="Ketik pesan kendala atau pertanyaanmu ke CS Mira..."
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

        {/* Right Help Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-l border-neutral-100 pl-4 gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Panduan & Kebijakan
          </h4>

          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>Garansi Rekening Bersama</span>
            </div>
            <p className="text-neutral-600 leading-relaxed text-[11px]">
              Setiap transaksi pembeli dilindungi escrow resmi Hingo. Dana tidak akan pernah dicairkan ke penjual sebelum pembeli menyatakan barang sesuai.
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5 text-xs text-neutral-700 flex flex-col gap-2">
            <span className="font-bold text-[#1A1A1A]">Pengecekan Barang:</span>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Masa uji coba aktif selama 48 jam sejak kurir mengonfirmasi paket tiba. Buat video unboxing tanpa jeda saat membuka paket.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatSupportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Memuat pusat bantuan...</div>}>
      <ChatSupportContent />
    </Suspense>
  );
}
