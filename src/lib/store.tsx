"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Product,
  ConsignmentItem,
  OrderItem,
  ChatThread,
  ChatMessage,
  UserAddress,
  UserBankAccount,
  PayoutRecord,
  DisputeReport,
} from "./data";

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selected?: boolean;
}

export interface UserType {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string;
  role: string;
  phoneVerified: boolean;
  emailVerified?: boolean;
  bio?: string | null;
  kycStatus: string;
  avatarUrl?: string | null;
  kycDocument?: any;
  addresses?: UserAddress[];
  bankAccounts?: UserBankAccount[];
}

interface HingoStoreContextType {
  role: "USER" | "ADMIN";
  setRole: (role: "USER" | "ADMIN") => void;
  toggleRole: () => void;
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  isLoadingUser: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  addresses: UserAddress[];
  activeAddress: UserAddress | null;
  setActiveAddress: (id: string) => void;
  addAddress: (address: Omit<UserAddress, "id">) => void;
  updateAddress: (id: string, address: Partial<UserAddress>) => void;
  bankAccounts: UserBankAccount[];
  activeBankAccount: UserBankAccount | null;
  addBankAccount: (bank: Omit<UserBankAccount, "id">) => void;
  updateBankAccount: (id: string, bank: Partial<UserBankAccount>) => void;
  wishlist: Product[];
  wishlistIds: string[];
  addToWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<{ success: boolean; alreadyInCart?: boolean }>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleCartItemSelection: (idOrProductId: string, selected: boolean) => Promise<void>;
  toggleSelectAllCart: (selected: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  consignments: ConsignmentItem[];
  refreshConsignments: () => Promise<void>;
  addConsignment: (item: Partial<ConsignmentItem>) => ConsignmentItem;
  submitConsignmentShipment: (code: string, courier: string, trackingNumber: string) => void;
  approveConsignmentPrice: (
    code: string,
    breakdown?: { proposedPrice: number; consignmentFee: number; netPayout: number }
  ) => void;
  submitConsignmentRevision: (code: string, updatedPhotos: string[], revisionNotes: string) => void;
  requestConsignmentReturn: (code: string, returnOption: string) => void;
  orders: OrderItem[];
  order: OrderItem | null;
  refreshOrders: () => Promise<void>;
  simulatePaymentSuccess: (orderId: string) => void;
  confirmOrderReceived: (orderId?: string) => void;
  reportOrderIssue: (
    orderId: string,
    disputeData: Omit<DisputeReport, "createdAt" | "status"> | string
  ) => void;
  payouts: PayoutRecord[];
  refreshPayouts: () => Promise<void>;
  chatThreads: ChatThread[];
  refreshChat: () => Promise<void>;
  sendMessage: (threadId: string, content: string, senderRole?: "USER" | "ADMIN" | "CS") => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Admin Methods
  adminApproveKyc: (status: "VERIFIED" | "NEEDS_REVISION") => void;
  adminSubmitInspection: (
    code: string,
    inspectionData: {
      specs: string;
      functionTest: string;
      conditionAndDefect: string;
      completenessReceived: string;
    },
    proposedPrice: number,
    consignmentFee: number,
    netPayout: number
  ) => void;
  adminReleaseEscrow: (orderId: string) => void;
  adminUpdateTracking: (orderId: string, trackingNumber: string) => void;
}

const HingoStoreContext = createContext<HingoStoreContextType | null>(null);

const GUEST_CART_KEY = "hingo_guest_cart";
const GUEST_WISHLIST_KEY = "hingo_guest_wishlist";

export interface MinimalGuestCartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  selected?: boolean;
}

export interface MinimalGuestWishlistItem {
  productId: string;
  addedAt: string;
}

function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return fallback;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage key "${key}":`, e);
  }
}

function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Error removing localStorage key "${key}":`, e);
  }
}

async function hydrateGuestCart(minimalItems: MinimalGuestCartItem[]): Promise<CartItem[]> {
  if (!minimalItems || minimalItems.length === 0) return [];
  try {
    const res = await fetch("/api/products?all=true", { cache: "no-store" });
    const data = await res.json();
    const allProducts: Product[] = data?.products || [];
    const hydrated: CartItem[] = [];
    for (const item of minimalItems) {
      const p = allProducts.find((prod) => prod.id === item.productId);
      if (p && p.status === "AVAILABLE") {
        hydrated.push({
          id: `guest-${p.id}`,
          product: p,
          quantity: 1, // Preloved stok 1
          selected: item.selected ?? true,
        });
      }
    }
    return hydrated;
  } catch (e) {
    console.warn("Error hydrating guest cart:", e);
    return [];
  }
}

