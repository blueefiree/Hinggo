import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kycDocs = await prisma.kycDocument.findMany({
      include: { user: true },
      orderBy: { uploadedAt: "desc" },
    });

    const consignments = await prisma.consignmentItem.findMany({
      include: {
        seller: true,
        timeline: { orderBy: { stepOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const orders = await prisma.order.findMany({
      include: {
        buyer: true,
        product: true,
        address: true,
        timeline: { orderBy: { stepOrder: "asc" } },
        disputes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      kycDocs,
      consignments: consignments.map((c) => ({
        ...c,
        photos: JSON.parse(c.photos || "[]"),
      })),
      orders: orders.map((o) => ({
        ...o,
        product: {
          ...o.product,
          images: JSON.parse(o.product.images || "[]"),
        },
      })),
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "APPROVE_KYC") {
      const { userId, status, rejectionReason } = body;
      await prisma.$transaction(async (tx) => {
        await tx.kycDocument.update({
          where: { userId },
          data: {
            status,
            rejectionReason: status === "REJECTED" ? rejectionReason || "Foto kurang jelas" : null,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { kycStatus: status },
        });
      });

      return NextResponse.json({ success: true, message: `Status KYC diubah menjadi ${status}` });
    }

    if (action === "SUBMIT_INSPECTION") {
      const {
        code,
        specs,
        functionTest,
        conditionAndDefect,
        completenessReceived,
        proposedPrice,
      } = body;

      const feePercent = 8;
      const feeAmount = Math.round(proposedPrice * (feePercent / 100));
      const handlingFee = 19000;
      const netPayout = proposedPrice - feeAmount - handlingFee;

      const updated = await prisma.$transaction(async (tx) => {
        const item = await tx.consignmentItem.update({
          where: { code },
          data: {
            stage: "INSPECTION_COMPLETED",
            actionActor: "SELLER",
            badgeLabel: "Tinjau hasil inspeksi",
            statusSummary: `Inspeksi fisik selesai, usulan harga Rp${proposedPrice.toLocaleString("id-ID")}`,
            proposedPrice,
            consignmentFeeAmount: feeAmount,
            estimatedNetPayout: netPayout,
            inspectionSpecs: specs,
            inspectionFunctionTest: functionTest,
            inspectionConditionDefect: conditionAndDefect,
            inspectionCompleteness: completenessReceived,
            inspectedAt: new Date(),
          },
        });

        await tx.consignmentTimeline.create({
          data: {
            consignmentId: item.id,
            stepOrder: 3,
            title: "Inspeksi fisik & tes fungsi tuntas",
            description: `Uji fungsi switch/sensor 100% normal. Usulan harga: Rp${proposedPrice.toLocaleString("id-ID")}.`,
            timestampText: "Baru saja oleh Inspector Hingo",
            state: "COMPLETED",
          },
        });

        return item;
      });

      return NextResponse.json({ success: true, consignment: updated });
    }

    if (action === "RELEASE_ESCROW") {
      const { orderId } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
        include: { product: true },
      });

      if (!ord) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: ord.id },
          data: {
            escrowStatus: "RELEASED_TO_SELLER",
            orderStatus: "COMPLETED",
          },
        });

        const sellerId = ord.product.sellerId || ord.buyerId;
        await tx.payout.create({
          data: {
            sellerId,
            orderId: ord.id,
            amount: ord.itemPrice - 95000,
            bankName: "BCA",
            accountNumber: "1234567890",
            status: "DISBURSED",
            transferProofUrl: `BCA-HG-${Date.now().toString().slice(-8)}`,
            disbursedAt: new Date(),
          },
        });
      });

      return NextResponse.json({ success: true, message: "Escrow berhasil dicairkan ke penjual" });
    }

    if (action === "UPDATE_ORDER_TRACKING") {
      const { orderId, trackingNumber, orderStatus = "SHIPPED" } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
      });

      if (!ord) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      await prisma.order.update({
        where: { id: ord.id },
        data: {
          trackingNumber,
          orderStatus,
        },
      });

      return NextResponse.json({ success: true, message: "Nomor resi berhasil diperbarui" });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
