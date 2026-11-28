import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/types";
import { Clock, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import PaymentProofUploader from "./PaymentProofUploader";

export const revalidate = 0;

interface OrderDetailProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const orderId = params.id;

  const { data: orderData, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !orderData) {
    notFound();
  }

  const order: Order = orderData as Order;

  // Fetch order items with item details
  const { data: orderItemsData } = await supabaseAdmin
    .from("order_items")
    .select("*, item:items(*)")
    .eq("order_id", orderId);

  const orderItems: OrderItem[] = (orderItemsData as OrderItem[]) || [];

  const isAwaitingPayment = order.order_status === "Ditahan menunggu pembayaran";
  const isPaid = ["Dibayar, dikemas", "Dikirim ke pembeli", "Diterima pembeli", "Selesai"].includes(order.order_status);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-6">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <Link href="/pesanan" className="hover:underline">Pesanan Saya</Link>
          <span>/</span>
          <span className="text-ink font-semibold">{order.order_code}</span>
        </div>

        {/* Header */}
        <div className="bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#8a8a8a]">Nomor Pesanan:</span>
              <span className="font-mono font-bold text-ink text-sm sm:text-base">{order.order_code}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Detail Transaksi</h1>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              Dibuat pada {new Date(order.created_at || "").toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <StatusBadge status={order.order_status} size="lg" />
          </div>
        </div>

        {/* 24-Hour Hold Banner & Payment Instructions */}
        {isAwaitingPayment && (
          <div className="bg-[#fffbeb] p-6 rounded-[20px] border border-[#ffe58a] mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="size-6 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-ink text-base">
                  Batas Pembayaran: 24 Jam
                </h3>
                <p className="text-xs text-[#4b4b4b] leading-relaxed mt-1">
                  Barang pesanan Anda saat ini dikunci selama 24 jam (hingga{" "}
                  <strong>{new Date(order.hold_expires_at || "").toLocaleString("id-ID")}</strong>).
                  Jika belum mengunggah bukti transfer dalam 24 jam, pesanan akan dibatalkan otomatis dan barang kembali Tayang.
                </p>
              </div>
            </div>

            {/* Rekening Transfer Hinggo */}
            <div className="bg-white p-5 rounded-[12px] border border-[#ffe58a] space-y-3">
              <p className="text-xs font-bold text-ink">Silakan Transfer Tepat ke Rekening Resmi Hinggo:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#8a8a8a] block">Bank Tujuan:</span>
                  <strong className="text-ink text-sm">BCA (Bank Central Asia)</strong>
                </div>
                <div>
                  <span className="text-[#8a8a8a] block">Nomor Rekening:</span>
                  <strong className="text-ink text-sm font-mono">8830-1928-0012</strong>
                </div>
                <div>
                  <span className="text-[#8a8a8a] block">Atas Nama:</span>
                  <strong className="text-ink text-sm">PT Hinggo Komputer Jaya</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-[#ebebeb] flex justify-between items-center text-xs">
                <span className="text-[#4b4b4b]">Jumlah yang Harus Ditransfer:</span>
                <span className="text-base font-extrabold text-yellow-600">
                  Rp {Number(order.total_amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Upload Proof Component */}
            <PaymentProofUploader orderId={order.id} existingProof={order.payment_proof_url} />
          </div>
        )}

        {/* If paid banner */}
        {isPaid && (
          <div className="bg-[#e6f6ec] p-5 rounded-[16px] border border-emerald-200 mb-6 flex items-center gap-3 text-xs text-[#1f9d55]">
            <CheckCircle2 className="size-5 shrink-0" />
            <div>
              <strong className="text-sm font-bold block">Pembayaran Terverifikasi</strong>
              Pesanan Anda sedang diproses dan dikemas dengan bubble wrap tebal untuk pengiriman aman.
            </div>
          </div>
        )}

        {/* Order Details & Summary Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-ink pb-3 border-b border-[#ebebeb]">
              Daftar Barang ({orderItems.length})
            </h3>

            <div className="space-y-4">
              {orderItems.map((oi) => (
                <div key={oi.id} className="p-4 rounded-[12px] bg-[#f6f6f4] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={oi.item?.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=150&q=80"}
                      alt=""
                      className="size-16 rounded-[10px] object-cover bg-[#fffbeb] border border-[#ebebeb] shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider block">
                        {oi.item?.brand}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-ink truncate mt-0.5">
                        {oi.item?.model}
                      </h4>
                      <p className="text-xs font-extrabold text-ink mt-1">
                        Rp {Number(oi.sale_price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-[#1f9d55] bg-white px-2 py-1 rounded-full border border-emerald-200 inline-block">
                      {oi.item?.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="pt-4 border-t border-[#ebebeb] space-y-1.5 text-xs">
              <span className="font-bold text-ink block">Alamat Tujuan Pengiriman:</span>
              <p className="text-[#4b4b4b] leading-relaxed">
                <strong>{order.recipient_name}</strong> ({order.recipient_phone})<br />
                {order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}
              </p>
            </div>
          </div>

          {/* Payment Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
            <h3 className="font-bold text-base text-ink pb-3 border-b border-[#ebebeb]">
              Rincian Pembayaran
            </h3>

            <div className="space-y-3 text-xs text-[#4b4b4b]">
              <div className="flex justify-between">
                <span>Subtotal Barang:</span>
                <span className="font-semibold text-ink">
                  Rp {Number(order.total_items_price).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim Flat:</span>
                <span className="font-semibold text-ink">
                  Rp {Number(order.shipping_cost).toLocaleString("id-ID")}
                </span>
              </div>
              {order.insurance_cost > 0 && (
                <div className="flex justify-between text-yellow-800">
                  <span>Asuransi Pengiriman:</span>
                  <span className="font-semibold">
                    Rp {Number(order.insurance_cost).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-[#ebebeb] text-sm font-extrabold text-ink">
                <span>Total Ditransfer:</span>
                <span className="text-yellow-600 text-lg">
                  Rp {Number(order.total_amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-[#f6f6f4] border border-[#ebebeb] space-y-2 text-xs text-[#4b4b4b]">
              <div className="flex items-center gap-2 text-ink font-bold">
                <Lock className="size-4 text-yellow-600" />
                <span>Garansi Rekber Hinggo</span>
              </div>
              <p className="text-[11px] text-[#8a8a8a] leading-relaxed">
                Uang Anda aman bersama Hinggo sampai barang tiba dan melewati garansi toko 7 hari tanpa komplain.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
