import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, ItemCategory } from "@/types";
import { Search } from "lucide-react";

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Link href="/" className="hover:underline">Beranda</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Katalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Katalog Komponen PC Teruji
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Menampilkan RAM, SSD, dan GPU bergaransi toko 7 hari.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-card border border-gray-200 mb-6 flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Category Tabs - Scrollable on Mobile */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <Link
              href="/katalog"
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
                !category
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Semua
            </Link>
            <Link
              href="/katalog?kategori=RAM"
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
                category === "RAM"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              RAM
            </Link>
            <Link
              href="/katalog?kategori=SSD"
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
                category === "SSD"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              SSD
            </Link>
            <Link
              href="/katalog?kategori=GPU"
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
                category === "GPU"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              GPU
            </Link>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <form action="/katalog" method="GET" className="relative flex-1 md:w-64">
              {category && <input type="hidden" name="kategori" value={category} />}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-gray-500" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Cari model..."
                className="w-full h-9 sm:h-10 pl-8 sm:pl-9 pr-3 bg-white border border-gray-300 rounded-btn text-xs text-ink focus:outline-none focus:border-yellow-500"
              />
            </form>

            {/* Sort Selector */}
            <form action="/katalog" method="GET" className="shrink-0">
              {category && <input type="hidden" name="kategori" value={category} />}
              {query && <input type="hidden" name="q" value={query} />}
              <select
                name="sort"
                defaultValue={sort}
                onChange={(e) => (e.target as HTMLSelectElement).form?.submit()}
                className="h-9 sm:h-10 px-2 sm:px-3 bg-white border border-gray-300 rounded-btn text-xs text-ink font-medium focus:outline-none focus:border-yellow-500"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </form>
          </div>
        </div>

        {/* Product Grid - 2 Columns on Mobile, 4 Columns on Desktop */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-card border border-dashed border-gray-300 space-y-3">
            <p className="text-gray-700 font-semibold text-sm">Tidak ditemukan barang yang sesuai filter.</p>
            <p className="text-xs text-gray-500">Silakan ubah kata kunci pencarian atau pilih kategori lain.</p>
            <Link
              href="/katalog"
              className="inline-block px-4 py-2 bg-yellow-500 text-ink text-xs font-bold rounded-btn mt-2"
            >
              Reset Filter
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
