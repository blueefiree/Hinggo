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
  Paperclip,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { useHingoStore } from "@/lib/store";
import { Product } from "@/lib/data";

function ChatProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get("productId");

  const { user, addToCart, showToast } = useHingoStore();

  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (queryProductId) {
        try {
          const res = await fetch(`/api/products/${queryProductId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.product) {
              setTargetProduct(data.product);
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setTargetProduct(data.products[0]);
          } else {
            setTargetProduct(null);
          }
        }
      } catch (e) {
        setTargetProduct(null);
      }
    }
    loadProduct();
  }, [queryProductId]);

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

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Fetch initial chat data
  useEffect(() => {
    if (!user) return;

    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => {
        if (d?.threads && d.threads.length > 0) {
          const productThread = d.threads.find((t: any) => t.type === "PRODUCT_INQUIRY") || d.threads[0];
          setThreadId(productThread.id);
          setMessages(productThread.messages || []);
        } else {
          setThreadId("product-thread-default");
          setMessages([
            {
              id: "msg-welcome-admin",
              senderRole: "ADMIN",
              senderName: "Admin Hingo",
              content: "Halo! Ada yang bisa kami bantu seputar peripheral preloved ini? Semua unit sudah melewati 12 poin inspeksi fungsi di fasilitas Hingo.",
              timeLabel: "10:00",
            },
          ]);
        }
      })
      .catch(() => {
        setThreadId("product-thread-default");
        setMessages([
          {
            id: "msg-welcome-admin",
            senderRole: "ADMIN",
            senderName: "Admin Hingo",
            content: "Halo! Ada yang bisa kami bantu seputar barang ini? Kami siap bantu cek kondisi dan kelengkapan.",
            timeLabel: "10:00",
          },
        ]);
      });
  }, [user]);

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
          threadId: threadId || "product-thread-default",
          type: "PRODUCT_INQUIRY",
          productId: targetProduct?.id,
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
                id: `admin-${Date.now()}`,
                senderRole: "ADMIN",
                senderName: "Admin Hingo",
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

      // Default auto-reply
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `admin-${Date.now()}`,
            senderRole: "ADMIN",
            senderName: "Admin Hingo",
            content: "Baik kak, pesanmu sudah kami terima. Unit ini kondisinya sangat terawat dan siap dikemas dengan kardus tebal & bubble wrap.",
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

  const quickChips = [
    "Terima kasih, Kak",
    "Boleh foto detailnya?",
    "Apakah masih tersedia?",
    "Apakah fungsi normal?",
  ];

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 py-2 sm:py-6 md:py-8">
      {/* Container Full-Screen Single-Pane on Mobile, 3-Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px] h-[calc(100vh-80px)] md:h-[640px] rounded-3xl border border-[#E5E5E5] bg-white p-2 sm:p-4 shadow-xs overflow-hidden">
        
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-r border-neutral-100 pr-4 gap-3">
          <h2 className="text-sm font-black text-[#1A1A1A]">Percakapan</h2>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-start gap-3 rounded-2xl bg-[#FFFBEB] p-3 border border-[#FDE68A] text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black">
                H
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Admin Hingo</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Aktif</span>
                </div>
                <p className="text-[11px] font-semibold text-amber-900 truncate mt-0.5">
                  {targetProduct?.name || "Tanya Gear & Inspeksi"}
                </p>
              </div>
            </button>
            <Link
              href="/chat/support"
              className="flex items-start gap-3 rounded-2xl p-3 hover:bg-[#F6F6F4] text-left transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700 font-bold text-xs">
                CS
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-800">CS Mira · Bantuan</h4>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">Bantuan transaksi & kendala</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Center Chat Panel: Full-Screen Single-Pane on Mobile (< 768px sesuai Figma) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-between h-full px-1 sm:px-3">
          {/* Sub-Header: Tombol panah ← + Admin Hingo (Tim Hingo · Aktif 5 menit lalu) + centang hijau + ••• */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F6F6F4] hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                aria-label="Kembali"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC629] font-black text-black text-sm">
                H
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-[#1A1A1A]">
                    Admin Hingo
                  </h3>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
                  Tim Hingo · Aktif 5 menit lalu
                </p>
              </div>
            </div>

            <button
              type="button"
              className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-black hover:bg-neutral-100 transition"
              aria-label="Menu Opsi"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Kartu Produk Ringkas Horizontal Tepat di Bawah Header */}
          {targetProduct && (
            <div className="my-2 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={targetProduct.images?.[0] || "/images/placeholder.png"}
                  alt={targetProduct.name}
                  className="h-11 w-11 rounded-xl object-cover border border-[#FDE68A] shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#1A1A1A] truncate">
                    {targetProduct.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                    <span className="font-black text-amber-950">{formatRupiah(targetProduct.price)}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600 font-semibold">{targetProduct.condition}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await addToCart(targetProduct);
                  showToast("Berhasil ditambahkan ke keranjang!");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-extrabold text-[11px] shrink-0 shadow-xs cursor-pointer active:scale-95"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>+ Keranjang</span>
              </button>
            </div>
          )}

          {/* Banner Krem: Jaga Transaksi Tetap di Hingo */}
          <div className="mb-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1.5 flex items-center gap-2 text-[10px] text-amber-900 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-800 shrink-0" />
            <span>
              <strong>Jaga transaksi tetap di Hingo:</strong> Seluruh pembayaran dan garansi 48 jam dilindungi sistem rekening bersama resmi.
            </span>
          </div>

          {/* Messages Scrollable Bubble Area */}
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
                  <span className="text-[10px] font-semibold">Admin Hingo sedang mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Baris Quick-Reply Chips */}
          <div className="flex items-center gap-1.5 py-1 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="rounded-full bg-[#F6F6F4] hover:bg-amber-100 hover:text-amber-900 border border-neutral-200 px-2.5 py-1 text-[11px] font-bold text-neutral-700 whitespace-nowrap transition active:scale-95 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Pesan: Klip 📎 + Input Bulat + Tombol Kuning Kirim */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 pt-1 shrink-0">
            <button
              type="button"
              className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:text-black hover:bg-neutral-100 transition active:scale-90"
              title="Lampirkan foto"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              id="product-chat-message"
              name="product-chat-message"
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

          {/* Tombol Outline Lebar Penuh: Lihat barang · Rp... Mengarah ke Detail Produk */}
          {targetProduct && (
            <div className="pt-1.5 shrink-0">
              <Link
                href={`/product/${targetProduct.slug}`}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 py-2 text-xs font-black text-neutral-800 transition active:scale-[0.98] shadow-2xs"
              >
                <span>Lihat barang · {formatRupiah(targetProduct.price)}</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Product Context Sidebar (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col border-l border-neutral-100 pl-4 gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Barang yang dibahas
          </h4>

          {targetProduct ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs flex flex-col gap-3">
              <img
                src={targetProduct.images?.[0] || "/images/placeholder.png"}
                alt={targetProduct.name}
                className="aspect-square w-full rounded-xl object-cover"
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
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400">
              Pilih produk dari katalog untuk memulai tanya-jawab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Memuat chat produk...</div>}>
      <ChatProductContent />
    </Suspense>
  );
}
