import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/lib/data";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const condition = searchParams.get("condition");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

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
    if (sort === "cheapest") {
      orderBy = { price: "asc" };
    } else if (sort === "expensive") {
      orderBy = { price: "desc" };
    } else if (sort === "popular") {
      orderBy = { soldCount: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
    }));

    return NextResponse.json({ products: parsedProducts });
  } catch (error: any) {
    console.warn("Products API using data fallback:", error.message);
    return NextResponse.json({ products: PRODUCTS });
  }
}
