import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }, { code: slug }],
      },
    });

    if (!product) {
      // Coba cek di Supabase
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .or(`slug.eq.${slug},id.eq.${slug},code.eq.${slug}`)
          .single();

        if (data) {
          return NextResponse.json({
            product: {
              ...data,
              images: Array.isArray(data.images) ? data.images : JSON.parse(data.images || "[]"),
            },
          });
        }
      } catch (e) {}

      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(product.images || "[]");
    } catch {
      parsedImages = product.images ? [product.images] : [];
    }

    return NextResponse.json({
      product: {
        ...product,
        images: parsedImages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }, { code: slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.brand !== undefined) updateData.brand = body.brand.trim().toUpperCase();
    if (body.category !== undefined) updateData.category = body.category.toUpperCase();
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.price !== undefined) updateData.price = Math.round(Number(body.price));
    if (body.originalNewPrice !== undefined) updateData.originalNewPrice = Math.round(Number(body.originalNewPrice));
    if (body.switchOrVariant !== undefined) updateData.switchOrVariant = body.switchOrVariant;
    if (body.completeness !== undefined) updateData.completeness = body.completeness;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.defectNotes !== undefined) updateData.defectNotes = body.defectNotes;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.stock !== undefined) updateData.stock = Number(body.stock);

    if (body.name || body.switchOrVariant || body.condition) {
      const v = body.switchOrVariant || existing.switchOrVariant;
      const c = body.condition || existing.condition;
      updateData.subtitle = `${v} · ${c}`;
    }

    if (body.images !== undefined) {
      const imageArray = Array.isArray(body.images)
        ? body.images.filter(Boolean)
        : typeof body.images === "string" && body.images.trim()
        ? [body.images.trim()]
        : [];
      updateData.images = JSON.stringify(imageArray);
    }

    // 1. Update di Prisma SQLite lokal
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
    });

    // 2. Dual-Update ke Supabase public.products
    try {
      const sbUpdate: any = {};
      if (updateData.name) sbUpdate.name = updateData.name;
      if (updateData.brand) sbUpdate.brand = updateData.brand;
      if (updateData.category) sbUpdate.category = updateData.category;
      if (updateData.condition) sbUpdate.condition = updateData.condition;
      if (updateData.price) sbUpdate.price = updateData.price;
      if (updateData.originalNewPrice !== undefined) sbUpdate.original_new_price = updateData.originalNewPrice;
      if (updateData.switchOrVariant) sbUpdate.switch_or_variant = updateData.switchOrVariant;
      if (updateData.completeness) sbUpdate.completeness = updateData.completeness;
      if (updateData.description) sbUpdate.description = updateData.description;
      if (updateData.defectNotes) sbUpdate.defect_notes = updateData.defectNotes;
      if (updateData.location) sbUpdate.location = updateData.location;
      if (updateData.status) sbUpdate.status = updateData.status;
      if (updateData.stock !== undefined) sbUpdate.stock = updateData.stock;
      if (updateData.subtitle) sbUpdate.subtitle = updateData.subtitle;
      if (body.images !== undefined) {
        sbUpdate.images = Array.isArray(body.images) ? body.images : JSON.parse(updateData.images);
      }

      await supabase
        .from("products")
        .update(sbUpdate)
        .or(`id.eq.${existing.id},slug.eq.${existing.slug}`);
    } catch (e) {
      console.warn("Supabase update warning:", e);
    }

    // 3. Revalidasi cache
    try {
      revalidatePath("/");
      revalidatePath("/catalog");
      revalidatePath("/admin");
      revalidatePath(`/product/${existing.slug}`);
    } catch (e) {}

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(updated.images || "[]");
    } catch {
      parsedImages = updated.images ? [updated.images] : [];
    }

    return NextResponse.json({
      success: true,
      product: {
        ...updated,
        images: parsedImages,
      },
      message: "Data produk berhasil diperbarui!",
    });
  } catch (error: any) {
    console.error("Update product API error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengedit produk" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }, { code: slug }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // 1. Hapus di Prisma SQLite lokal
    await prisma.product.delete({
      where: { id: existing.id },
    });

    // 2. Dual-Delete di Supabase
    try {
      await supabase
        .from("products")
        .delete()
        .or(`id.eq.${existing.id},slug.eq.${existing.slug}`);
    } catch (e) {
      console.warn("Supabase delete warning:", e);
    }

    // 3. Revalidasi cache
    try {
      revalidatePath("/");
      revalidatePath("/catalog");
      revalidatePath("/admin");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Produk "${existing.name}" berhasil dihapus dari katalog.`,
    });
  } catch (error: any) {
    console.error("Delete product API error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus produk" }, { status: 500 });
  }
}
