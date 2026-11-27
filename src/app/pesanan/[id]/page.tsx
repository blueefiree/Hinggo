import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { supabaseAdmin } from "@/lib/supabase";
import { Order, OrderItem } from "@/types";
import { Clock, CheckCircle2, Copy, AlertCircle, ShieldCheck } from "lucide-react";
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white p-6 rounded-card border border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">Nomor Pesanan:</span>
              <span className="font-mono font-bold text-ink text-sm">{order.order_code}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-ink">Detail Pesanan</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Dibuat pada {new Date(order.created_at || "").toLocaleString("id-ID")}
            </p>
          </div>

          <div>
            <StatusBadge status={order.order_status} size="lg" />
          </div>
        </div>

        {/* 24-Hour Hold Banner & Payment Instructions */}
        {isAwaitingPayment && (
          <div className="bg-amber-50 p-6 rounded-card border border-amber-200 mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="size-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-base">
                  Batas Pembayaran: 24 Jam
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  Barang pesanan Anda saat ini dikunci selama 24 jam (hingga{" "}
                  <strong>{new Date(order.hold_expires_at || "").toLocaleString("id-ID")}</strong>).
                  Jika belum mengunggah bukti transfer dalam 24 jam, pesanan akan dibatalkan otomatis dan barang kembali Tayang.
                </p>
              </div>
            </div>

            {/* Rekening Transfer Hinggo */}
            <div className="bg-white p-5 rounded-btn border border-amber-200 space-y-3">
              <p className="text-xs font-semibold text-gray-700">Silakan Transfer Tepat ke Rekening Resmi Hinggo:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block">Bank Tujuan:</span>
                  <strong className="text-ink text-sm">BCA (Bank Central Asia)</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Nomor Rekening:</span>
                  <strong className="text-ink text-sm font-mono">8830-1928-0012</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Atas Nama:</span>
                  <strong className="text-ink text-sm">PT Hinggo Komputer Jaya</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-600">Total Nominal Transfer:</span>
                <span className="text-lg font-black text-yellow-600">
                  Rp {order.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Upload Payment Proof Component */}
            <PaymentProofUploader orderId={order.id} existingProof={order.payment_proof_url} />
          </div>
        )}

        {/* If Paid / Shipped */}
        {isPaid && (
          <div className="bg-emerald-50 p-6 rounded-card border border-emerald-200 mb-6 flex items-start gap-3">
            <CheckCircle2 className="size-6 text-success shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-900 text-base">Pembayaran Berhasil Diverifikasi</h3>
              <p className="text-xs text-emerald-800 mt-1">
                {order.outbound_tracking_number
                  ? `Barang telah dikirim dengan nomor resi: ${order.outbound_tracking_number} (${order.outbound_courier || "Kurir Reguler"})`
                  : "Barang sedang dikemas oleh tim gudang Hinggo untuk segera dikirimkan."}
              </p>
            </div>
          </div>
        )}

        {/* Items in Order */}
        <div className="bg-white p-6 rounded-card border border-gray-200 space-y-4 mb-6">
          <h3 className="font-bold text-base text-ink">Daftar Barang Pesanan</h3>
          <div className="divide-y divide-gray-100">
            {orderItems.map((oi) => (
              <div key={oi.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={oi.item?.photos?.[0] || "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=200&q=80"}
                    alt=""
                    className="size-14 rounded-btn object-cover bg-gray-100"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-yellow-700 uppercase">{oi.item?.category}</span>
                    <h4 className="font-bold text-sm text-ink">{oi.item?.model}</h4>
                    <p className="text-xs text-gray-500">Status Item: {oi.item?.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-ink">
                    Rp {Number(oi.sale_price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown summary */}
          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Harga Barang:</span>
              <span className="font-semibold text-ink">Rp {order.total_items_price.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold text-ink">Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
            </div>
            {order.insurance_cost > 0 && (
              <div className="flex justify-between text-yellow-800">
                <span>Asuransi Dummy:</span>
                <span className="font-semibold">Rp {order.insurance_cost.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-extrabold text-ink">
              <span>Total Pembayaran:</span>
              <span className="text-yellow-600">Rp {order.total_amount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-card border border-gray-200 space-y-2 text-xs">
          <h3 className="font-bold text-sm text-ink mb-2">Tujuan Pengiriman</h3>
          <p className="font-bold text-ink">{order.recipient_name} ({order.recipient_phone})</p>
          <p className="text-gray-600">{order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
