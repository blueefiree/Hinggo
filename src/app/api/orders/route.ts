import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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
    const userEmailNorm = user.email?.trim()?.toLowerCase();

    const where: any = {};
    if (!isAdmin) {
      where.OR = [
        ...(userEmailNorm ? [{ buyerEmail: userEmailNorm }] : []),
        { buyerId: user.id },
      ];
    }

    if (status && status !== "ALL") {
      if (status === "UNPAID") where.orderStatus = "UNPAID";
      else if (status === "SHIPPED") where.orderStatus = { in: ["PAID_PACKING", "SHIPPED", "DELIVERED_CHECKING"] };
      else if (status === "COMPLETED") where.orderStatus = "COMPLETED";
      else if (status === "COMPLAINT") where.orderStatus = { in: ["COMPLAINT", "ISSUE_REPORTED"] };
    }

    if (search) {
      where.OR = [
        { orderCode: { contains: search } },
        { trackingNumber: { contains: search } },
        { product: { name: { contains: search } } },
      ];
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

    // Fallback: Jika di Prisma kosong, ambil dari Supabase
    if (parsedOrders.length === 0) {
      try {
        let sbQuery = supabase.from("orders").select("*, product:products(*)");
        if (!isAdmin) {
          if (userEmailNorm) {
            sbQuery = sbQuery.or(`buyer_email.eq.${userEmailNorm},buyer_id.eq.${user.id}`);
          } else {
            sbQuery = sbQuery.eq("buyer_id", user.id);
          }
        }
        const { data: sbOrders } = await sbQuery.order("created_at", { ascending: false });
        if (sbOrders && sbOrders.length > 0) {
          parsedOrders = sbOrders.map((o: any) => ({
            id: o.id,
            orderCode: o.order_code,
            buyerId: o.buyer_id,
            buyerEmail: o.buyer_email,
            productId: o.product_id,
            itemPrice: o.item_price,
            shippingCourier: o.shipping_courier,
            shippingCost: o.shipping_cost,
            shippingProtection: o.shipping_protection,
            serviceFee: o.service_fee,
            totalAmount: o.total_amount,
            paymentMethod: o.payment_method,
            trackingNumber: o.tracking_number,
            escrowStatus: o.escrow_status,
            orderStatus: o.order_status,
            createdAt: o.created_at,
            product: o.product
              ? {
                  ...o.product,
                  images: Array.isArray(o.product.images)
                    ? o.product.images
                    : JSON.parse(o.product.images || "[]"),
                }
              : null,
            timeline: [],
            disputes: [],
          }));
        }
      } catch (err) {}
    }

    return NextResponse.json({ orders: parsedOrders });
  } catch (error: any) {
    console.error("Orders API error:", error.message);
    return NextResponse.json({ orders: [] });
  }
}