async function hydrateGuestWishlist(minimalItems: MinimalGuestWishlistItem[]): Promise<Product[]> {
  if (!minimalItems || minimalItems.length === 0) return [];
  try {
    const res = await fetch("/api/products?all=true", { cache: "no-store" });
    const data = await res.json();
    const allProducts: Product[] = data?.products || [];
    const hydrated: Product[] = [];
    for (const item of minimalItems) {
      const p = allProducts.find((prod) => prod.id === item.productId);
      if (p) {
        hydrated.push(p);
      }
    }
    return hydrated;
  } catch (e) {
    console.warn("Error hydrating guest wishlist:", e);
    return [];
  }
}

export function HingoProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [activeAddressId, setActiveAddressId] = useState<string>("");
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [consignments, setConsignments] = useState<ConsignmentItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Refresh methods
  const refreshWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist", { cache: "no-store" });
      const data = await res.json();
      if (data?.wishlists) {
        setWishlist(data.wishlists.map((w: any) => w.product || w));
        setWishlistIds(data.wishlistIds || data.wishlists.map((w: any) => w.productId || w.product?.id));
      } else {
        setWishlist([]);
        setWishlistIds([]);
      }
    } catch (e) {
      setWishlist([]);
      setWishlistIds([]);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      if (data?.items) {
        setCart(
          data.items.map((item: any) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity || 1,
            selected: item.selected !== false,
          }))
        );
      } else {
        setCart([]);
      }
    } catch (e) {
      setCart([]);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data?.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    }
  }, []);

  const refreshConsignments = useCallback(async () => {
    try {
      const res = await fetch("/api/consignments", { cache: "no-store" });
      const data = await res.json();
      if (data?.consignments) {
        setConsignments(data.consignments);
      } else {
        setConsignments([]);
      }
    } catch (e) {
      setConsignments([]);
    }
  }, []);

  const refreshPayouts = useCallback(async () => {
    try {
      const res = await fetch("/api/payouts", { cache: "no-store" });
      const data = await res.json();
      if (data?.payouts) {
        setPayouts(data.payouts);
      } else {
        setPayouts([]);
      }
    } catch (e) {
      setPayouts([]);
    }
  }, []);

  const refreshChat = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      const data = await res.json();
      if (data?.threads) {
        setChatThreads(data.threads);
      } else {
        setChatThreads([]);
      }
    } catch (e) {
      setChatThreads([]);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();

      if (data?.user) {
        setUser(data.user);
        setRole(data.user.role === "ADMIN" ? "ADMIN" : "USER");
        setAddresses(data.user.addresses || []);
        if (data.user.addresses && data.user.addresses.length > 0) {
          const primary = data.user.addresses.find((a: any) => a.isPrimary) || data.user.addresses[0];
          setActiveAddressId(primary.id);
        }
        setBankAccounts(data.user.bankAccounts || []);

        // GABUNGKAN (Merge) cart & wishlist tamu dari localStorage ke akun jika ada
        const guestCart = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
        const guestWishlist = getLocalStorage<MinimalGuestWishlistItem[]>(GUEST_WISHLIST_KEY, []);

        if (guestCart.length > 0) {
          try {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mergeItems: guestCart.map((c) => ({
                  productId: c.productId,
                  quantity: 1,
                })),
              }),
            });
            removeLocalStorage(GUEST_CART_KEY);
          } catch (e) {
            console.warn("Failed merging guest cart:", e);
          }
        }

        if (guestWishlist.length > 0) {
          try {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                mergeProductIds: guestWishlist.map((w) => w.productId),
              }),
            });
            removeLocalStorage(GUEST_WISHLIST_KEY);
          } catch (e) {
            console.warn("Failed merging guest wishlist:", e);
          }
        }

        // Load logged-in user data
        await Promise.all([
          refreshWishlist(),
          refreshCart(),
          refreshOrders(),
          refreshConsignments(),
          refreshPayouts(),
          refreshChat(),
        ]);
      } else {
        // Strict Guest: load guest cart & wishlist from localStorage with Supabase product hydration
        setUser(null);
        setRole("USER");
        setAddresses([]);
        setBankAccounts([]);
        setOrders([]);
        setConsignments([]);
        setPayouts([]);
        setChatThreads([]);

        const guestCartRaw = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
        const guestWishlistRaw = getLocalStorage<MinimalGuestWishlistItem[]>(GUEST_WISHLIST_KEY, []);
        const [hydratedCart, hydratedWishlist] = await Promise.all([
          hydrateGuestCart(guestCartRaw),
          hydrateGuestWishlist(guestWishlistRaw),
        ]);
        setCart(hydratedCart);
        setWishlist(hydratedWishlist);
        setWishlistIds(hydratedWishlist.map((w) => w.id));
      }
    } catch (e) {
      setUser(null);
      setRole("USER");
      setAddresses([]);
      setBankAccounts([]);
      setOrders([]);
      setConsignments([]);
      setPayouts([]);
      setChatThreads([]);

      const guestCartRaw = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
      const guestWishlistRaw = getLocalStorage<MinimalGuestWishlistItem[]>(GUEST_WISHLIST_KEY, []);
      const [hydratedCart, hydratedWishlist] = await Promise.all([
        hydrateGuestCart(guestCartRaw),
        hydrateGuestWishlist(guestWishlistRaw),
      ]);
      setCart(hydratedCart);
      setWishlist(hydratedWishlist);
      setWishlistIds(hydratedWishlist.map((w) => w.id));
    } finally {
      setIsLoadingUser(false);
    }
  }, [
    refreshWishlist,
    refreshCart,
    refreshOrders,
    refreshConsignments,
    refreshPayouts,
    refreshChat,
  ]);

  // Initial load on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUser(null);
    setRole("USER");
    setAddresses([]);
    setBankAccounts([]);
    setOrders([]);
    setConsignments([]);
    setPayouts([]);
    setChatThreads([]);

    removeLocalStorage(GUEST_CART_KEY);
    removeLocalStorage(GUEST_WISHLIST_KEY);
    setCart([]);
    setWishlist([]);
    setWishlistIds([]);

    showToast("Berhasil keluar dari akun");
    window.location.href = "/";
  };

  const toggleRole = () => {
    setRole((prev) => (prev === "USER" ? "ADMIN" : "USER"));
  };

  const activeAddress =
    addresses.find((a) => a.id === activeAddressId) || addresses[0] || null;

  const activeBankAccount =
    bankAccounts.find((b) => b.isPrimary) || bankAccounts[0] || null;

  const setActiveAddress = (id: string) => {
    setActiveAddressId(id);
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isPrimary: a.id === id,
      }))
    );
  };

  const addAddress = (newAddr: Omit<UserAddress, "id">) => {
    const created: UserAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    if (newAddr.isPrimary) {
      setAddresses((prev) => [created, ...prev.map((a) => ({ ...a, isPrimary: false }))]);
      setActiveAddressId(created.id);
    } else {
      setAddresses((prev) => [...prev, created]);
    }
  };

  const updateAddress = (id: string, updated: Partial<UserAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const addBankAccount = (newBank: Omit<UserBankAccount, "id">) => {
    const created: UserBankAccount = {
      ...newBank,
      id: `bank-${Date.now()}`,
    };
    if (newBank.isPrimary) {
      setBankAccounts((prev) => [created, ...prev.map((b) => ({ ...b, isPrimary: false }))]);
    } else {
      setBankAccounts((prev) => [...prev, created]);
    }
  };

  const updateBankAccount = (id: string, updated: Partial<UserBankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  // Wishlist Actions Real-Time
  const isInWishlist = (productId: string) => {
    return (
      wishlistIds.includes(productId) ||
      wishlist.some((p) => p.id === productId || (p as any).productId === productId)
    );
  };

  const toggleWishlist = async (product: Product): Promise<boolean> => {
    const wasIn = isInWishlist(product.id);

    // Optimistic UI update
    if (wasIn) {
      setWishlist((prev) =>
        prev.filter((p) => p.id !== product.id && (p as any).productId !== product.id)
      );
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      showToast(`Dihapus dari wishlist: ${product.name}`);
    } else {
      setWishlist((prev) => [product, ...prev]);
      setWishlistIds((prev) => [...prev, product.id]);
      showToast(`Disimpan ke wishlist: ${product.name}`);
    }

    if (!user) {
      // Mode Tamu: Simpan data minimal ke localStorage
      const currentWish = getLocalStorage<MinimalGuestWishlistItem[]>(GUEST_WISHLIST_KEY, []);
      let updated: MinimalGuestWishlistItem[];
      if (wasIn) {
        updated = currentWish.filter((p) => p.productId !== product.id);
      } else {
        updated = [
          { productId: product.id, addedAt: new Date().toISOString() },
          ...currentWish.filter((p) => p.productId !== product.id),
        ];
      }
      setLocalStorage(GUEST_WISHLIST_KEY, updated);
      return !wasIn;
    }

    // Mode User: Simpan ke server Supabase
    try {
      const res = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) {
        // Revert on error
        refreshWishlist();
        return wasIn;
      }
      return !wasIn;
    } catch (e) {
      refreshWishlist();
      return wasIn;
    }
  };

  const addToWishlist = async (product: Product) => {
    if (!isInWishlist(product.id)) {
      return await toggleWishlist(product);
    }
    return true;
  };

  const removeFromWishlist = async (productId: string) => {
    const item = wishlist.find((p) => p.id === productId);
    if (item) {
      return await toggleWishlist(item);
    } else {
      return await toggleWishlist({ id: productId } as any);
    }
  };

  // Cart Actions Real-Time (Mendukung Tamu & Pengguna Login)
  const addToCart = async (
    product: Product,
    quantity = 1
  ): Promise<{ success: boolean; alreadyInCart?: boolean }> => {
    const existing = cart.find(
      (item) => item.product.id === product.id || (item as any).productId === product.id
    );

    if (existing) {
      showToast("Gear preloved ini sudah ada di keranjangmu (stok: 1)");
      return { success: true, alreadyInCart: true };
    }

    if (!user) {
      // Validasi batas wajar keranjang tamu: maksimal 20 barang
      const currentGuest = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
      if (currentGuest.length >= 20) {
        showToast("Keranjang sudah mencapai batas maksimal 20 barang.");
        return { success: false };
      }

      const filtered = currentGuest.filter((i) => i.productId !== product.id);
      const minimalItem: MinimalGuestCartItem = {
        productId: product.id,
        quantity: 1, // Preloved stok 1
        addedAt: new Date().toISOString(),
        selected: true,
      };
      setLocalStorage(GUEST_CART_KEY, [minimalItem, ...filtered]);

      const optimisticItem: CartItem = {
        id: `guest-${product.id}`,
        product,
        quantity: 1,
        selected: true,
      };
      setCart((prev) => [optimisticItem, ...prev.filter((i) => i.product.id !== product.id)]);
      showToast("Berhasil ditambahkan ke keranjang!");
      return { success: true, alreadyInCart: false };
    }

    // Mode User Terautentikasi: Simpan ke Supabase via API
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) {
        refreshCart();
        return { success: false };
      }
      if (data?.alreadyInCart) {
        showToast("Gear preloved ini sudah ada di keranjangmu (stok: 1)");
        return { success: true, alreadyInCart: true };
      }
      const optimisticItem: CartItem = {
        id: `cart-${Date.now()}`,
        product,
        quantity: 1,
        selected: true,
      };
      setCart((prev) => [optimisticItem, ...prev.filter((i) => i.product.id !== product.id)]);
      showToast("Berhasil ditambahkan ke keranjang!");
      return { success: true, alreadyInCart: false };
    } catch (e) {
      refreshCart();
      return { success: false };
    }
  };

  const removeFromCart = async (idOrProductId: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== idOrProductId &&
          item.product.id !== idOrProductId &&
          (item as any).productId !== idOrProductId
      )
    );
    showToast("Barang dihapus dari keranjang");

    if (!user) {
      const currentGuest = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
      const filtered = currentGuest.filter(
        (i) => i.productId !== idOrProductId
      );
      setLocalStorage(GUEST_CART_KEY, filtered);
      return;
    }

    try {
      await fetch(
        `/api/cart?id=${encodeURIComponent(idOrProductId)}&productId=${encodeURIComponent(
          idOrProductId
        )}`,
        { method: "DELETE" }
      );
    } catch (e) {
      refreshCart();
    }
  };

  const toggleCartItemSelection = async (idOrProductId: string, selected: boolean) => {
    setCart((prev) => {
      const updated = prev.map((item) => {
        if (item.id === idOrProductId || item.product.id === idOrProductId) {
          return { ...item, selected };
        }
        return item;
      });
      if (!user) {
        const currentGuest = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
        const updatedGuest = currentGuest.map((i) => {
          if (i.productId === idOrProductId) {
            return { ...i, selected };
          }
          return i;
        });
        setLocalStorage(GUEST_CART_KEY, updatedGuest);
      }
      return updated;
    });

    if (!user) return;

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idOrProductId, selected }),
      });
    } catch (e) {
      refreshCart();
    }
  };

  const toggleSelectAllCart = async (selected: boolean) => {
    setCart((prev) => {
      const updated = prev.map((item) => ({ ...item, selected }));
      if (!user) {
        const currentGuest = getLocalStorage<MinimalGuestCartItem[]>(GUEST_CART_KEY, []);
        const updatedGuest = currentGuest.map((i) => ({ ...i, selected }));
        setLocalStorage(GUEST_CART_KEY, updatedGuest);
      }
      return updated;
    });

    if (!user) return;

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectAll: selected }),
      });
    } catch (e) {
      refreshCart();
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (!user) {
      removeLocalStorage(GUEST_CART_KEY);
      return;
    }
    try {
      await fetch("/api/cart", { method: "DELETE" });
    } catch (e) {
      refreshCart();
    }
  };

  // Consignment Actions
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
      originCity: item.originCity || user?.city || "Jakarta Selatan",
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

  const submitConsignmentShipment = (code: string, courier: string, trackingNumber: string) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          return {
            ...c,
            stage: "SHIPPING_TO_HINGO",
            inboundCourier: courier,
            inboundTrackingNumber: trackingNumber,
            handoverMethod: `${courier} · Resi ${trackingNumber}`,
            badgeLabel: "Dalam kiriman ke Hingo",
            statusSummary: `${courier} · ${trackingNumber} dalam perjalanan ke Gudang Hingo`,
            actionActor: "HINGO",
            actionPrompt: "Lacak ke Hingo →",
          };
        }
        return c;
      })
    );

    fetch(`/api/consignments/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SUBMIT_SHIPMENT", courier, trackingNumber }),
    }).catch(console.error);
  };

  const approveConsignmentPrice = (
    code: string,
    breakdown?: { proposedPrice: number; consignmentFee: number; netPayout: number }
  ) => {
    const proposed = breakdown?.proposedPrice ?? 950000;
    const fee = breakdown?.consignmentFee ?? Math.round(proposed * 0.08);
    const net = breakdown?.netPayout ?? proposed - fee - 19000;

    setConsignments((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          return {
            ...c,
            stage: "PRICE_AGREED_MARKETING",
            proposedPriceAfterInspection: proposed,
            consignmentFee: fee,
            estimatedNetPayout: net,
            badgeLabel: "Sedang dipasarkan",
            statusSummary: `Harga disepakati Rp${proposed.toLocaleString("id-ID")}. Sedang dipromosikan tim marketing Hingo`,
            actionActor: "HINGO",
            actionPrompt: "Lihat pemasaran →",
          };
        }
        return c;
      })
    );

    fetch(`/api/consignments/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE_PRICE", proposedPrice: proposed }),
    }).catch(console.error);
  };

  const submitConsignmentRevision = (code: string, updatedPhotos: string[], revisionNotes: string) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          return {
            ...c,
            photos: [...c.photos, ...updatedPhotos],
            defectDetails: `${c.defectDetails} (Catatan perbaikan: ${revisionNotes})`,
            stage: "ONLINE_CHECK",
            badgeLabel: "Menunggu review revisi",
            statusSummary: "Revisi foto & catatan berhasil dikirim. Menunggu pengecekan ulang kurator",
            actionActor: "HINGO",
            actionPrompt: "Lihat pengajuan →",
          };
        }
        return c;
      })
    );

    fetch(`/api/consignments/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SUBMIT_REVISION", updatedPhotos, revisionNotes }),
    }).catch(console.error);
  };

  const requestConsignmentReturn = (code: string, returnOption: string) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          return {
            ...c,
            stage: "RETURN_DISCUSSED",
            badgeLabel: "Pengembalian diproses",
            statusSummary: `Pengembalian disepakati: ${returnOption}. Tim Hingo menyiapkan pengiriman retur`,
            actionActor: "SELLER_AND_HINGO",
            actionPrompt: "Pantau retur →",
          };
        }
        return c;
      })
    );

    fetch(`/api/consignments/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REQUEST_RETURN", returnOption }),
    }).catch(console.error);
  };

  // Orders Actions
  const order = orders.length > 0 ? orders[0] : null;

  const simulatePaymentSuccess = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.orderCode === orderId) {
          return {
            ...o,
            orderStatus: "DELIVERED_CHECKING",
            timeline: [
              {
                step: 1,
                title: "Pembayaran diterima lunas",
                timestamp: "Baru saja terverifikasi otomatis",
                detail: `Pembayaran ${o.totalAmount.toLocaleString("id-ID")} berhasil diverifikasi. Dana disimpan aman di Escrow Hingo.`,
                status: "completed",
              },
              {
                step: 2,
                title: "Barang dikemas dan dikirim Hingo",
                timestamp: "Hari ini",
                detail: `Dikemas double bubble wrap. Resi: ${o.trackingNumber || "JNE2201040842"}.`,
                status: "completed",
              },
              {
                step: 3,
                title: "Paket tiba — waktunya cek barang",
                timestamp: "Tiba di tujuan · Siap diperiksa",
                detail: `Paket diterima. Dana masih ditahan Hingo selama batas pengujian 48 jam.`,
                status: "current",
              },
              {
                step: 4,
                title: "Konfirmasi & pencairan dana",
                timestamp: "Menunggu konfirmasi pembeli",
                detail: "Tekan konfirmasi terima setelah gear berfungsi normal.",
                status: "upcoming",
              },
            ],
          };
        }
        return o;
      })
    );

    fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SIMULATE_PAYMENT" }),
    }).catch(console.error);
  };

  const confirmOrderReceived = (orderId?: string) => {
    const targetCode = orderId || (orders[0]?.orderCode ?? "");
    if (!targetCode) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderCode === targetCode || o.id === targetCode) {
          return {
            ...o,
            orderStatus: "COMPLETED",
            escrowStatus: "RELEASED_TO_SELLER",
            timeline: o.timeline?.map((t, idx) => {
              if (idx === 2) return { ...t, status: "completed" };
              if (idx === 3)
                return {
                  ...t,
                  status: "completed",
                  timestamp: "Terkonfirmasi sekarang",
                  detail: "Barang telah dikonfirmasi sesuai. Dana telah diteruskan ke pemilik barang.",
                };
              return t;
            }),
          };
        }
        return o;
      })
    );

    fetch(`/api/orders/${targetCode}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CONFIRM_RECEIVED" }),
    }).catch(console.error);
  };

  const reportOrderIssue = (
    orderId: string,
    disputeData: Omit<DisputeReport, "createdAt" | "status"> | string
  ) => {
    const formattedDispute: DisputeReport =
      typeof disputeData === "string"
        ? {
            category: "DEFECT",
            description: disputeData,
            evidenceFiles: [],
            createdAt: new Date().toLocaleString("id-ID"),
            status: "UNDER_REVIEW",
          }
        : {
            ...disputeData,
            createdAt: new Date().toLocaleString("id-ID"),
            status: "UNDER_REVIEW",
          };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderCode === orderId || o.id === orderId) {
          return {
            ...o,
            orderStatus: "ISSUE_REPORTED",
            escrowStatus: "DISPUTED",
            dispute: formattedDispute,
          };
        }
        return o;
      })
    );

    fetch(`/api/orders/${orderId}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reasonCategory: formattedDispute.category,
        description: formattedDispute.description,
        evidenceUrls: formattedDispute.evidenceFiles,
      }),
    }).catch(console.error);
  };

  const sendMessage = (
    threadId: string,
    content: string,
    senderRole: "USER" | "ADMIN" | "CS" = "USER"
  ) => {
    const senderName =
      senderRole === "ADMIN" ? "Admin Hingo" : senderRole === "CS" ? "Mira · CS Hingo" : user?.name || "Pengguna";

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
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

    // Call API to persist and trigger smart reply
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        content,
        senderRole,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.autoReply) {
          setTimeout(() => {
            setChatThreads((prev) =>
              prev.map((t) => {
                if (t.id === threadId) {
                  return {
                    ...t,
                    lastMessage: d.autoReply.content,
                    lastTime: d.autoReply.timeLabel,
                    messages: [...t.messages, d.autoReply],
                  };
                }
                return t;
              })
            );
          }, 1500);
        }
      })
      .catch(console.error);
  };

  // Admin Methods
  const adminApproveKyc = (status: "VERIFIED" | "NEEDS_REVISION") => {
    if (!user) return;
    setUser((prev) =>
      prev
        ? {
            ...prev,
            kycStatus: status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED",
            kycDocument: {
              ...prev.kycDocument,
              status: status === "VERIFIED" ? "APPROVED" : "NEEDS_REVISION",
            },
          }
        : null
    );

    fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE_KYC", userId: user.id, status }),
    }).catch(console.error);
  };

  const adminSubmitInspection = (
    code: string,
    inspectionData: {
      specs: string;
      functionTest: string;
      conditionAndDefect: string;
      completenessReceived: string;
    },
    proposedPrice: number,
    consignmentFee: number,
    netPayout: number
  ) => {
    setConsignments((prev) =>
      prev.map((c) => {
        if (c.code === code) {
          return {
            ...c,
            stage: "INSPECTION_COMPLETED",
            proposedPriceAfterInspection: proposedPrice,
            consignmentFee,
            estimatedNetPayout: netPayout,
            badgeLabel: "Tinjau hasil inspeksi",
            statusSummary: `Inspeksi fisik selesai, usulan harga Rp${proposedPrice.toLocaleString(
              "id-ID"
            )}`,
            actionActor: "SELLER",
            actionPrompt: "Tinjau hasil inspeksi →",
            inspectionReport: {
              functionNormal: true,
              hasCosmeticDefect: true,
              specs: inspectionData.specs,
              functionTest: inspectionData.functionTest,
              conditionAndDefect: inspectionData.conditionAndDefect,
              completenessReceived: inspectionData.completenessReceived,
              inspectedAt: `${new Date().toLocaleDateString("id-ID")} oleh Tim Inspeksi Hingo`,
            },
          };
        }
        return c;
      })
    );

    fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SUBMIT_INSPECTION",
        code,
        specs: inspectionData.specs,
        functionTest: inspectionData.functionTest,
        conditionAndDefect: inspectionData.conditionAndDefect,
        completenessReceived: inspectionData.completenessReceived,
        proposedPrice,
      }),
    }).catch(console.error);
  };

  const adminReleaseEscrow = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderCode === orderId || o.id === orderId) {
          return {
            ...o,
            orderStatus: "COMPLETED",
            escrowStatus: "RELEASED_TO_SELLER",
          };
        }
        return o;
      })
    );

    fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "RELEASE_ESCROW", orderId }),
    }).catch(console.error);
  };

  const adminUpdateTracking = (orderId: string, trackingNumber: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderCode === orderId || o.id === orderId) {
          return {
            ...o,
            trackingNumber,
            orderStatus: "SHIPPED",
          };
        }
        return o;
      })
    );

    fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_ORDER_TRACKING", orderId, trackingNumber }),
    }).catch(console.error);
  };

  return (
    <HingoStoreContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        user,
        setUser,
        isLoadingUser,
        logout,
        refreshSession,
        addresses,
        activeAddress,
        setActiveAddress,
        addAddress,
        updateAddress,
        bankAccounts,
        activeBankAccount,
        addBankAccount,
        updateBankAccount,
        wishlist,
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        cart,
        addToCart,
        removeFromCart,
        toggleCartItemSelection,
        toggleSelectAllCart,
        clearCart,
        consignments,
        refreshConsignments,
        addConsignment,
        submitConsignmentShipment,
        approveConsignmentPrice,
        submitConsignmentRevision,
        requestConsignmentReturn,
        orders,
        order,
        refreshOrders,
        simulatePaymentSuccess,
        confirmOrderReceived,
        reportOrderIssue,
        payouts,
        refreshPayouts,
        chatThreads,
        refreshChat,
        sendMessage,
        toastMessage,
        showToast,
        adminApproveKyc,
        adminSubmitInspection,
        adminReleaseEscrow,
        adminUpdateTracking,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-2 border border-neutral-700">
          <span className="h-2 w-2 rounded-full bg-[#FFC629]" />
          <span>{toastMessage}</span>
        </div>
      )}
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
