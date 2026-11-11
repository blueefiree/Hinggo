import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

function formatProduct(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    code: item.code,
    slug: item.slug,
    brand: item.brand,
    name: item.name,
    subtitle: item.subtitle,
    category: item.category,
    condition: item.condition,
    usageDuration: item.usage_duration || item.usageDuration,
    switchOrVariant: item.switch_or_variant || item.switchOrVariant,
    completeness: item.completeness,
    description: item.description,
    defectNotes: item.defect_notes || item.defectNotes,
    price: Number(item.price),
    originalNewPrice: Number(item.original_new_price || item.originalNewPrice || 0),
    stock: item.stock || 1,
    location: item.location || "Jakarta Selatan",
    rating: Number(item.rating || 5.0),
    soldCount: item.sold_count || item.soldCount || 0,
    isVerifiedByTeam: Boolean(item.is_verified_by_team ?? item.isVerifiedByTeam),
    images: Array.isArray(item.images)
      ? item.images
      : typeof item.images === "string"
      ? JSON.parse(item.images || "[]")
      : [],
    status: item.status || "AVAILABLE",
    createdAt: item.created_at || item.createdAt,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlists: [], wishlistIds: [] });
    }

    // 1. Coba ambil dari Supabase wishlists
    try {
      const { data: sbWishlists, error: sbErr } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!sbErr && sbWishlists && sbWishlists.length > 0) {
        const productIds = sbWishlists.map((w: any) => w.product_id);
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        const prodMap = new Map((prods || []).map((p: any) => [p.id, formatProduct(p)]));

        const parsedWishlists = sbWishlists
          .map((w: any) => {
            const product = prodMap.get(w.product_id);
            if (!product) return null;
            return {
              id: w.id,
              userId: w.user_id,
              productId: w.product_id,
              product,
              createdAt: w.created_at,
            };
          })
          .filter(Boolean);

        return NextResponse.json({
          wishlists: parsedWishlists,
          wishlistIds: productIds,
        });
      } else if (!sbErr && sbWishlists && sbWishlists.length === 0) {
        return NextResponse.json({ wishlists: [], wishlistIds: [] });
      }
    } catch (e) {
      console.warn("Supabase wishlist GET error, falling back to local:", e);
    }

    // 2. Fallback Prisma lokal
    try {
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
    } catch {
      return NextResponse.json({ wishlists: [], wishlistIds: [] });
    }
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

    const body = await req.json();

    // Skenario Penggabungan (Merge) Wishlist dari Tamu (localStorage) saat login
    if (Array.isArray(body.mergeProductIds)) {
      const mergeProductIds: string[] = body.mergeProductIds;
      let mergedCount = 0;

      for (const pId of mergeProductIds) {
        if (!pId) continue;
        try {
          const { data: existing } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", pId)
            .maybeSingle();

          if (!existing) {
            await supabase.from("wishlists").insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              product_id: pId,
            });
            mergedCount++;
          }
        } catch {}
      }

      return NextResponse.json({ success: true, mergedCount });
    }

    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID diperlukan" }, { status: 400 });
    }

    // Cek di Supabase
    let isWishlisted = false;
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
      console.warn("Supabase wishlist toggle error:", e);
    }

    // Sinkronkan ke Prisma
    try {
      const existingPrisma = await prisma.wishlist.findUnique({
        where: {
          userId_productId: { userId: user.id, productId },
        },
      });

      if (existingPrisma) {
        await prisma.wishlist.delete({ where: { id: existingPrisma.id } });
      } else {
        const userEmailNorm = user.email?.trim()?.toLowerCase();
        await prisma.wishlist.create({
          data: { userId: user.id, userEmail: userEmailNorm, productId },
        });
      }
    } catch {}

    return NextResponse.json({ isWishlisted, productId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
