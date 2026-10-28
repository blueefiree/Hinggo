import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedItems = items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        images: JSON.parse(item.product.images || "[]"),
      },
    }));

    return NextResponse.json({ items: parsedItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu untuk menambah ke keranjang" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock <= 0 || product.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Barang sudah tidak tersedia atau stok habis" },
        { status: 400 }
      );
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: user.id, productId },
      include: { product: true },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyInCart: true,
        item: {
          ...existing,
          product: {
            ...existing.product,
            images: JSON.parse(existing.product.images || "[]"),
          },
        },
      });
    }

    const created = await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId,
        quantity: 1,
        selected: true,
      },
      include: {
        product: true,
      },
    });

    // Sinkronkan ke Supabase
    try {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
        selected: true,
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      alreadyInCart: false,
      item: {
        ...created,
        product: {
          ...created.product,
          images: JSON.parse(created.product.images || "[]"),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, selected, selectAll } = await req.json();

    if (selectAll !== undefined) {
      await prisma.cartItem.updateMany({
        where: { userId: user.id },
        data: { selected: !!selectAll },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      const updated = await prisma.cartItem.update({
        where: { id },
        data: {
          ...(selected !== undefined ? { selected: !!selected } : {}),
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ error: "Parameter id atau selectAll diperlukan" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const productId = searchParams.get("productId");
    const selectedOnly = searchParams.get("selectedOnly") === "true";

    if (id) {
      await prisma.cartItem.deleteMany({
        where: { id, userId: user.id },
      });
    } else if (productId) {
      await prisma.cartItem.deleteMany({
        where: { productId, userId: user.id },
      });
    } else if (selectedOnly) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id, selected: true },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
    }

    // Sync delete to Supabase
    try {
      if (productId) {
        await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      }
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
