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
      return NextResponse.json({ items: [] });
    }

    // 1. Ambil dari Supabase cart_items
    try {
      const { data: sbItems, error: sbErr } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!sbErr && sbItems && sbItems.length > 0) {
        const productIds = sbItems.map((i: any) => i.product_id);
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);

        const prodMap = new Map((prods || []).map((p: any) => [p.id, formatProduct(p)]));

        const parsedItems = sbItems
          .map((item: any) => {
            const product = prodMap.get(item.product_id);
            if (!product) return null;
            return {
              id: item.id,
              userId: item.user_id,
              productId: item.product_id,
              quantity: item.quantity || 1,
              selected: item.selected !== false,
              product,
              createdAt: item.created_at,
            };
          })
          .filter(Boolean);

        return NextResponse.json({ items: parsedItems });
      } else if (!sbErr && sbItems && sbItems.length === 0) {
        return NextResponse.json({ items: [] });
      }
    } catch (sbError) {
      console.warn("Supabase cart GET error, falling back to local:", sbError);
    }

    // 2. Fallback Prisma jika Supabase tidak tersedia
    try {
      const userEmailNorm = user.email?.trim()?.toLowerCase();
      const items = await prisma.cartItem.findMany({
        where: {
          OR: [
            ...(userEmailNorm ? [{ userEmail: userEmailNorm }] : []),
            { userId: user.id },
          ],
        },
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
    } catch {
      return NextResponse.json({ items: [] });
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
        { error: "Silakan masuk terlebih dahulu untuk menambah ke keranjang" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Skenario Penggabungan (Merge) dari Keranjang Tamu (localStorage) saat login
    if (Array.isArray(body.mergeItems)) {
      const mergeItems: Array<{ productId: string; quantity?: number }> = body.mergeItems;
      let mergedCount = 0;

      for (const m of mergeItems) {
        if (!m.productId) continue;
        try {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", m.productId)
            .maybeSingle();

          if (!existing) {
            await supabase.from("cart_items").insert({
              id: crypto.randomUUID(),
              user_id: user.id,
              product_id: m.productId,
              quantity: 1, // Preloved stok 1
              selected: true,
            });
            mergedCount++;
          }
        } catch {}
      }

      return NextResponse.json({ success: true, mergedCount });
    }

    const { productId, quantity = 1 } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID diperlukan" }, { status: 400 });
    }

    // Cek ketersediaan produk di Supabase
    let product: any = null;
    try {
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();
      if (p) product = formatProduct(p);
    } catch {}

    if (!product) {
      try {
        const localP = await prisma.product.findUnique({ where: { id: productId } });
        if (localP) {
          product = {
            ...localP,
            images: JSON.parse(localP.images || "[]"),
          };
        }
      } catch {}
    }

    if (!product || product.stock <= 0 || product.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Barang sudah tidak tersedia atau stok habis" },
        { status: 400 }
      );
    }

    // Cek duplikasi di keranjang
    let alreadyInCart = false;
    let existingItem: any = null;

    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        alreadyInCart = true;
        existingItem = {
          id: existing.id,
          userId: existing.user_id,
          productId: existing.product_id,
          quantity: 1,
          selected: existing.selected !== false,
          product,
        };
      }
    } catch {}

    if (!alreadyInCart) {
      try {
        const localExisting = await prisma.cartItem.findFirst({
          where: { userId: user.id, productId },
          include: { product: true },
        });
        if (localExisting) {
          alreadyInCart = true;
          existingItem = {
            ...localExisting,
            product: {
              ...localExisting.product,
              images: JSON.parse(localExisting.product.images || "[]"),
            },
          };
        }
      } catch {}
    }

    if (alreadyInCart) {
      return NextResponse.json({
        success: true,
        alreadyInCart: true,
        item: existingItem,
      });
    }

    // Tambahkan item baru ke Supabase
    const cartItemId = crypto.randomUUID();
    const newItem = {
      id: cartItemId,
      userId: user.id,
      productId,
      quantity: 1, // Preloved hanya tersedia 1
      selected: true,
      product,
    };

    try {
      await supabase.from("cart_items").insert({
        id: cartItemId,
        user_id: user.id,
        product_id: productId,
        quantity: 1,
        selected: true,
      });
    } catch (sbErr) {
      console.warn("Supabase insert cart error:", sbErr);
    }

    // Sinkronkan ke Prisma lokal
    try {
      const userEmailNorm = user.email?.trim()?.toLowerCase();
      await prisma.cartItem.create({
        data: {
          id: cartItemId,
          userId: user.id,
          userEmail: userEmailNorm,
          productId,
          quantity: 1,
          selected: true,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      alreadyInCart: false,
      item: newItem,
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
      try {
        await supabase
          .from("cart_items")
          .update({ selected: Boolean(selectAll) })
          .eq("user_id", user.id);
      } catch {}
      try {
        await prisma.cartItem.updateMany({
          where: { userId: user.id },
          data: { selected: Boolean(selectAll) },
        });
      } catch {}
      return NextResponse.json({ success: true });
    }

    if (id) {
      try {
        await supabase
          .from("cart_items")
          .update({ selected: Boolean(selected) })
          .eq("id", id)
          .eq("user_id", user.id);
      } catch {}
      try {
        await prisma.cartItem.update({
          where: { id },
          data: { selected: Boolean(selected) },
        });
      } catch {}
      return NextResponse.json({ success: true });
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

    try {
      if (id) {
        await supabase.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
      } else if (productId) {
        await supabase.from("cart_items").delete().eq("product_id", productId).eq("user_id", user.id);
      } else if (selectedOnly) {
        await supabase.from("cart_items").delete().eq("user_id", user.id).eq("selected", true);
      } else {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      }
    } catch {}

    try {
      if (id) {
        await prisma.cartItem.deleteMany({ where: { id, userId: user.id } });
      } else if (productId) {
        await prisma.cartItem.deleteMany({ where: { productId, userId: user.id } });
      } else if (selectedOnly) {
        await prisma.cartItem.deleteMany({ where: { userId: user.id, selected: true } });
      } else {
        await prisma.cartItem.deleteMany({ where: { userId: user.id } });
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
