"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Product,
  ConsignmentItem,
  OrderItem,
  ChatThread,
  ChatMessage,
  PRODUCTS,
  CONSIGNMENT_ITEMS,
  INITIAL_ORDER,
  INITIAL_CHAT_THREADS,
  INITIAL_USER,
} from "./data";

interface CartItem {
  product: Product;
  quantity: number;
}

interface HingoStoreContextType {
  user: typeof INITIAL_USER;
  setUser: React.Dispatch<React.SetStateAction<typeof INITIAL_USER>>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  consignments: ConsignmentItem[];
  addConsignment: (item: Partial<ConsignmentItem>) => ConsignmentItem;
  order: OrderItem;
  confirmOrderReceived: () => void;
  reportOrderIssue: (issueDescription: string) => void;
  chatThreads: ChatThread[];
  sendMessage: (threadId: string, content: string) => void;
}

const HingoStoreContext = createContext<HingoStoreContextType | null>(null);

export function HingoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(INITIAL_USER);
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: PRODUCTS[0], // Keychron K2 V2
      quantity: 1,
    },
  ]);
  const [consignments, setConsignments] = useState<ConsignmentItem[]>(CONSIGNMENT_ITEMS);
  const [order, setOrder] = useState<OrderItem>(INITIAL_ORDER);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) return prev; // Preloved stock is 1
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addConsignment = (item: Partial<ConsignmentItem>): ConsignmentItem => {
    const newCode = `HG-${new Date().getFullYear().toString().slice(-2)}${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newItem: ConsignmentItem = {
      id: `csg-${Date.now()}`,
      code: newCode,
      category: item.category || "KEYBOARD",
      brandModel: item.brandModel || "Gear Baru",
      variantSpec: item.variantSpec || "Standard",
      usageDuration: item.usageDuration || "6 bulan",
      additionalSpecs: item.additionalSpecs || "",
      currentCondition: item.currentCondition || "Bekas · berfungsi normal",
      defectDetails: item.defectDetails || "Tidak ada cacat fungsi",
      completeness: item.completeness || "Unit dan kelengkapan standar",
      photos: item.photos || [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
      ],
      expectedPrice: item.expectedPrice || 500000,
      originCity: item.originCity || "Bandung",
      handoverMethod: item.handoverMethod || "Kirim via kurir setelah online check",
      stage: "ONLINE_CHECK",
      actionActor: "HINGO",
      badgeLabel: "Menunggu review",
      statusSummary: "Pengecekan online oleh tim Hingo (estimasi 1x24 jam)",
      actionPrompt: "Lihat pengajuan →",
    };

    setConsignments((prev) => [newItem, ...prev]);
    return newItem;
  };

  const confirmOrderReceived = () => {
    setOrder((prev) => ({
      ...prev,
      orderStatus: "COMPLETED",
      escrowStatus: "RELEASED_TO_SELLER",
      timeline: prev.timeline.map((t, idx) => {
        if (idx === 2) return { ...t, status: "completed" };
        if (idx === 3)
          return {
            ...t,
            status: "completed",
            timestamp: "Terkonfirmasi sekarang",
            detail: "Barang telah dikonfirmasi sesuai oleh Naya Putri. Dana telah diteruskan ke pemilik barang.",
          };
        return t;
      }),
    }));
  };

  const reportOrderIssue = (issueDescription: string) => {
    setOrder((prev) => ({
      ...prev,
      orderStatus: "ISSUE_REPORTED",
      escrowStatus: "DISPUTED",
    }));

    // Append to CS chat
    sendMessage(
      "support",
      `[Laporan Kendala Barang] ${issueDescription} — Mohon bantuan tim Hingo untuk penanganan paket ${order.orderCode}.`
    );
  };

  const sendMessage = (threadId: string, content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: "USER",
      senderName: "Naya Putri",
      content,
      timeLabel: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: true,
    };

    setChatThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            lastMessage: content,
            lastTime: newMsg.timeLabel,
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    // Simulated auto-reply after 1 second
    setTimeout(() => {
      const replyRole = threadId === "support" ? "CS" : "ADMIN";
      const replyName = threadId === "support" ? "Mira · CS Hingo" : "Admin Hingo";
      const replyContent =
        threadId === "support"
          ? "Terima kasih Naya, pesanmu sudah kami terima. Tim kendala Hingo sedang memeriksa rincian tiket CS-0842 ini."
          : "Siap Kak Naya, pertanyaanmu dicatat. Semua transaksi preloved diproses aman lewat rekening bersama Hingo ya!";

      const autoMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderRole: replyRole,
        senderName: replyName,
        content: replyContent,
        timeLabel: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: true,
      };

      setChatThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              lastMessage: replyContent,
              lastTime: autoMsg.timeLabel,
              messages: [...thread.messages, autoMsg],
            };
          }
          return thread;
        })
      );
    }, 1200);
  };

  return (
    <HingoStoreContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        consignments,
        addConsignment,
        order,
        confirmOrderReceived,
        reportOrderIssue,
        chatThreads,
        sendMessage,
      }}
    >
      {children}
    </HingoStoreContext.Provider>
  );
}

export function useHingoStore() {
  const context = useContext(HingoStoreContext);
  if (!context) {
    throw new Error("useHingoStore must be used within a HingoProvider");
  }
  return context;
}
