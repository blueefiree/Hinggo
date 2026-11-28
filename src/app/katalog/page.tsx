import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, ItemCategory } from "@/types";
import { Search, ShieldCheck } from "lucide-react";

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6 sm:py-8 flex-1 w-full">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-1">
              <Link href="/" className="hover:underline">Beranda</Link>
              <span>/</span>
              <span className="text-ink font-semibold">Katalog</span>
              {category && (
                <>
                  <span>/</span>
                  <span className="text-yellow-600 font-semibold">{category}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              Katalog Komponen PC Teruji
            </h1>
            <p className="text-xs sm:text-sm text-[#8a8a8a] mt-0.5">
              Menampilkan {items.length} hardware PC siap kirim bergaransi toko 7 hari.
            </p>
          </div>

          {/* Trust Banner on top right — Figma style */}
          <div className="hidden sm:flex items-center gap-2.5 p-3 rounded-[12px] bg-[#fffbeb] border border-[#ffe58a] text-xs text-[#4b4b4b] shrink-0">
            <ShieldCheck className="size-5 text-[#1f9d55] shrink-0" />
            <div>
              <p className="font-bold text-ink">100% Teruji Fisik</p>
              <p className="text-[11px] text-[#8a8a8a]">Lolos tes stres beban & garansi 7 hari</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#f6f6f4] p-3 sm:p-4 rounded-[16px] border border-[#ebebeb] mb-8 flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Category Tabs - Scrollable on Mobile */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <Link
              href="/katalog"
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
                !category
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-[#4b4b4b] hover:bg-gray-100 border border-[#ebebeb]"
              }`}
            >
              Semua
            </Link>
            <Link
              href="/katalog?kategori=RAM"
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
                category === "RAM"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-[#4b4b4b] hover:bg-gray-100 border border-[#ebebeb]"
              }`}
            >
              RAM DDR4/5
            </Link>
            <Link
              href="/katalog?kategori=SSD"
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
                category === "SSD"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-[#4b4b4b] hover:bg-gray-100 border border-[#ebebeb]"
              }`}
            >
              SSD NVMe
            </Link>
            <Link
              href="/katalog?kategori=GPU"
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
                category === "GPU"
                  ? "bg-yellow-500 text-ink shadow-xs"
                  : "bg-white text-[#4b4b4b] hover:bg-gray-100 border border-[#ebebeb]"
              }`}
            >
              VGA / GPU
            </Link>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <form action="/katalog" method="GET" className="relative flex-1 md:w-72">
              {category && <input type="hidden" name="kategori" value={category} />}
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Cari merek, model..."
                className="w-full h-10 pl-9 pr-3 bg-white border border-[#ebebeb] rounded-[12px] text-xs text-ink placeholder-[#8a8a8a] focus:outline-none focus:border-yellow-500"
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
                className="h-10 px-3 bg-white border border-[#ebebeb] rounded-[12px] text-xs text-ink font-medium focus:outline-none focus:border-yellow-500"
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
          <div className="text-center py-16 bg-[#f6f6f4] rounded-[16px] border border-dashed border-[#ebebeb] space-y-3">
            <p className="text-ink font-semibold text-sm">Tidak ditemukan barang yang sesuai filter.</p>
            <p className="text-xs text-[#8a8a8a]">Silakan ubah kata kunci pencarian atau pilih kategori lain.</p>
            <Link
              href="/katalog"
              className="inline-block px-5 py-2.5 bg-yellow-500 text-ink text-xs font-bold rounded-[12px] mt-2 shadow-xs hover:bg-yellow-600"
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
