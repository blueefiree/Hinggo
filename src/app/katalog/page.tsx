import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, ItemCategory } from "@/types";
import { Filter, Search } from "lucide-react";

export const revalidate = 0;

interface CatalogProps {
  searchParams: {
    q?: string;
    kategori?: ItemCategory;
    sort?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const query = searchParams.q || "";
  const category = searchParams.kategori;
  const sort = searchParams.sort || "newest";

  let dbQuery = supabaseAdmin
    .from("items")
    .select("*")
    .eq("status", "Tayang");

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  if (query) {
    dbQuery = dbQuery.or(`model.ilike.%${query}%,brand.ilike.%${query}%`);
  }

  if (sort === "price_asc") {
    dbQuery = dbQuery.order("current_listing_price", { ascending: true });
  } else if (sort === "price_desc") {
    dbQuery = dbQuery.order("current_listing_price", { ascending: false });
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  const { data: listedItems } = await dbQuery;
  const items: Item[] = (listedItems as Item[]) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Katalog Produk</span>
          </div>
          <h1 className="text-3xl font-extrabold text-ink">
            Katalog Komponen PC Teruji
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan seluruh komponen RAM, SSD, dan GPU bergaransi 7 hari toko.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-gray-50 p-4 rounded-card border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Link
              href="/katalog"
              className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
                !category
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Semua Kategori
            </Link>
            <Link
              href="/katalog?kategori=RAM"
              className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
                category === "RAM"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              RAM
            </Link>
            <Link
              href="/katalog?kategori=SSD"
              className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
                category === "SSD"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              SSD
            </Link>
            <Link
              href="/katalog?kategori=GPU"
              className={`px-4 py-2 rounded-btn text-xs font-bold transition-all ${
                category === "GPU"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              GPU
            </Link>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
            <form action="/katalog" method="GET" className="relative flex-1 sm:w-64">
              {category && <input type="hidden" name="kategori" value={category} />}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Cari model atau brand..."
                className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-btn text-xs text-ink focus:outline-none focus:border-yellow-500"
              />
            </form>

            {/* Sort Selector */}
            <form action="/katalog" method="GET">
              {category && <input type="hidden" name="kategori" value={category} />}
              {query && <input type="hidden" name="q" value={query} />}
              <select
                name="sort"
                defaultValue={sort}
                // @ts-ignore
                onChange={(e) => e.target.form?.submit()}
                className="h-10 px-3 bg-white border border-gray-300 rounded-btn text-xs text-ink font-medium focus:outline-none focus:border-yellow-500"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </form>
          </div>
        </div>

        {/* Product Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-card border border-dashed border-gray-300 space-y-3">
            <p className="text-gray-700 font-semibold">Tidak ditemukan barang yang sesuai filter.</p>
            <p className="text-xs text-gray-500">Silakan ubah kata kunci pencarian atau pilih kategori lain.</p>
            <Link
              href="/katalog"
              className="inline-block px-4 py-2 bg-yellow-500 text-ink text-xs font-bold rounded-btn mt-2"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
