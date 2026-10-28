import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu untuk menyimpan ke wishlist" },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: user.id, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      const count = await prisma.wishlist.count({ where: { userId: user.id } });
      return NextResponse.json({ success: true, isWishlisted: false, count, productId });
    }

    await prisma.wishlist.create({
      data: { userId: user.id, productId },
    });
    const count = await prisma.wishlist.count({ where: { userId: user.id } });

    return NextResponse.json({ success: true, isWishlisted: true, count, productId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

