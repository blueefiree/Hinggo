import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

    let isWishlisted = false;

    // Supabase
    try {
      const { data: existing } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase.from("wishlists").delete().eq("id", existing.id);
        isWishlisted = false;
      } else {
        await supabase.from("wishlists").insert({
          id: crypto.randomUUID(),
          user_id: user.id,
          product_id: productId,
        });
        isWishlisted = true;
      }
    } catch (e) {
      console.warn("Supabase toggle wishlist error:", e);
    }

    // Prisma fallback sync
    try {
      const existing = await prisma.wishlist.findUnique({
        where: {
          userId_productId: { userId: user.id, productId },
        },
      });

      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
      } else {
        await prisma.wishlist.create({
          data: { userId: user.id, productId },
        });
      }
    } catch {}

    return NextResponse.json({ success: true, isWishlisted, productId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
