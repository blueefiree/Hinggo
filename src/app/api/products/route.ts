import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || searchParams.get("q");
    const condition = searchParams.get("condition");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const all = searchParams.get("all") === "true";

    // 1. Coba ambil dari Supabase public.products jika tersedia
    let supabaseProducts: any[] = [];
    let supabaseCounts: any = null;
    try {
      let sbQuery = supabase.from("products").select("*");
      if (!all) {
        sbQuery = sbQuery.eq("status", "AVAILABLE");
      }
      if (category && category !== "ALL") {
        sbQuery = sbQuery.ilike("category", category);
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
      if (search) {
        sbQuery = sbQuery.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (sort === "price_asc") {
        sbQuery = sbQuery.order("price", { ascending: true });
      } else if (sort === "price_desc") {
        sbQuery = sbQuery.order("price", { ascending: false });
      } else if (sort === "popular") {
        sbQuery = sbQuery.order("sold_count", { ascending: false });
      } else {
        sbQuery = sbQuery.order("created_at", { ascending: false });
      }

      const { data, error } = await sbQuery;
      if (!error && data && data.length > 0) {
        supabaseProducts = data.map((item: any) => ({
          id: item.id,
          code: item.code,
          slug: item.slug,
          brand: item.brand,
          name: item.name,
          subtitle: item.subtitle,
          category: item.category,
          condition: item.condition,
          usageDuration: item.usage_duration,
          switchOrVariant: item.switch_or_variant,
          completeness: item.completeness,
          description: item.description,
          defectNotes: item.defect_notes,
          price: Number(item.price),
          originalNewPrice: Number(item.original_new_price || 0),
          stock: item.stock || 1,
          location: item.location || "Jakarta Selatan",
          rating: Number(item.rating || 5.0),
          soldCount: item.sold_count || 0,
          isVerifiedByTeam: Boolean(item.is_verified_by_team),
          images: Array.isArray(item.images) ? item.images : JSON.parse(item.images || "[]"),
          status: item.status || "AVAILABLE",
          createdAt: item.created_at,
        }));

        // Hitung count kategori dari Supabase
        const { data: allCatData } = await supabase.from("products").select("category").eq("status", "AVAILABLE");
        if (allCatData) {
          supabaseCounts = {
            KEYBOARD: allCatData.filter((i) => i.category?.toUpperCase() === "KEYBOARD").length,
            MOUSE: allCatData.filter((i) => i.category?.toUpperCase() === "MOUSE").length,
            HEADSET: allCatData.filter((i) => i.category?.toUpperCase() === "HEADSET").length,
            MONITOR: allCatData.filter((i) => i.category?.toUpperCase() === "MONITOR").length,
            ACCESSORIES: allCatData.filter((i) => i.category?.toUpperCase() === "ACCESSORIES").length,
            TOTAL: allCatData.length,
          };
        }
      }
    } catch (e) {
      // safe fallback
    }

    // 2. Query Prisma lokal (hanya jika supabase kosong)
    const where: any = {};
    if (!all) {
      where.status = "AVAILABLE";
    }

    if (category && category !== "ALL") {
      where.category = { equals: category.toUpperCase() };
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

    let prismaProducts: any[] = [];
    let keyboardCount = 0;
    let mouseCount = 0;
    let headsetCount = 0;
    let monitorCount = 0;
    let accessoriesCount = 0;
    let totalCount = 0;

    if (supabaseProducts.length === 0) {
      try {
        const [pProducts, kCount, mCount, hCount, monCount, aCount, tCount] = await Promise.all([
          prisma.product.findMany({ where, orderBy }),
          prisma.product.count({ where: { category: "KEYBOARD", status: "AVAILABLE" } }),
          prisma.product.count({ where: { category: "MOUSE", status: "AVAILABLE" } }),
          prisma.product.count({ where: { category: "HEADSET", status: "AVAILABLE" } }),
          prisma.product.count({ where: { category: "MONITOR", status: "AVAILABLE" } }),
          prisma.product.count({ where: { category: "ACCESSORIES", status: "AVAILABLE" } }),
          prisma.product.count({ where: { status: "AVAILABLE" } }),
        ]);
        prismaProducts = pProducts;
        keyboardCount = kCount;
        mouseCount = mCount;
        headsetCount = hCount;
        monitorCount = monCount;
        accessoriesCount = aCount;
        totalCount = tCount;
      } catch (prismaErr) {
        console.warn("Prisma fallback unavailable:", prismaErr);
      }
    }

    // Gunakan supabaseProducts jika tersedia, jika tidak gunakan prismaProducts
    const rawList = supabaseProducts.length > 0 ? supabaseProducts : prismaProducts;

    const parsedProducts = rawList.map((p: any) => {
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

    const categoryCounts = supabaseCounts || {
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
    console.error("Products API GET error:", error.message);
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
      completeness = "Unit lengkap dengan aksesoris",
      description = "",
      defectNotes = "Fungsi normal 100%, fisik terawat.",
      usageDuration = "6 bulan",
      images = [],
      stock = 1,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Nama dan harga produk wajib diisi" }, { status: 400 });
    }

    const numPrice = Math.round(Number(price));
    const numOriginal = originalNewPrice ? Math.round(Number(originalNewPrice)) : Math.round(numPrice * 1.35);

    // Auto-generate code & slug unik anti-bentrok
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `HG-PRD-${randomSuffix}`;
    const cleanBrand = (brand || "CUSTOM").trim().toUpperCase();
    const slugBase = `${cleanBrand.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-+/g, "-");
    const slug = `${slugBase}-${randomSuffix}`;

    const imageArray = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === "string" && images.trim()
      ? [images.trim()]
      : [
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop",
        ];

    // 1. Simpan ke Prisma SQLite lokal
    const newProduct = await prisma.product.create({
      data: {
        code,
        slug,
        sellerId: user?.id || null,
        brand: cleanBrand,
        name: name.trim(),
        subtitle: `${switchOrVariant} · ${condition}`,
        category: category.toUpperCase(),
        condition,
        usageDuration,
        switchOrVariant,
        completeness,
        description: description || `Gear preloved pilihan terverifikasi Hingo. ${name}`,
        defectNotes,
        price: numPrice,
        originalNewPrice: numOriginal,
        stock: Number(stock) || 1,
        location,
        rating: 5.0,
        soldCount: 0,
        isVerifiedByTeam: true,
        images: JSON.stringify(imageArray),
        status: "AVAILABLE",
      },
    });

    // 2. Dual-Write ke Supabase public.products
    try {
      await supabase.from("products").insert({
        id: newProduct.id,
        code,
        slug,
        seller_id: user?.id || null,
        brand: cleanBrand,
        name: name.trim(),
        subtitle: `${switchOrVariant} · ${condition}`,
        category: category.toUpperCase(),
        condition,
        usage_duration: usageDuration,
        switch_or_variant: switchOrVariant,
        completeness,
        description: description || `Gear preloved pilihan terverifikasi Hingo. ${name}`,
        defect_notes: defectNotes,
        price: numPrice,
        original_new_price: numOriginal,
        stock: Number(stock) || 1,
        location,
        rating: 5.0,
        sold_count: 0,
        is_verified_by_team: true,
        images: imageArray,
        status: "AVAILABLE",
      });
    } catch (e) {
      console.warn("Supabase dual-write warning (products table may not exist yet):", e);
    }

    // 3. Revalidasi cache halaman agar detik itu juga muncul di UI
    try {
      revalidatePath("/");
      revalidatePath("/catalog");
      revalidatePath("/admin");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      product: {
        ...newProduct,
        images: imageArray,
      },
      message: `Produk "${name}" berhasil ditambahkan ke katalog!`,
    });
  } catch (error: any) {
    console.error("Create product API error:", error);
    return NextResponse.json({ error: error.message || "Gagal menambahkan produk" }, { status: 500 });
  }
}
