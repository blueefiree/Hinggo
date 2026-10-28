import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const { id } = await params;
    const { reasonCategory, description, evidenceUrls = [] } = await req.json();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderCode: id }],
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create dispute
      const dispute = await tx.disputeReport.create({
        data: {
          orderId: order.id,
          buyerId: user.id,
          reasonCategory,
          description,
          evidenceUrls: JSON.stringify(evidenceUrls),
          status: "OPEN",
        },
      });

      // 2. Freeze escrow & update order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: "COMPLAINT",
          escrowStatus: "DISPUTED",
        },
      });

      // 3. Find or create CS thread
      let csThread = await tx.chatThread.findFirst({
        where: { type: "CS_SUPPORT", userId: user.id },
      });

      if (!csThread) {
        csThread = await tx.chatThread.create({
          data: {
            userId: user.id,
            type: "CS_SUPPORT",
            title: "Pusat Bantuan & Komplain Hingo",
            agentName: "Mira · CS Hingo",
            ticketCode: "CS-0842",
            relatedOrderId: order.orderCode,
          },
        });
      }

      // 4. Send automated message to CS thread
      await tx.chatMessage.create({
        data: {
          threadId: csThread.id,
          senderId: user.id,
          senderRole: "USER",
          senderName: user.name,
          content: `[Laporan Kendala Pesanan ${order.orderCode}] Kategori: ${reasonCategory}. Deskripsi: "${description}". Bukti unboxing telah diunggah. Mohon investigasi tim CS Hingo. Dana escrow ditahan.`,
          timeLabel: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          isRead: false,
        },
      });

      return { dispute, order: updatedOrder };
    });

    return NextResponse.json({
      success: true,
      message: "Laporan kendala berhasil disimpan dan dana escrow telah dibekukan",
      data: result,
    });
  } catch (error: any) {
    console.error("Dispute error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
