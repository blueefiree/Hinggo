import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Sesi login diperlukan." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 1. Single Source of Truth: Supabase orders
    let order: any = null;
    try {
      const { data: sbOrder, error: sbErr } = await supabase
        .from("orders")
        .select("*, product:products(*)")
        .or(`id.eq.${id},order_code.eq.${id}`)
        .single();

      if (!sbErr && sbOrder) {
        let parsedImages: string[] = [];
        if (sbOrder.product?.images) {
          try {
            parsedImages = typeof sbOrder.product.images === "string"
              ? JSON.parse(sbOrder.product.images)
              : Array.isArray(sbOrder.product.images)
              ? sbOrder.product.images
              : [sbOrder.product.images];
          } catch {
            parsedImages = [];
          }
        }

        order = {
          id: sbOrder.id,
          orderCode: sbOrder.order_code,
          buyerId: sbOrder.buyer_id,
          productId: sbOrder.product_id,
          itemPrice: Number(sbOrder.item_price),
          shippingCourier: sbOrder.shipping_courier,
          shippingCost: Number(sbOrder.shipping_cost),
          shippingProtection: Number(sbOrder.shipping_protection),
          serviceFee: Number(sbOrder.service_fee),
          totalAmount: Number(sbOrder.total_amount),
          paymentMethod: sbOrder.payment_method,
          vaNumber: sbOrder.va_number,
          buyerNote: sbOrder.buyer_note,
          trackingNumber: sbOrder.tracking_number,
          escrowStatus: sbOrder.escrow_status,
          orderStatus: sbOrder.order_status,
          inspectionDeadline: sbOrder.inspection_deadline,
          createdAt: sbOrder.created_at,
          product: sbOrder.product
            ? {
                ...sbOrder.product,
                price: Number(sbOrder.product.price),
                images: parsedImages,
              }
            : null,
          address: {
            recipientName: user.name,
            phone: user.phone || "081234567890",
            fullAddress: "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan",
            city: "Jakarta Selatan",
            postalCode: "12190",
          },
          timeline: [
            {
              id: "step-1",
              orderId: sbOrder.id,
              stepOrder: 1,
              title: "Pembayaran diterima lunas",
              description: `Pembayaran Rp${Number(sbOrder.total_amount).toLocaleString("id-ID")} terverifikasi otomatis. Dana disimpan aman di Rekening Bersama Hingo.`,
              timestampText: sbOrder.order_status === "WAITING_PAYMENT" ? "Menunggu pembayaran" : "Selesai",
              isCompleted: sbOrder.order_status !== "WAITING_PAYMENT",
            },
            {
              id: "step-2",
              orderId: sbOrder.id,
              stepOrder: 2,
              title: "Barang dikemas dan dikirim Hingo",
              description: `Dikemas double bubble wrap. Resi: ${sbOrder.tracking_number}`,
              timestampText: ["SHIPPED", "DELIVERED_CHECKING", "COMPLETED"].includes(sbOrder.order_status) ? "Siap kirim" : "Menunggu pengiriman",
              isCompleted: ["SHIPPED", "DELIVERED_CHECKING", "COMPLETED"].includes(sbOrder.order_status),
            },
            {
              id: "step-3",
              orderId: sbOrder.id,
              stepOrder: 3,
              title: "Paket tiba — waktunya cek barang",
              description: "Paket tiba di tujuan. Dana aman di rekening bersama selama masa uji 48 jam.",
              timestampText: ["DELIVERED_CHECKING", "COMPLETED"].includes(sbOrder.order_status) ? "Siap diperiksa" : "Belum tiba",
              isCompleted: ["DELIVERED_CHECKING", "COMPLETED"].includes(sbOrder.order_status),
            },
            {
              id: "step-4",
              orderId: sbOrder.id,
              stepOrder: 4,
              title: "Konfirmasi & pencairan dana",
              description: "Tekan konfirmasi terima setelah gear berfungsi normal.",
              timestampText: sbOrder.order_status === "COMPLETED" ? "Dana diteruskan" : "Menunggu konfirmasi pembeli",
              isCompleted: sbOrder.order_status === "COMPLETED",
            },
          ],
          disputes: [],
        };
      }
    } catch (e) {
      console.warn("Supabase single order fetch error:", e);
    }

    // Fallback: Prisma lokal
    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderCode: id }],
        },
        include: {
          product: true,
          address: true,
          timeline: { orderBy: { stepOrder: "asc" } },
          disputes: true,
        },
      });

      if (order?.product?.images) {
        try {
          order.product.images = JSON.parse(order.product.images || "[]");
        } catch {}
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Verifikasi otorisasi kepemilikan pesanan
    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const isOwner =
      order.buyerId === user.id ||
      (userEmailNorm && order.buyerEmail?.toLowerCase() === userEmailNorm);
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Anda tidak memiliki akses ke pesanan ini." },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Sesi login diperlukan." },
        { status: 401 }
      );
    }
    const { id } = await params;
    const { action, trackingNumber } = await req.json();

    // 1. Single Source of Truth: Supabase orders
    let order: any = null;
    const { data: sbOrder } = await supabase
      .from("orders")
      .select("*, product:products(*)")
      .or(`id.eq.${id},order_code.eq.${id}`)
      .single();

    if (sbOrder) {
      order = {
        id: sbOrder.id,
        orderCode: sbOrder.order_code,
        buyerId: sbOrder.buyer_id,
        productId: sbOrder.product_id,
        totalAmount: Number(sbOrder.total_amount),
        trackingNumber: sbOrder.tracking_number,
        product: sbOrder.product,
      };
    } else {
      order = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderCode: id }] },
        include: { product: true },
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // Verifikasi otorisasi kepemilikan pesanan
    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const isOwner =
      order.buyerId === user.id ||
      (userEmailNorm && order.buyerEmail?.toLowerCase() === userEmailNorm);
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Anda tidak memiliki akses ke pesanan ini." },
        { status: 403 }
      );
    }

    if (action === "SIMULATE_PAYMENT") {
      // Update di Supabase
      const { data: updatedSb } = await supabase
        .from("orders")
        .update({
          order_status: "DELIVERED_CHECKING",
          escrow_status: "HELD_BY_HINGO",
        })
        .eq("id", order.id)
        .select()
        .single();

      // Sinkronisasi Prisma lokal
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "DELIVERED_CHECKING",
            escrowStatus: "HELD_BY_HINGO",
          },
        });
      } catch {}

      return NextResponse.json({ success: true, order: updatedSb || order });
    }

    if (action === "CONFIRM_RECEIVED") {
      // Update di Supabase
      const { data: updatedSb } = await supabase
        .from("orders")
        .update({
          order_status: "COMPLETED",
          escrow_status: "RELEASED_TO_SELLER",
        })
        .eq("id", order.id)
        .select()
        .single();

      // Sinkronisasi Prisma lokal
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "COMPLETED",
            escrowStatus: "RELEASED_TO_SELLER",
          },
        });
      } catch {}

      return NextResponse.json({ success: true, order: updatedSb || order });
    }

    if (action === "UPDATE_TRACKING" && trackingNumber) {
      const { data: updatedSb } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingNumber,
          order_status: "SHIPPED",
        })
        .eq("id", order.id)
        .select()
        .single();

      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            trackingNumber,
            orderStatus: "SHIPPED",
          },
        });
      } catch {}

      return NextResponse.json({ success: true, order: updatedSb || order });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
