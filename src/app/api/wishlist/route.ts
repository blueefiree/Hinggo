import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlists: [], wishlistIds: [] });
    }

    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const wishlists = await prisma.wishlist.findMany({
      where: {
        OR: [
          ...(userEmailNorm ? [{ userEmail: userEmailNorm }] : []),
          { userId: user.id },
        ],
      },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    const parsed = wishlists.map((w) => ({
      ...w,
      product: {
        ...w.product,
        images: JSON.parse(w.product.images || "[]"),
      },
    }));

    const wishlistIds = wishlists.map((w) => w.productId);

    return NextResponse.json({ wishlists: parsed, wishlistIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const userEmailNorm = user.email?.trim()?.toLowerCase();

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId: user.id, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      try {
        await supabase.from("wishlists").delete().match({ user_id: user.id, product_id: productId });
      } catch {}
      const count = await prisma.wishlist.count({ where: { userId: user.id } });
      return NextResponse.json({ isWishlisted: false, count });
    }

    await prisma.wishlist.create({
      data: {
        userId: user.id,
        userEmail: userEmailNorm,
        productId,
      },
    });

    try {
      await supabase.from("wishlists").insert({
        user_id: user.id,
        user_email: userEmailNorm,
        product_id: productId,
      });
    } catch {}

    const count = await prisma.wishlist.count({ where: { userId: user.id } });

    return NextResponse.json({ isWishlisted: true, count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
