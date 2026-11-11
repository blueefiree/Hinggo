import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let order: any = await prisma.order.findFirst({
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

    if (!order) {
      try {
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
            buyerEmail: sbOrder.buyer_email,
            productId: sbOrder.product_id,
            itemPrice: sbOrder.item_price,
            shippingCourier: sbOrder.shipping_courier,
            shippingCost: sbOrder.shipping_cost,
            shippingProtection: sbOrder.shipping_protection,
            serviceFee: sbOrder.service_fee,
            totalAmount: sbOrder.total_amount,
            paymentMethod: sbOrder.payment_method,
            trackingNumber: sbOrder.tracking_number,
            escrowStatus: sbOrder.escrow_status,
            orderStatus: sbOrder.order_status,
            createdAt: sbOrder.created_at,
            product: sbOrder.product,
            address: null,
            timeline: [],
            disputes: [],
          };
        }
      } catch {}
    }

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    let parsedImages: string[] = [];
    if (order.product?.images) {
      try {
        parsedImages = JSON.parse(order.product.images || "[]");
      } catch {
        parsedImages = Array.isArray(order.product.images)
          ? order.product.images
          : [order.product.images];
      }
    }

    return NextResponse.json({
      order: {
        ...order,
        product: order.product
          ? {
              ...order.product,
              images: parsedImages,
            }
          : null,
      },
    });
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
    const { id } = await params;
    const { action, trackingNumber } = await req.json();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderCode: id }],
      },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (action === "SIMULATE_PAYMENT") {
      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "DELIVERED_CHECKING",
            escrowStatus: "HELD_BY_HINGO",
          },
        });

        await tx.product.update({
          where: { id: order.productId },
          data: { status: "SOLD" },
        });

        // Update timeline step 1 to completed
        await tx.orderTimeline.deleteMany({ where: { orderId: order.id } });

        await tx.orderTimeline.createMany({
          data: [
            {
              orderId: order.id,
              stepOrder: 1,
              title: "Pembayaran diterima lunas",
              description: `Pembayaran Rp${order.totalAmount.toLocaleString("id-ID")} terverifikasi otomatis. Dana disimpan aman di Rekening Bersama Hingo.`,
              timestampText: "Baru saja",
              isCompleted: true,
            },
            {
              orderId: order.id,
              stepOrder: 2,
              title: "Barang dikemas dan dikirim Hingo",
              description: `Dikemas double bubble wrap. Resi: ${order.trackingNumber}.`,
              timestampText: "Hari ini · Siap kirim",
              isCompleted: true,
            },
            {
              orderId: order.id,
              stepOrder: 3,
              title: "Paket tiba — waktunya cek barang",
              description: "Paket tiba di tujuan. Dana aman di rekening bersama selama masa uji 48 jam.",
              timestampText: "Sekarang · Siap diperiksa",
              isCompleted: false,
            },
            {
              orderId: order.id,
              stepOrder: 4,
              title: "Konfirmasi & pencairan dana",
              description: "Tekan konfirmasi terima setelah gear berfungsi normal.",
              timestampText: "Menunggu konfirmasi pembeli",
              isCompleted: false,
            },
          ],
        });

        return ord;
      });

      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "CONFIRM_RECEIVED") {
      const updated = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: "COMPLETED",
            escrowStatus: "RELEASED_TO_SELLER",
          },
        });

        await tx.orderTimeline.updateMany({
          where: { orderId: order.id },
          data: { isCompleted: true },
        });

        // Create payout if seller exists
        if (order.product.sellerId) {
          await tx.payout.create({
            data: {
              sellerId: order.product.sellerId,
              orderId: order.id,
              amount: order.itemPrice - 95000,
              bankName: "BCA",
              accountNumber: "1234567890",
              status: "DISBURSED",
              transferProofUrl: `BCA-HG-${Date.now().toString().slice(-8)}`,
              disbursedAt: new Date(),
            },
          });
        }

        return ord;
      });

      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "UPDATE_TRACKING" && trackingNumber) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingNumber,
          orderStatus: "SHIPPED",
        },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
