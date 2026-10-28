import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const condition = searchParams.get("condition");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // 1. Coba ambil dari Supabase public.products
    let supabaseProducts: any[] = [];
    try {
      let sbQuery = supabase.from("products").select("*").eq("status", "AVAILABLE");
      if (category && category !== "ALL") {
        sbQuery = sbQuery.eq("category", category.toUpperCase());
      }
      if (condition && condition !== "ALL") {
        sbQuery = sbQuery.eq("condition", condition);
      }
      if (minPrice) {
        sbQuery = sbQuery.gte("price", parseInt(minPrice, 10));
      }
      if (maxPrice) {
        sbQuery = sbQuery.lte("price", parseInt(maxPrice, 10));
      }
      const { data, error } = await sbQuery;
      if (!error && data && data.length > 0) {
        supabaseProducts = data;
      }
    } catch (e) {
      // ignore
    }

    // 2. Query Prisma lokal
    const where: any = {
      status: "AVAILABLE",
    };

    if (category && category !== "ALL") {
      where.category = category.toUpperCase();
    }

    if (condition && condition !== "ALL") {
      where.condition = condition;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice, 10);
      if (maxPrice) where.price.lte = parseInt(maxPrice, 10);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "popular") {
      orderBy = { soldCount: "desc" };
    }

    const [prismaProducts, keyboardCount, mouseCount, headsetCount, monitorCount, accessoriesCount, totalCount] =
      await Promise.all([
        prisma.product.findMany({ where, orderBy }),
        prisma.product.count({ where: { category: "KEYBOARD", status: "AVAILABLE" } }),
        prisma.product.count({ where: { category: "MOUSE", status: "AVAILABLE" } }),
        prisma.product.count({ where: { category: "HEADSET", status: "AVAILABLE" } }),
        prisma.product.count({ where: { category: "MONITOR", status: "AVAILABLE" } }),
        prisma.product.count({ where: { category: "ACCESSORIES", status: "AVAILABLE" } }),
        prisma.product.count({ where: { status: "AVAILABLE" } }),
      ]);

    const activeList = supabaseProducts.length > 0 ? supabaseProducts : prismaProducts;

    const parsedProducts = activeList.map((p) => {
      let parsedImages: string[] = [];
      if (Array.isArray(p.images)) {
        parsedImages = p.images;
      } else {
        try {
          parsedImages = JSON.parse(p.images || "[]");
        } catch {
          parsedImages = p.images ? [p.images] : [];
        }
      }
      return {
        ...p,
        images: parsedImages,
      };
    });

    const categoryCounts = {
      KEYBOARD: keyboardCount,
      MOUSE: mouseCount,
      HEADSET: headsetCount,
      MONITOR: monitorCount,
      ACCESSORIES: accessoriesCount,
      TOTAL: totalCount,
    };

    return NextResponse.json({
      products: parsedProducts,
      categoryCounts,
      total: parsedProducts.length,
    });
  } catch (error: any) {
    console.error("Products API error:", error.message);
    return NextResponse.json({
      products: [],
      categoryCounts: {
        KEYBOARD: 0,
        MOUSE: 0,
        HEADSET: 0,
        MONITOR: 0,
        ACCESSORIES: 0,
        TOTAL: 0,
      },
      total: 0,
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      brand,
      category = "KEYBOARD",
      condition = "Sangat baik",
      price,
      originalNewPrice,
      location = "Jakarta Selatan",
      switchOrVariant = "Standar",
      completeness = "Unit lengkap",
      description = "",
      defectNotes = "Fungsi normal 100%, mulus terawat.",
      usageDuration = "6 bulan",
      images = [],
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nama dan harga produk wajib diisi" }, { status: 400 });
    }

    const numPrice = Number(price);
    const numOriginal = originalNewPrice ? Number(originalNewPrice) : Math.round(numPrice * 1.4);
    const code = `HG-${Date.now().toString().slice(-4)}`;
    const baseSlug = `${brand ? brand.toLowerCase() + "-" : ""}${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const imageArray = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === "string" && images.trim()
      ? [images.trim()]
      : [
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop",
        ];

    // 1. Simpan ke Prisma lokal
    const newProduct = await prisma.product.create({
      data: {
        code,
        slug,
        sellerId: user.id,
        brand: brand ? brand.toUpperCase() : "CUSTOM",
        name,
        subtitle: `${switchOrVariant} · ${condition}`,
        category: category.toUpperCase(),
        condition,
        usageDuration,
        switchOrVariant,
        completeness,
        description: description || `Gear titip jual terverifikasi Hingo. ${name}`,
        defectNotes,
        price: numPrice,
        originalNewPrice: numOriginal,
        stock: 1,
        location,
        rating: 5.0,
        soldCount: 0,
        isVerifiedByTeam: true,
        images: JSON.stringify(imageArray),
        status: "AVAILABLE",
      },
    });

    // 2. Simpan ke Supabase public.products
    try {
      await supabase.from("products").insert({
        code,
        slug,
        brand: brand ? brand.toUpperCase() : "CUSTOM",
        name,
        subtitle: `${switchOrVariant} · ${condition}`,
        category: category.toUpperCase(),
        condition,
        usage_duration: usageDuration,
        switch_or_variant: switchOrVariant,
        completeness,
        description: description || `Gear titip jual terverifikasi Hingo. ${name}`,
        defect_notes: defectNotes,
        price: numPrice,
        original_new_price: numOriginal,
        stock: 1,
        location,
        rating: 5.0,
        sold_count: 0,
        is_verified_by_team: true,
        images: imageArray,
        status: "AVAILABLE",
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        images: imageArray,
      },
      message: "Produk berhasil ditambahkan ke katalog!",
    });
  } catch (error: any) {
    console.error("Create product API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
