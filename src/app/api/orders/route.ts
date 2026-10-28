import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const isAdmin = user.role === "ADMIN";

    const where: any = {};
    if (!isAdmin) {
      where.buyerId = user.id;
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

    const parsedOrders = orders.map((o) => ({
      ...o,
      product: {
        ...o.product,
        images: JSON.parse(o.product.images || "[]"),
      },
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error: any) {
    console.error("Orders API error:", error.message);
    return NextResponse.json({ orders: [] });
  }
}
