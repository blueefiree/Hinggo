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
  Paperclip,
  CheckCircle2,
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
          setThreadId("support-thread-default");
          setMessages([
            {
              id: "msg-welcome-cs",
              senderRole: "CS",
              senderName: "Mira · CS Hingo",
              content: "Halo! Saya Mira dari Tim Bantuan Resmi Hingo. Ada kendala pengiriman, pesanan, atau rekening bersama yang bisa saya bantu kawal?",
              timeLabel: "10:00",
            },
          ]);
        }
      })
      .catch(() => {
        setThreadId("support-thread-default");
        setMessages([
          {
            id: "msg-welcome-cs",
            senderRole: "CS",
            senderName: "Mira · CS Hingo",
            content: "Halo! Saya Mira dari Tim Bantuan Resmi Hingo. Ada kendala yang bisa kami bantu selesaikan?",
            timeLabel: "10:00",
          },
        ]);
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
          threadId: threadId || "support-thread-default",
          type: "CS_SUPPORT",
          orderId: orderIdParam,
          content: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.replyMessage) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `cs-${Date.now()}`,
                senderRole: "CS",
                senderName: "Mira · CS Hingo",
                content: data.replyMessage,
                timeLabel: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setIsTyping(false);
          }, 800);
          return;
        }
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `cs-${Date.now()}`,
            senderRole: "CS",
            senderName: "Mira · CS Hingo",
            content: "Pesanmu sudah kami catat dalam tiket penanganan resmi. Kami akan segera berkoordinasi dengan kurir dan tim inspeksi gudang.",
            timeLabel: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setIsTyping(false);
      }, 900);
    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-2 sm:py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] h-[calc(100vh-80px)] md:h-[640px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs overflow-hidden">
        
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-r border-neutral-100 pr-4 gap-3">
          <h2 className="text-sm font-black text-[#1A1A1A]">Pusat Bantuan</h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-xs">
                CS
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">CS Mira · Resmi</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate mt-0.5">
                  Bantuan Transaksi & Escrow
                </p>
              </div>
            </button>
            <Link
              href="/chat/product"
              className="flex items-start gap-3 rounded-2xl p-3 hover:bg-[#F6F6F4] text-left transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-800">Admin Hingo</h4>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">Tanya gear & inspeksi</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Chat Panel: Full-Screen Single-Pane on Mobile (< 768px sesuai Figma) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-between h-full px-1 sm:px-3">
          {/* Banner Header Krem: CS Hingo · Resmi (Mira · Tim bantuan · Online) dengan Ikon Headset */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] shrink-0 mb-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#FDE68A] text-neutral-700 hover:bg-amber-100 transition cursor-pointer"
                aria-label="Kembali"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-black">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-[#1A1A1A]">
                    CS Hingo · Resmi
                  </h3>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-900 font-medium">
                  Mira · Tim bantuan · Online
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold">
              Resmi
            </span>
          </div>

          {/* Baris Status: Tiket CS-0842 di Kiri dan Pill Kuning Percakapan Aktif di Kanan */}
          <div className="flex items-center justify-between py-1 px-1 shrink-0 text-xs">
            <span className="text-[11px] font-mono font-bold text-neutral-500">
              Tiket CS-0842
            </span>
            <span className="rounded-full bg-[#FFC629] px-2.5 py-0.5 text-[10px] font-black text-black shadow-2xs">
              Percakapan aktif
            </span>
          </div>

          {/* Kartu Krem: Pembayaran Ditangani Hingo (Info Transaksi Terkait) */}
          <div className="my-1.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="h-4 w-4 text-amber-800 shrink-0" />
              <div className="min-w-0">
                <strong className="block text-[11px] font-bold text-amber-950 truncate">
                  Pembayaran ditangani Hingo
                </strong>
                <span className="text-[10px] text-amber-800 block truncate">
                  Dana aman di escrow. Jangan konfirmasi terima jika barang bermasalah.
                </span>
              </div>
            </div>
            <Link
              href="/orders"
              className="text-[10px] font-extrabold text-amber-900 hover:underline shrink-0"
            >
              Pesanan →
            </Link>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2.5 pr-1">
            {messages.map((msg) => {
              const isUser = msg.senderRole === "USER";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-[#FFFBEB] text-[#1A1A1A] border border-[#FDE68A] rounded-br-none"
                        : "bg-[#F6F6F4] text-[#1A1A1A] rounded-bl-none border border-neutral-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-neutral-400">
                    <span>{msg.timeLabel}</span>
                    {isUser && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex flex-col items-start animate-in fade-in">
                <div className="rounded-2xl rounded-bl-none bg-[#F6F6F4] border border-neutral-200 px-3.5 py-2 text-xs text-neutral-500 flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                  </div>
                  <span className="text-[10px] font-semibold">CS Mira sedang mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 2 Tombol Pill Aksi di Bawah Chat: Lihat Transaksi (Outline) + Laporkan Masalah (Kuning Lembut) */}
          <div className="grid grid-cols-2 gap-2 pt-1.5 shrink-0">
            <Link
              href="/orders"
              className="flex items-center justify-center gap-1 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 py-2 text-[11px] font-bold text-neutral-800 transition shadow-2xs"
            >
              <span>Lihat transaksi</span>
              <ExternalLink className="h-3 w-3 text-neutral-400" />
            </Link>

            <Link
              href="/orders"
              className="flex items-center justify-center gap-1 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] py-2 text-[11px] font-bold text-amber-900 transition shadow-2xs"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
              <span>Laporkan masalah</span>
            </Link>
          </div>

          {/* Teks Peringatan Keamanan OTP */}
          <div className="py-1 text-center shrink-0">
            <span className="text-[10px] text-neutral-400">
              🔒 Hingo tidak pernah meminta password atau kode OTP WhatsApp/Email Anda.
            </span>
          </div>

          {/* Input Pesan: Klip 📎 + Input Bulat + Tombol Kuning Kirim */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 pt-0.5 shrink-0">
            <button
              type="button"
              className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:text-black hover:bg-neutral-100 transition active:scale-90"
              title="Lampirkan foto"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              id="support-chat-message"
              name="support-chat-message"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tulis pesan…"
              className="flex-1 rounded-full bg-[#F6F6F4] py-2 px-3.5 text-xs font-medium text-[#1A1A1A] outline-none border border-transparent focus:border-[#FFC629] focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`flex h-9.5 px-3.5 items-center justify-center rounded-full font-bold text-xs transition active:scale-95 cursor-pointer ${
                inputMessage.trim() && !isTyping
                  ? "bg-[#FFC629] hover:bg-[#FFC420] text-black shadow-xs font-black"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Kirim
            </button>
          </form>
        </div>

        {/* Right Help Sidebar (Desktop Only) */}
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
