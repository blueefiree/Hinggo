"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  Send,
  Building2,
  DollarSign,
  UserCheck,
  Package,
  Clock,
  ArrowRight,
  Eye,
  Check,
  X,
  MessageSquare,
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Database,
  Copy,
  Upload,
  ExternalLink,
  Image as ImageIcon,
  AlertTriangle,
  Layers,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";
import { Product } from "@/lib/data";

const SUPABASE_SQL_SCRIPT = `-- 1. Tabel Users (Profil & Role Pengguna)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Pengguna Hingo',
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  city TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'USER',
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'UNVERIFIED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Sessions (Sesi Login 30 Hari)
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_agent TEXT DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel OTP Verifications
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id TEXT PRIMARY KEY,
  target TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'WHATSAPP',
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Dokumen KYC
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  full_name_ktp TEXT NOT NULL,
  nik_number TEXT NOT NULL,
  masked_nik TEXT NOT NULL,
  ktp_image_url TEXT NOT NULL,
  ktp_file_size TEXT DEFAULT '1.5 MB',
  selfie_image_url TEXT NOT NULL,
  selfie_file_size TEXT DEFAULT '1.8 MB',
  status TEXT DEFAULT 'PENDING_REVIEW',
  rejection_reason TEXT DEFAULT '',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Buku Alamat
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Rekening Bank Pencairan
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Katalog Produk (Full CRUD)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  consignment_item_id TEXT,
  seller_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Sangat baik',
  usage_duration TEXT DEFAULT '',
  switch_or_variant TEXT DEFAULT '',
  completeness TEXT DEFAULT '',
  description TEXT DEFAULT '',
  defect_notes TEXT DEFAULT '',
  price BIGINT NOT NULL,
  original_new_price BIGINT DEFAULT 0,
  stock INT DEFAULT 1,
  location TEXT DEFAULT 'Jakarta Selatan',
  rating NUMERIC(3,1) DEFAULT 5.0,
  sold_count INT DEFAULT 0,
  is_verified_by_team BOOLEAN DEFAULT TRUE,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Wishlist
CREATE TABLE IF NOT EXISTS public.wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. Tabel Keranjang Belanja
CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  selected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 10. Tabel Barang Titipan (Consignments)
CREATE TABLE IF NOT EXISTS public.consignments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  seller_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  brand_model TEXT NOT NULL,
  variant_spec TEXT DEFAULT '',
  usage_duration TEXT DEFAULT '',
  current_condition TEXT DEFAULT 'Bekas · berfungsi normal',
  completeness TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  expected_price BIGINT NOT NULL,
  proposed_price BIGINT,
  consignment_fee BIGINT,
  estimated_net_payout BIGINT,
  origin_city TEXT DEFAULT '',
  stage TEXT DEFAULT 'ONLINE_CHECK',
  badge_label TEXT DEFAULT 'Menunggu review',
  status_summary TEXT DEFAULT 'Data sudah terkirim.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Pesanan & Escrow (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  buyer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  item_price BIGINT NOT NULL,
  shipping_courier TEXT DEFAULT 'JNE REG',
  shipping_cost BIGINT DEFAULT 18000,
  shipping_protection BIGINT DEFAULT 5000,
  service_fee BIGINT DEFAULT 2500,
  total_amount BIGINT NOT NULL,
  payment_method TEXT DEFAULT 'BCA_VA',
  tracking_number TEXT DEFAULT '',
  escrow_status TEXT DEFAULT 'HELD_BY_HINGO',
  order_status TEXT DEFAULT 'PAID_PACKING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Kolom Indeks Email Pengguna (Anti-Hilang Saat Refresh)
ALTER TABLE public.consignments ADD COLUMN IF NOT EXISTS seller_email TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_email TEXT DEFAULT '';
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email TEXT DEFAULT '';
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.kyc_documents ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.chat_threads ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_consignments_seller_email ON public.consignments(seller_email);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_email ON public.cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_email ON public.wishlists(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);

-- Aktifkan RLS & Buka Policy untuk Aplikasi Hingo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for Hingo app" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.consignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.orders FOR ALL USING (true) WITH CHECK (true);`;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, role, setRole, logout, showToast } = useHingoStore();

  const [activeTab, setActiveTab] = useState<
    "products" | "consignments" | "orders" | "kyc" | "chat" | "database"
  >("products");

  // Admin Data from API
  const [loadingData, setLoadingData] = useState(true);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [consignments, setConsignments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<any>({
    connected: false,
    url: "https://obdczozspvkdebhtyhoh.supabase.co",
    tables: { products: false, users: false, consignments: false, orders: false },
    allTablesCreated: false,
  });

  // Fetch all admin data
  const fetchAdminData = async () => {
    try {
      setLoadingData(true);
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setCatalogProducts(data.products || []);
        setKycDocs(data.kycDocs || []);
        setConsignments(data.consignments || []);
        setOrders(data.orders || []);
        setUsersList(data.users || []);
        if (data.supabaseStatus) {
          setSupabaseStatus(data.supabaseStatus);
        }
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // -------------------------------------------------------------
  // TAB 1: PRODUCT CRUD STATE & HANDLERS
  // -------------------------------------------------------------
  const [productSearch, setProductSearch] = useState("");
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formCategory, setFormCategory] = useState("KEYBOARD");
  const [formCondition, setFormCondition] = useState("Sangat baik");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formVariant, setFormVariant] = useState("");
  const [formCompleteness, setFormCompleteness] = useState("Unit lengkap dengan box");
  const [formDuration, setFormDuration] = useState("6 bulan");
  const [formLocation, setFormLocation] = useState("Jakarta Selatan");
  const [formDesc, setFormDesc] = useState("");
  const [formDefect, setFormDefect] = useState("Fungsi normal 100%, fisik mulus terawat.");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formUrlInput, setFormUrlInput] = useState("");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetProductForm = () => {
    setFormName("");
    setFormBrand("");
    setFormCategory("KEYBOARD");
    setFormCondition("Sangat baik");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormVariant("");
    setFormCompleteness("Unit lengkap dengan box");
    setFormDuration("6 bulan");
    setFormLocation("Jakarta Selatan");
    setFormDesc("");
    setFormDefect("Fungsi normal 100%, fisik mulus terawat.");
    setFormImages([]);
    setFormUrlInput("");
  };

  const openAddModal = () => {
    resetProductForm();
    setEditingProduct(null);
    setAddProductModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setFormName(prod.name || "");
    setFormBrand(prod.brand || "");
    setFormCategory(prod.category || "KEYBOARD");
    setFormCondition(prod.condition || "Sangat baik");
    setFormPrice(String(prod.price || ""));
    setFormOriginalPrice(String(prod.originalNewPrice || ""));
    setFormVariant(prod.switchOrVariant || "");
    setFormCompleteness(prod.completeness || "");
    setFormDuration(prod.usageDuration || "");
    setFormLocation(prod.location || "Jakarta Selatan");
    setFormDesc(prod.description || "");
    setFormDefect(prod.defectNotes || "");
    setFormImages(Array.isArray(prod.images) ? prod.images : []);
    setFormUrlInput("");
    setAddProductModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddUrlImage = () => {
    if (formUrlInput.trim()) {
      setFormImages((prev) => [...prev, formUrlInput.trim()]);
      setFormUrlInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert("Nama dan harga produk wajib diisi!");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const isEdit = Boolean(editingProduct);
      const url = isEdit ? `/api/products/${editingProduct.slug || editingProduct.id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const bodyData = {
        name: formName.trim(),
        brand: formBrand.trim() || "CUSTOM",
        category: formCategory,
        condition: formCondition,
        price: Number(formPrice),
        originalNewPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        switchOrVariant: formVariant || "Standar",
        completeness: formCompleteness,
        usageDuration: formDuration,
        location: formLocation,
        description: formDesc || `Gear preloved pilihan terverifikasi Hingo. ${formName}`,
        defectNotes: formDefect,
        images: formImages.length > 0 ? formImages : [
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"
        ],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (res.ok) {
        setAddProductModalOpen(false);
        showToast(isEdit ? "Produk berhasil diperbarui!" : "Produk baru berhasil ditambahkan!");
        await fetchAdminData();
      } else {
        alert(data.error || "Gagal menyimpan produk");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan sistem saat menyimpan produk");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (prod: any) => {
    if (!confirm(`Hapus produk "${prod.name}" (${prod.code}) dari katalog?`)) return;
    try {
      const res = await fetch(`/api/products/${prod.slug || prod.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Produk berhasil dihapus!");
        await fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus produk");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const filteredCatalogProducts = catalogProducts.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // -------------------------------------------------------------
  // TAB 2: CONSIGNMENT ACTIONS
  // -------------------------------------------------------------
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [activeConsignment, setActiveConsignment] = useState<any | null>(null);
  const [insSpecs, setInsSpecs] = useState("");
  const [insFunc, setInsFunc] = useState("Switch dan sensor optik 100% normal dan responsif.");
  const [insDefect, setInsDefect] = useState("Gores halus pemakaian normal.");
  const [insComp, setInsComp] = useState("Unit lengkap original dengan kabel dan box.");
  const [insPrice, setInsPrice] = useState("950000");

  const openInspectionModal = (c: any) => {
    setActiveConsignment(c);
    setInsSpecs(c.variantSpec || "Varian Standar");
    setInsPrice(String(c.proposedPrice || c.expectedPrice || "950000"));
    setInspectionModalOpen(true);
  };

  const handleOnlineCheckPass = async (code: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ONLINE_CHECK_PASS", code }),
      });
      if (res.ok) {
        showToast(`Barang ${code} lolos cek online! Penjual diminta mengirim barang.`);
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal memproses cek online");
    }
  };

  const handleConfirmWarehouse = async (code: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_WAREHOUSE_RECEIVED", code }),
      });
      if (res.ok) {
        showToast(`Paket ${code} telah tiba di Gudang Hingo!`);
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal mengonfirmasi penerimaan barang");
    }
  };

  const handleSaveInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConsignment) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_INSPECTION",
          code: activeConsignment.code,
          specs: insSpecs,
          functionTest: insFunc,
          conditionAndDefect: insDefect,
          completenessReceived: insComp,
          proposedPrice: Number(insPrice),
        }),
      });
      if (res.ok) {
        setInspectionModalOpen(false);
        showToast("Laporan inspeksi & usulan harga berhasil disimpan!");
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal menyimpan hasil inspeksi");
    }
  };

  const handlePublishConsignmentToCatalog = async (code: string, price?: number) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH_CONSIGNMENT",
          consignmentCode: code,
          proposedPrice: price,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Barang titipan ${code} resmi ditayangkan ke katalog!`);
        await fetchAdminData();
      } else {
        alert(data.error || "Gagal menayangkan ke katalog");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  // -------------------------------------------------------------
  // TAB 3: ORDER & ESCROW ACTIONS
  // -------------------------------------------------------------
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [courierInput, setCourierInput] = useState("JNE REG");
  const [resiInput, setResiInput] = useState("");

  const openShippingModal = (ord: any) => {
    setActiveOrder(ord);
    setCourierInput(ord.shippingCourier || "JNE REG");
    setResiInput(ord.trackingNumber || `JNE${Date.now().toString().slice(-8)}`);
    setShippingModalOpen(true);
  };

  const handleVerifyOrderPayment = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_ORDER_PAYMENT", orderId }),
      });
      if (res.ok) {
        showToast("Pembayaran pesanan diverifikasi lunas!");
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal memverifikasi pembayaran");
    }
  };

  const handleSaveShippingTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !resiInput.trim()) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ORDER_TRACKING",
          orderId: activeOrder.id,
          trackingNumber: resiInput.trim(),
          courier: courierInput,
        }),
      });
      if (res.ok) {
        setShippingModalOpen(false);
        showToast(`Resi ${resiInput} tersimpan. Status pesanan dikirim!`);
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal mengupdate resi");
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ORDER_DELIVERED", orderId }),
      });
      if (res.ok) {
        showToast("Paket ditandai telah tiba di pembeli!");
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal mengubah status pengiriman");
    }
  };

  const handleReleaseEscrow = async (orderId: string) => {
    if (!confirm("Cairkan dana escrow ke rekening bank penjual sekarang?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RELEASE_ESCROW", orderId }),
      });
      if (res.ok) {
        showToast("Dana escrow berhasil dicairkan ke penjual!");
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal mencairkan escrow");
    }
  };

  // -------------------------------------------------------------
  // TAB 4: KYC ACTIONS
  // -------------------------------------------------------------
  const handleKycReview = async (userId: string, action: "APPROVE_KYC" | "REJECT_KYC") => {
    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId }),
      });
      if (res.ok) {
        showToast(action === "APPROVE_KYC" ? "KYC Pengguna Disetujui (VERIFIED)!" : "KYC Ditolak / Minta upload ulang");
        await fetchAdminData();
      }
    } catch (e) {
      alert("Gagal memperbarui status KYC");
    }
  };

  // -------------------------------------------------------------
  // TAB 5: CHAT THREADS
  // -------------------------------------------------------------
  const [chatSenderRole, setChatSenderRole] = useState<"ADMIN" | "CS">("ADMIN");
  const [chatMessageText, setChatMessageText] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim()) return;
    setChatSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: "product-thread-default",
          type: "ADMIN_REPLY",
          senderRole: chatSenderRole,
          content: chatMessageText.trim(),
        }),
      });
      if (res.ok) {
        showToast(`Pesan terkirim sebagai ${chatSenderRole === "ADMIN" ? "Admin Hingo" : "CS Mira"}!`);
        setChatMessageText("");
      }
    } catch (e) {
      alert("Gagal mengirim pesan chat");
    } finally {
      setChatSending(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 6: SUPABASE SYNC & SQL COPY
  // -------------------------------------------------------------
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_TO_SUPABASE" }),
      });
      const data = await res.json();
      setSyncResult(data);
      if (res.ok) {
        showToast(data.message || "Sinkronisasi berhasil!");
        await fetchAdminData();
      } else {
        alert(data.error || "Gagal melakukan sinkronisasi");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan sistem saat sinkronisasi");
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setSqlCopied(true);
    showToast("Script SQL berhasil disalin ke clipboard!");
    setTimeout(() => setSqlCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 md:py-8 pb-20">
      {/* Top Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#1A1A1A] text-white p-4 sm:p-7 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-neutral-800">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFC629] text-black font-black text-xl">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                Control Center Hingo
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white mt-0.5">
              Dashboard Admin & Operasional
            </h1>
            <p className="text-[11px] sm:text-xs text-neutral-400">
              CRUD Produk, Alur Titip Jual Penjual, Escrow Transaksi, Verifikasi KYC & Sinkronisasi Supabase.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-white transition border border-white/10 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-3.5 py-2 text-xs font-black text-black transition shadow-xs active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Lihat Website</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 text-xs">
        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block text-[11px]">Katalog Produk</span>
            <strong className="text-lg sm:text-xl font-black text-neutral-900">
              {catalogProducts.length} Barang
            </strong>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Package className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block text-[11px]">Titipan Penjual</span>
            <strong className="text-lg sm:text-xl font-black text-neutral-900">
              {consignments.length} Pengajuan
            </strong>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Layers className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block text-[11px]">Pesanan & Escrow</span>
            <strong className="text-lg sm:text-xl font-black text-neutral-900">
              {orders.length} Transaksi
            </strong>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-neutral-400 font-bold block text-[11px]">Koneksi Supabase</span>
            <strong className="text-sm sm:text-base font-black text-neutral-900 flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${supabaseStatus.connected ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{supabaseStatus.connected ? "Terhubung" : "SQLite Lokal"}</span>
            </strong>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Database className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* 6 Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 no-scrollbar border-b border-neutral-200 text-xs">
        {[
          { id: "products", label: "1. Produk Katalog (Full CRUD)", count: catalogProducts.length },
          { id: "consignments", label: "2. Antrean Titip Jual", count: consignments.length },
          { id: "orders", label: "3. Pesanan & Escrow", count: orders.length },
          { id: "kyc", label: "4. Verifikasi KYC", count: kycDocs.filter((k) => k.status === "PENDING_REVIEW").length },
          { id: "chat", label: "5. Live Chat Admin", count: null },
          { id: "database", label: "6. Sinkronisasi Supabase", count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
              activeTab === tab.id
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-[#FFC629] text-black" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MANAJEMEN PRODUK KATALOG (FULL CRUD)                    */}
      {/* ============================================================== */}
      {activeTab === "products" && (
        <div className="flex flex-col gap-5">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari kode, nama, atau brand..."
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              </div>
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch("")}
                  className="text-xs text-neutral-400 hover:text-black"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] px-4 py-2.5 text-xs font-black text-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Barang ke Katalog</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
            {filteredCatalogProducts.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Package className="h-10 w-10 text-neutral-300" />
                <p className="text-xs font-bold text-neutral-500">
                  {catalogProducts.length === 0
                    ? "Belum ada produk di katalog. Klik tombol di atas untuk menambah barang!"
                    : "Tidak ada produk yang cocok dengan pencarian."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F6F4] text-neutral-500 uppercase tracking-wider font-bold border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">Barang</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Kondisi</th>
                      <th className="py-3 px-3">Harga Jual</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredCatalogProducts.map((p) => {
                      const firstImg =
                        Array.isArray(p.images) && p.images[0]
                          ? p.images[0]
                          : "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=300&auto=format&fit=crop";

                      return (
                        <tr key={p.id} className="hover:bg-neutral-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={firstImg}
                                alt={p.name}
                                className="h-12 w-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                              />
                              <div>
                                <span className="font-mono text-[10px] text-neutral-400 block font-bold">
                                  {p.code}
                                </span>
                                <strong className="text-neutral-900 font-bold block leading-tight">
                                  {p.name}
                                </strong>
                                <span className="text-[11px] text-neutral-400">
                                  {p.brand} · {p.switchOrVariant}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md text-[10px]">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-600 font-medium">
                            {p.condition}
                          </td>
                          <td className="py-3 px-3">
                            <strong className="text-neutral-900 font-black">
                              {formatRupiah(p.price)}
                            </strong>
                            {p.originalNewPrice > 0 && (
                              <span className="text-[10px] text-neutral-400 line-through block">
                                {formatRupiah(p.originalNewPrice)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <StatusBadge
                              label={p.status === "AVAILABLE" ? "Tersedia" : "Terjual"}
                              variant={p.status === "AVAILABLE" ? "verified" : "neutral"}
                              size="sm"
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/product/${p.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition"
                                title="Lihat di Web"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-amber-50 hover:text-amber-900 text-neutral-600 transition cursor-pointer"
                                title="Edit Produk"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p)}
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-red-50 hover:text-red-700 text-neutral-600 transition cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ANTREAN TITIP JUAL & INSPEKSI PENJUAL                    */}
      {/* ============================================================== */}
      {activeTab === "consignments" && (
        <div className="flex flex-col gap-4">
          {consignments.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
              Belum ada pengajuan titip jual dari penjual.
            </div>
          ) : (
            consignments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-800">{c.code}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-500">{c.seller?.name || "Penjual"}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-400">{c.originCity}</span>
                  </div>
                  <StatusBadge label={c.badgeLabel} variant="warning" size="sm" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black text-neutral-900">{c.brandModel}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {c.category} · {c.variantSpec} · Ekspektasi: {formatRupiah(c.expectedPrice)}
                    </p>
                    <p className="text-xs text-amber-900 mt-1 font-medium bg-[#FFFBEB] px-2.5 py-1 rounded-md inline-block">
                      {c.statusSummary}
                    </p>
                  </div>

                  {/* Stage Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {c.stage === "ONLINE_CHECK" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOnlineCheckPass(c.code)}
                          className="px-3.5 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          ✓ Loloskan Cek Online
                        </button>
                      </>
                    )}

                    {c.stage === "SHIPPING_TO_HINGO" && (
                      <button
                        type="button"
                        onClick={() => handleConfirmWarehouse(c.code)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        📦 Konfirmasi Paket Tiba di Gudang
                      </button>
                    )}

                    {(c.stage === "INSPECTION_COMPLETED" || c.stage === "ONLINE_CHECK_PASSED") && (
                      <button
                        type="button"
                        onClick={() => openInspectionModal(c)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs transition active:scale-95 cursor-pointer"
                      >
                        📝 Input Laporan & Usulan Harga
                      </button>
                    )}

                    {/* Publish to catalog button */}
                    <button
                      type="button"
                      onClick={() => handlePublishConsignmentToCatalog(c.code, c.proposedPrice)}
                      className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-[#FFC629] font-black text-xs shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      🚀 Tayangkan ke Katalog Belanja
                    </button>

                    <Link
                      href={`/seller/consignments/${c.code}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-50"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PESANAN PEMBELI & ESCROW REKBER                         */}
      {/* ============================================================== */}
      {activeTab === "orders" && (
        <div className="flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
              Belum ada transaksi pesanan pembeli.
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-800">{o.orderCode}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-neutral-600">Pembeli: {o.buyer?.name}</span>
                    <span className="text-neutral-300">·</span>
                    <span className="font-bold text-neutral-900">{formatRupiah(o.totalAmount)}</span>
                  </div>
                  <StatusBadge label={o.orderStatus} variant="verified" size="sm" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{o.product?.name || "Produk Gaming"}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Kurir: {o.shippingCourier} · Resi: <strong className="text-neutral-800 font-mono">{o.trackingNumber || "Belum ada resi"}</strong>
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      Status Escrow: <strong className="text-amber-900">{o.escrowStatus}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {o.orderStatus === "UNPAID" && (
                      <button
                        type="button"
                        onClick={() => handleVerifyOrderPayment(o.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        ✓ Verifikasi Bayar Lunas
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openShippingModal(o)}
                      className="px-3.5 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      🚚 Input Resi & Kirim
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(o.id)}
                      className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition cursor-pointer"
                    >
                      Tandai Tiba
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReleaseEscrow(o.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-[#FFC629] font-black text-xs transition cursor-pointer"
                    >
                      💸 Cairkan Escrow ke Penjual
                    </button>

                    <Link
                      href={`/orders/${o.orderCode}`}
                      target="_blank"
                      className="px-3 py-2 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-bold hover:bg-neutral-50"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: VERIFIKASI IDENTITAS KYC USER                           */}
      {/* ============================================================== */}
      {activeTab === "kyc" && (
        <div className="flex flex-col gap-4">
          {kycDocs.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
              Belum ada dokumen KYC yang diunggah.
            </div>
          ) : (
            kycDocs.map((k) => (
              <div
                key={k.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-100 text-xs">
                  <div>
                    <span className="font-bold text-neutral-900 text-sm">{k.fullNameKtp}</span>
                    <span className="text-neutral-400 text-xs ml-2 font-mono">{k.maskedNik}</span>
                  </div>
                  <StatusBadge
                    label={k.status === "VERIFIED" ? "Terverifikasi" : k.status === "REJECTED" ? "Ditolak" : "Menunggu Review"}
                    variant={k.status === "VERIFIED" ? "verified" : "warning"}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-neutral-200 p-2.5 bg-[#F6F6F4]">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Foto KTP</span>
                    <img
                      src={k.ktpImageUrl || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"}
                      alt="KTP"
                      className="aspect-4/3 w-full rounded-lg object-cover"
                    />
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-2.5 bg-[#F6F6F4]">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Foto Selfie + KTP</span>
                    <img
                      src={k.selfieImageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"}
                      alt="Selfie"
                      className="aspect-4/3 w-full rounded-lg object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleKycReview(k.userId, "REJECT_KYC")}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                  >
                    Tolak / Minta Upload Ulang
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKycReview(k.userId, "APPROVE_KYC")}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    ✓ Setujui KYC (Verified)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: LIVE CHAT ADMIN PRODUK & CS                             */}
      {/* ============================================================== */}
      {activeTab === "chat" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Live Chat Respon Admin</h3>
              <p className="text-xs text-neutral-500">Balas pertanyaan calon pembeli atau tiket bantuan CS</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F6F6F4] p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setChatSenderRole("ADMIN")}
                className={`px-3 py-1 rounded-lg transition ${
                  chatSenderRole === "ADMIN" ? "bg-[#1A1A1A] text-white" : "text-neutral-600"
                }`}
              >
                Admin Hingo
              </button>
              <button
                type="button"
                onClick={() => setChatSenderRole("CS")}
                className={`px-3 py-1 rounded-lg transition ${
                  chatSenderRole === "CS" ? "bg-[#FFC629] text-black" : "text-neutral-600"
                }`}
              >
                CS Mira
              </button>
            </div>
          </div>

          <form onSubmit={handleSendChat} className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={chatMessageText}
              onChange={(e) => setChatMessageText(e.target.value)}
              placeholder={`Tulis balasan resmi sebagai ${chatSenderRole === "ADMIN" ? "Admin Kurasi Hingo" : "CS Mira"}…`}
              className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                Pesan akan langsung masuk ke ruang chat pengguna di <code>/chat/product</code> dan <code>/chat/support</code>.
              </span>
              <button
                type="submit"
                disabled={!chatMessageText.trim() || chatSending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{chatSending ? "Mengirim..." : "Kirim Pesan"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: STATUS DATABASE SUPABASE & SINKRONISASI 1-KLIK           */}
      {/* ============================================================== */}
      {activeTab === "database" && (
        <div className="flex flex-col gap-5">
          {/* Status Box */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Project Supabase Cloud</h3>
                  <code className="text-[11px] text-neutral-400 font-mono">https://obdczozspvkdebhtyhoh.supabase.co</code>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Terhubung
              </span>
            </div>

            {/* Table Checklist */}
            <div>
              <span className="text-xs font-bold text-neutral-700 block mb-2">
                Status 4 Tabel Utama di Supabase:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {Object.entries(supabaseStatus.tables || {}).map(([tbl, isReady]) => (
                  <div
                    key={tbl}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isReady
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : "bg-amber-50 border-amber-200 text-amber-950"
                    }`}
                  >
                    <span className="font-mono font-bold">public.{tbl}</span>
                    <span className="text-[10px] font-bold">
                      {isReady ? "✓ Siap" : "Belum dibuat"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSyncingSupabase}
                onClick={handleSyncToSupabase}
                className="flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black text-xs px-5 py-3 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncingSupabase ? "animate-spin" : ""}`} />
                <span>{isSyncingSupabase ? "Menyinkronkan data..." : "Sinkronkan Data Lokal (Prisma) ke Cloud Supabase"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySqlScript}
                className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs px-4 py-3 transition active:scale-95 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                <span>{sqlCopied ? "✓ Berhasil Disalin!" : "Salin Script SQL 12 Tabel"}</span>
              </button>
            </div>

            {syncResult && (
              <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs text-neutral-800">
                <strong>Hasil Sinkronisasi:</strong> {syncResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH / EDIT PRODUK                                    */}
      {/* ============================================================== */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A] my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A1A1A]">
                {editingProduct ? `Edit Produk: ${editingProduct.name}` : "+ Tambah Barang ke Katalog Hingo"}
              </h3>
              <button
                type="button"
                onClick={() => setAddProductModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nama Barang *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="misal: Keychron K2 V2 Wireless"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Brand / Merek *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="misal: KEYCHRON, LOGITECH, RAZER"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  >
                    <option value="KEYBOARD">Keyboard</option>
                    <option value="MOUSE">Mouse</option>
                    <option value="HEADSET">Headset</option>
                    <option value="MONITOR">Monitor</option>
                    <option value="ACCESSORIES">Aksesoris</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kondisi</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  >
                    <option value="Sangat baik">Sangat baik</option>
                    <option value="Baik">Baik</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Lama Pemakaian</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="misal: 6 bulan"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Harga Jual Hingo (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="misal: 850000"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Harga Baru Referensi (Rp)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="misal: 1499000"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Varian / Switch</label>
                  <input
                    type="text"
                    value={formVariant}
                    onChange={(e) => setFormVariant(e.target.value)}
                    placeholder="misal: Gateron G Pro Brown / Darkfield 8000"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kelengkapan</label>
                  <input
                    type="text"
                    value={formCompleteness}
                    onChange={(e) => setFormCompleteness(e.target.value)}
                    placeholder="misal: Box, kabel original, receiver"
                    className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2.5 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Deskripsi Hasil Uji Inspeksi</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Laporan fungsi 100% normal, baterai sehat, switch taktil."
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-3 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Catatan Cacat Kosmetik</label>
                <input
                  type="text"
                  value={formDefect}
                  onChange={(e) => setFormDefect(e.target.value)}
                  placeholder="Gores halus pemakaian normal pada case samping."
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] px-3.5 py-2 text-xs text-[#1A1A1A] outline-none focus:border-[#FFC629] focus:bg-white"
                />
              </div>

              {/* Foto Produk: File Upload + URL Link */}
              <div className="rounded-xl border border-neutral-200 p-3.5 bg-[#F6F6F4]">
                <label className="block font-bold text-neutral-800 mb-2">
                  Foto Produk (Upload File Gambar atau Tempel Link URL)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-100 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Foto dari File Laptop/HP</span>
                  </button>

                  <div className="flex-1 flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={formUrlInput}
                      onChange={(e) => setFormUrlInput(e.target.value)}
                      placeholder="Atau tempel link URL foto https://..."
                      className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-[#1A1A1A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      className="px-3 py-2 rounded-xl bg-[#1A1A1A] text-white font-bold cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail Grid */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2 border-t border-neutral-200">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-neutral-300 group">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="px-6 py-2.5 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProduct ? "Menyimpan ke Database..." : editingProduct ? "Simpan Perubahan" : "+ Terbitkan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INPUT INSPEKSI & USULAN HARGA                            */}
      {/* ============================================================== */}
      {inspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A1A1A]">
                Input Laporan Inspeksi: {activeConsignment?.code}
              </h3>
              <button
                type="button"
                onClick={() => setInspectionModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Spesifikasi Terverifikasi</label>
                <input
                  type="text"
                  required
                  value={insSpecs}
                  onChange={(e) => setInsSpecs(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Uji Fungsi Switch & Sensor</label>
                <textarea
                  rows={2}
                  required
                  value={insFunc}
                  onChange={(e) => setInsFunc(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kondisi Aktual & Cacat Fisik</label>
                <input
                  type="text"
                  required
                  value={insDefect}
                  onChange={(e) => setInsDefect(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kelengkapan Diterima</label>
                <input
                  type="text"
                  required
                  value={insComp}
                  onChange={(e) => setInsComp(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Usulan Harga Jual Final (Rp) *</label>
                <input
                  type="number"
                  required
                  value={insPrice}
                  onChange={(e) => setInsPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs font-bold font-mono text-base"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Komisi Hingo: {formatRupiah(Math.round(Number(insPrice) * 0.08))} (8%) · Estimasi Bersih Penjual: {formatRupiah(Math.round(Number(insPrice) * 0.92) - 19000)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black"
                >
                  Simpan Laporan & Usulkan Harga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INPUT RESI PENGIRIMAN                                   */}
      {/* ============================================================== */}
      {shippingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 text-[#1A1A1A]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-[#1A1A1A]">
                Input Pengiriman Pesanan: {activeOrder?.orderCode}
              </h3>
              <button
                type="button"
                onClick={() => setShippingModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShippingTracking} className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Kurir Ekspedisi</label>
                <select
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs font-bold"
                >
                  <option value="JNE REG">JNE REG</option>
                  <option value="J&T Reguler">J&T Reguler</option>
                  <option value="SiCepat Reg">SiCepat Reguler</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nomor Resi Pengiriman *</label>
                <input
                  type="text"
                  required
                  value={resiInput}
                  onChange={(e) => setResiInput(e.target.value)}
                  placeholder="misal: JNE2201040842"
                  className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] p-2.5 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShippingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 font-bold text-neutral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black font-black"
                >
                  Simpan & Update Status Dikirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
