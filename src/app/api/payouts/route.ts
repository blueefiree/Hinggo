import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        payouts: [],
        stats: {
          totalDisbursed: 0,
          totalPending: 0,
        },
      });
    }

    const payouts = await prisma.payout.findMany({
      where: { sellerId: user.id },
      include: {
        consignment: true,
        order: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalDisbursed = payouts
      .filter((p) => p.status === "DISBURSED")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = payouts
      .filter((p) => p.status === "PENDING_ESCROW")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payouts,
      stats: {
        totalDisbursed,
        totalPending,
      },
    });
  } catch (error: any) {
    console.error("Payouts API error:", error);
    return NextResponse.json({
      payouts: [],
      stats: {
        totalDisbursed: 0,
        totalPending: 0,
      },
    });
  }
}
