"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  MessageSquare,
  Package,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Headphones,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useHingoStore } from "@/lib/store";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";
  const { showToast } = useHingoStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedResi, setCopiedResi] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          setOrder(null);
          return;
        }
        const data = await res.json();
        if (data.order) {
          const ord = data.order;
          const formattedTimeline = ord.timeline && ord.timeline.length > 0
            ? ord.timeline.map((t: any) => ({
                step: t.stepOrder,
                title: t.title,
                status: t.isCompleted ? "completed" : "upcoming",
                timestamp: t.timestampText || "",
                detail: t.description || "",
              }))
            : [
                {
                  step: 1,
                  title: "Pembayaran terverifikasi",
                  status: "completed",
                  timestamp: "Hari ini",
                  detail: "Pembayaran otomatis via BCA Virtual Account terverifikasi.",
                },
                {
                  step: 2,
                  title: "Pengemasan aman & kurir",
                  status: "completed",
                  timestamp: "Hari ini",
                  detail: "Dikemas double bubble wrap & dus tebal oleh tim kurasi.",
                },
                {
                  step: 3,
                  title: "Paket tiba — masa uji 48 jam",
                  status: ord.orderStatus === "COMPLETED" ? "completed" : "current",
                  timestamp: "Sekarang",
                  detail: "Uji fungsi tombol, switch, sensor, dan kelengkapan sebelum konfirmasi.",
                },
                {
                  step: 4,
                  title: "Konfirmasi & pencairan dana",
                  status: ord.orderStatus === "COMPLETED" ? "completed" : "upcoming",
                  timestamp: ord.orderStatus === "COMPLETED" ? "Selesai" : "Menunggu konfirmasi pembeli",
                  detail: "Setelah dikonfirmasi sesuai, dana escrow diteruskan ke pemilik gear.",
                },
              ];

          setOrder({
            ...ord,
            itemPrice: ord.itemPrice || ord.totalAmount,
            timeline: formattedTimeline,
            shippingCourier: ord.shippingCourier || "JNE REG",
            buyerAddress: ord.address
              ? `${ord.address.recipientName} (${ord.address.city}, ${ord.address.province}) — ${ord.address.street}`
              : "Alamat Penerima",
            inspectionDeadline: ord.inspectionDeadline || "2 × 24 Jam sejak paket diterima",
            trackingNumber: ord.trackingNumber || "HGO-JNE-88291039",
            paymentMethod: ord.paymentMethod || "BCA Virtual Account",
            product: ord.product || {
              name: "Peripheral Gaming Hingo",
              subtitle: "Unit titip jual terverifikasi",
              images: ["/images/placeholder.png"],
            },
          });
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const copyTracking = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  const handleConfirm = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.id || order.orderCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_RECEIVED" }),
      });
      if (res.ok) {
        setOrder((prev: any) => ({
          ...prev,
          orderStatus: "COMPLETED",
          timeline: prev.timeline.map((t: any) => ({ ...t, status: "completed" })),
        }));
        showToast("Terima kasih! Pesanan telah selesai dan dana diteruskan ke pemilik gear.");
      } else {
        alert("Gagal mengonfirmasi pesanan");
      }
    } catch (e) {
      alert("Terjadi kesalahan saat mengonfirmasi pesanan");
    }
  };

  const submitIssue = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!order || !issueText.trim()) return;
    try {
      const res = await fetch(`/api/orders/${order.id || order.orderCode}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCategory: "FUNCTION_DEFECT",
          description: issueText.trim(),
        }),
      });
      if (res.ok) {
        setOrder((prev: any) => ({
          ...prev,
          orderStatus: "COMPLAINT",
        }));
        setShowIssueModal(false);
        showToast("Laporan kendala telah dibuat. CS Mira akan segera membalasmu di Pusat Bantuan.");
      } else {
        alert("Gagal mengirim laporan kendala");
      }
    } catch (e) {
      alert("Terjadi kesalahan pengiriman laporan");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
        <p className="text-sm font-semibold text-neutral-500">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Pesanan Tidak Ditemukan</h2>
        <p className="text-sm text-neutral-500 max-w-md">
          Pesanan dengan kode <span className="font-mono font-bold text-neutral-700">{orderId}</span> tidak ditemukan atau kamu belum memiliki transaksi ini.
        </p>
        <Link
          href="/orders"
          className="rounded-xl bg-[#1A1A1A] text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 transition"
        >
          Kembali ke Daftar Transaksi
        </Link>
      </div>
    );
  }

  const isCompleted = order.orderStatus === "COMPLETED";
  const isWaitingPayment = order.orderStatus === "WAITING_PAYMENT";
  const isDisputed =
    order.orderStatus === "COMPLAINT" ||
    order.orderStatus === "ISSUE_REPORTED" ||
    order.escrowStatus === "DISPUTED";

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-4 py-3 sm:py-6 md:py-10 pb-16 md:pb-10">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4 sm:mb-6">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
          TRANSAKSI / DETAIL PESANAN
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-[#1A1A1A]">
              {isCompleted
                ? "Transaksi selesai. Terima kasih!"
                : isWaitingPayment
                ? "Menunggu Pembayaran"
                : isDisputed
                ? "Kendala dilaporkan ke Tim CS Hingo."
                : "Barang tiba. Cek dulu, ya."}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              {order.orderCode} · Dibuat {order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Hari ini"}
            </p>
          </div>

          <StatusBadge
            label={
              isCompleted
                ? "Transaksi Selesai"
                : isWaitingPayment
                ? "Menunggu Pembayaran"
                : isDisputed
                ? "Kendala Ditinjau CS"
                : "Paket Tiba — Menunggu Konfirmasi"
            }
            variant={isCompleted ? "verified" : isWaitingPayment ? "warning" : isDisputed ? "warning" : "warning"}
          />
        </div>
      </div>

      {/* Escrow Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FFE58A] p-4 sm:p-6 mb-4 sm:mb-8 flex items-start gap-3 sm:gap-4 shadow-xs">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFC629] text-black">
          {isWaitingPayment ? <Clock className="h-5 w-5 sm:h-6 sm:w-6" /> : <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />}
        </div>
        <div className="flex-1 text-xs sm:text-sm text-neutral-800 leading-relaxed">
          <strong className="text-black text-xs sm:text-sm font-bold block mb-0.5">
            {isCompleted
              ? "Dana telah diteruskan ke pemilik barang"
              : isWaitingPayment
              ? "Menunggu Pembayaran Pembeli"
              : isDisputed
              ? "Dana dibekukan sementara di rekening bersama Hingo"
              : "Dana masih ditahan Hingo — Keamananmu Terjamin"}
          </strong>
          {isCompleted
            ? `Pembayaran ${formatRupiah(order.totalAmount)} telah diteruskan ke pemilik barang setelah konfirmasimu.`
            : isWaitingPayment
            ? `Total tagihan ${formatRupiah(order.totalAmount)}. Selesaikan pembayaran untuk memproses pengiriman gear oleh kurator Hingo.`
            : isDisputed
            ? `Dana ${formatRupiah(order.totalAmount)} tetap aman di Hingo sampai laporan kendalamu selesai ditangani CS Mira.`
            : `${formatRupiah(order.totalAmount)} sudah dibayar via ${order.paymentMethod || "BCA Virtual Account"}. Dana pemilik barang belum dicairkan sampai kamu menguji switch, tombol, dan koneksi bluetooth. Periksa barang sebelum konfirmasi; laporkan jika ada kendala.`}
        </div>
      </div>

      {isWaitingPayment && (
        <div className="mb-6 rounded-2xl sm:rounded-3xl border border-[#FFC629] bg-[#FFFBEB] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">
              Selesaikan Pembayaran Pesanan Ini
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Klik tombol di samping untuk membuka panduan nomor rekening / QRIS dan melakukan simulasi pembayaran.
            </p>
          </div>
          <Link
            href={`/checkout/payment/${order.orderCode}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] text-black px-5 py-2.5 text-xs font-black shadow-xs transition active:scale-95 shrink-0"
          >
            <span>Bayar / Simulasi Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-3.5 sm:gap-6">
          {/* Card 1: Periksa Sebelum Konfirmasi */}
          {!isCompleted && !isDisputed && (
            <div className="rounded-2xl sm:rounded-3xl border border-[#FFC629] bg-[#FFFBEB]/50 p-4 sm:p-6 shadow-xs flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-900">
                  Periksa sebelum konfirmasi
                </span>
                <span className="rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold border border-amber-300">
                  Menunggu konfirmasi pembeli
                </span>
              </div>

              <div className="rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Batas pemeriksaan otomatis:{" "}
                    <strong className="text-black">{order.inspectionDeadline}</strong>
                  </span>
                </div>
                <span className="text-neutral-400 font-medium hidden sm:inline">
                  (1 × 24 jam tersisa)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FFC629] hover:bg-[#FFC420] py-3 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition active:scale-[0.98] cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Barang sesuai, konfirmasi terima</span>
                </button>
                <Link
                  href={`/orders/${order.orderCode}/dispute`}
                  className="w-full sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3 px-4 text-xs sm:text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition active:scale-[0.98]"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Ada kendala? Laporkan masalah</span>
                </Link>
              </div>
            </div>
          )}

          {/* Card 2: Perjalanan Transaksi Timeline */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            <h2 className="text-base font-black text-[#1A1A1A]">
              Perjalanan transaksi
            </h2>

            <div className="relative flex flex-col gap-6 pl-6 sm:pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
              {order.timeline?.map((step: any) => {
                const isStepCompleted = step.status === "completed";
                const isStepCurrent = step.status === "current";

                return (
                  <div key={step.step} className="relative flex flex-col gap-1">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isStepCompleted
                          ? "bg-emerald-500 text-white"
                          : isStepCurrent
                          ? "bg-[#FFC629] text-black ring-4 ring-[#FFC629]/20"
                          : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {isStepCompleted ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        step.step
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-[#1A1A1A]">
                        {step.title}
                      </h4>
                      <span className="text-xs text-neutral-400 font-medium">
                        {step.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                      {step.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Detail Barang */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] pb-3 border-b border-neutral-100">
              Detail barang
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={order.product?.images?.[0] || "/images/placeholder.png"}
                  alt={order.product?.name || "Product"}
                  className="h-16 w-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    {order.product?.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {order.product?.subtitle}
                  </p>
                  <span className="text-sm font-black text-[#1A1A1A] mt-1 block">
                    {formatRupiah(order.itemPrice)}
                  </span>
                </div>
              </div>

              {/* Tombol Lebar Penuh di Mobile / Tombol Ramping di Desktop */}
              <Link
                href="/chat/product"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl border border-neutral-200 bg-[#F6F6F4] px-4 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-200 transition"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat admin Hingo</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Pengiriman & Alamat */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Pengiriman & kurir
              </h2>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(true)}
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lacak pengiriman</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-neutral-400 block font-medium">Kurir & Nomor Resi</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <strong className="text-sm font-bold text-[#1A1A1A]">
                    {order.shippingCourier} · {order.trackingNumber}
                  </strong>
                  <button
                    type="button"
                    onClick={copyTracking}
                    className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-black bg-neutral-100 px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    {copiedResi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedResi ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block font-medium">Alamat Tujuan</span>
                <p className="text-neutral-800 font-semibold max-w-xs mt-0.5">
                  {order.buyerAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Pembayaran Card */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Status Pembayaran
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-bold text-[#16A34A]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Dana terlindungi
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-2xl font-black text-[#1A1A1A]">
                {formatRupiah(order.totalAmount)}
              </span>
              <span className="text-xs text-neutral-500">
                Metode: {order.paymentMethod}
              </span>
            </div>

            <div className="flex flex-col gap-2 py-2 border-y border-neutral-100 text-xs font-semibold text-neutral-700">
              <div className="flex justify-between">
                <span>Pembayaran pembeli</span>
                <span className="text-[#16A34A]">✓ Lunas</span>
              </div>
              <div className="flex justify-between">
                <span>Hasil titip jual pemilik</span>
                <span className={isCompleted ? "text-[#16A34A]" : "text-amber-700"}>
                  {isCompleted ? "Sudah diteruskan" : "Belum diteruskan"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`Bukti transaksi digital: Pembayaran ${order.paymentMethod} lunas terverifikasi.`)}
              className="text-xs font-bold text-neutral-600 hover:text-black underline text-center cursor-pointer"
            >
              Lihat bukti pembayaran
            </button>
          </div>

          {/* 8. Ringkasan Pembayaran Card sesuai Figma */}
          <div className="rounded-3xl border border-[#E5E5E5] bg-white p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-black text-[#1A1A1A] pb-2 border-b border-neutral-100">
              Ringkasan pembayaran
            </h3>
            <div className="flex flex-col gap-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Harga barang</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(order.itemPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir ({order.shippingCourier})</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(18000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Proteksi pengiriman</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(5000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya layanan escrow</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(2500)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 flex justify-between font-black text-[#1A1A1A] text-sm">
                <span>Total dibayar</span>
                <span>{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 9. Need help card */}
          <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-amber-700" />
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                Barang bermasalah? Kami bantu.
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              CS Mira siap memandu proses retur atau uji ulang bersama tim Hingo.
              Jangan konfirmasi pesanan bila terdapat fungsi yang rusak.
            </p>
            <Link
              href="/chat/support"
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] py-2.5 px-4 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat CS Hingo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Issue Reporting Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1A1A1A]">
                Laporkan Kendala Barang
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="text-xs font-bold text-neutral-400 hover:text-black"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Jelaskan tombol, switch, port, atau kelengkapan yang tidak sesuai dengan
              deskripsi. Tim CS Hingo akan menahan pencairan dan memeriksa laporanmu.
            </p>

            <form onSubmit={submitIssue} className="flex flex-col gap-4">
              <label htmlFor="issueText" className="sr-only">Deskripsi Kendala</label>
              <textarea
                id="issueText"
                name="issueText"
                rows={4}
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
                placeholder="Contoh: Tombol spasi macet atau kabel USB-C tidak ditemukan di dalam box..."
                className="w-full rounded-2xl border border-neutral-300 p-3.5 text-xs font-medium text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                required
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Kirim Laporan ke CS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#1A1A1A]">
                  Pelacakan JNE REG: {order.trackingNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="text-xs font-bold text-neutral-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="border-l-2 border-emerald-500 pl-3">
                <span className="font-bold text-emerald-700">Paket dalam perjalanan / tiba</span>
                <p className="text-neutral-700 font-medium">Tiba di alamat penerima</p>
              </div>
              <div className="border-l-2 border-neutral-300 pl-3">
                <span className="font-bold text-neutral-500">Dalam proses kurir</span>
                <p className="text-neutral-600">Paket sedang diantar kurir ke alamat tujuan</p>
              </div>
              <div className="border-l-2 border-neutral-300 pl-3">
                <span className="font-bold text-neutral-500">Gudang Hingo</span>
                <p className="text-neutral-600">Diserahkan oleh Tim Logistik Gudang Hingo Jakarta Selatan</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTrackingModalOpen(false)}
              className="mt-2 w-full rounded-xl bg-[#F6F6F4] py-2.5 text-xs font-bold text-neutral-800 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
