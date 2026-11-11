import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Sesi login diperlukan." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const isAdmin = user.role === "ADMIN";

    // 1. Single Source of Truth: Supabase orders
    try {
      let sbQuery = supabase
        .from("orders")
        .select("*, product:products(*)")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        sbQuery = sbQuery.eq("buyer_id", user.id);
      }

      if (status && status !== "ALL") {
        if (status === "UNPAID") sbQuery = sbQuery.eq("order_status", "WAITING_PAYMENT");
        else if (status === "SHIPPED") sbQuery = sbQuery.in("order_status", ["PAID_PACKING", "SHIPPED", "DELIVERED_CHECKING"]);
        else if (status === "COMPLETED") sbQuery = sbQuery.eq("order_status", "COMPLETED");
        else if (status === "COMPLAINT") sbQuery = sbQuery.in("order_status", ["COMPLAINT", "ISSUE_REPORTED"]);
      }

      const { data: sbOrders, error: sbErr } = await sbQuery;

      if (!sbErr && sbOrders) {
        let filteredOrders = sbOrders;
        if (search) {
          const lower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(
            (o: any) =>
              o.order_code?.toLowerCase().includes(lower) ||
              o.tracking_number?.toLowerCase().includes(lower) ||
              o.product?.name?.toLowerCase().includes(lower)
          );
        }

        const parsedOrders = filteredOrders.map((o: any) => ({
          id: o.id,
          orderCode: o.order_code,
          buyerId: o.buyer_id,
          productId: o.product_id,
          itemPrice: Number(o.item_price),
          shippingCourier: o.shipping_courier,
          shippingCost: Number(o.shipping_cost),
          shippingProtection: Number(o.shipping_protection),
          serviceFee: Number(o.service_fee),
          totalAmount: Number(o.total_amount),
          paymentMethod: o.payment_method,
          vaNumber: o.va_number,
          buyerNote: o.buyer_note,
          trackingNumber: o.tracking_number,
          escrowStatus: o.escrow_status,
          orderStatus: o.order_status,
          inspectionDeadline: o.inspection_deadline,
          createdAt: o.created_at,
          product: o.product
            ? {
                ...o.product,
                price: Number(o.product.price),
                images: Array.isArray(o.product.images)
                  ? o.product.images
                  : typeof o.product.images === "string"
                  ? JSON.parse(o.product.images || "[]")
                  : [],
              }
            : null,
          timeline: [
            {
              id: "step-1",
              orderId: o.id,
              stepOrder: 1,
              title: "Menunggu pembayaran pembeli",
              description: `Menunggu transfer ${o.payment_method === "QRIS" ? "QRIS" : "BCA Virtual Account"} sebesar Rp${Number(o.total_amount).toLocaleString("id-ID")}.`,
              timestampText: o.order_status === "WAITING_PAYMENT" ? "Menunggu pembayaran" : "Selesai",
              isCompleted: o.order_status !== "WAITING_PAYMENT",
            },
            {
              id: "step-2",
              orderId: o.id,
              stepOrder: 2,
              title: "Pengemasan aman & pengiriman Hingo",
              description: `Gudang Hingo Jakarta Selatan. Resi: ${o.tracking_number}`,
              timestampText: ["SHIPPED", "DELIVERED_CHECKING", "COMPLETED"].includes(o.order_status) ? "Terkirim" : "Menunggu pengiriman",
              isCompleted: ["SHIPPED", "DELIVERED_CHECKING", "COMPLETED"].includes(o.order_status),
            },
            {
              id: "step-3",
              orderId: o.id,
              stepOrder: 3,
              title: "Paket tiba — masa uji 48 jam",
              description: "Uji fungsi tombol, switch, sensor, dan kelengkapan sebelum konfirmasi.",
              timestampText: ["DELIVERED_CHECKING", "COMPLETED"].includes(o.order_status) ? "Siap dicek" : "Belum tiba",
              isCompleted: ["DELIVERED_CHECKING", "COMPLETED"].includes(o.order_status),
            },
            {
              id: "step-4",
              orderId: o.id,
              stepOrder: 4,
              title: "Konfirmasi & pencairan dana",
              description: "Setelah dikonfirmasi sesuai, dana escrow diteruskan ke pemilik gear.",
              timestampText: o.order_status === "COMPLETED" ? "Dana cair" : "Menunggu konfirmasi pembeli",
              isCompleted: o.order_status === "COMPLETED",
            },
          ],
        }));

        return NextResponse.json({ orders: parsedOrders });
      }
    } catch (sbError) {
      console.warn("Supabase orders query error, falling back to local prisma:", sbError);
    }

    // 2. Fallback untuk offline dev jika Supabase gagal
    const where: any = {};
    if (!isAdmin) {
      where.buyerId = user.id;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: true,
        address: true,
        timeline: { orderBy: { stepOrder: "asc" } },
        disputes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let parsedOrders: any[] = orders.map((o) => ({
      ...o,
      product: {
        ...o.product,
        images: JSON.parse(o.product.images || "[]"),
      },
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
