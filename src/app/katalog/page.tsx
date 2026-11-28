import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CatalogSortSelect from "@/components/CatalogSortSelect";
import { supabaseAdmin } from "@/lib/supabase";
import { Item, ItemCategory } from "@/types";
import { Search, ShieldCheck, Filter, RotateCcw, CheckCircle2 } from "lucide-react";

export const revalidate = 0;

interface CatalogProps {
  searchParams?: {
    q?: string;
    kategori?: ItemCategory;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const query = searchParams?.q?.trim() || "";
  const category = searchParams?.kategori;
  const sort = searchParams?.sort || "newest";
  const minPrice = searchParams?.minPrice ? parseInt(searchParams.minPrice) : null;
  const maxPrice = searchParams?.maxPrice ? parseInt(searchParams.maxPrice) : null;

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

  if (minPrice !== null && !isNaN(minPrice)) {
    dbQuery = dbQuery.gte("current_listing_price", minPrice);
  }

  if (maxPrice !== null && !isNaN(maxPrice)) {
    dbQuery = dbQuery.lte("current_listing_price", maxPrice);
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-6 sm:py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a] mb-4">
          <Link href="/" className="hover:underline">Beranda</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Katalog dan Pencarian</span>
          {category && (
            <>
              <span>/</span>
              <span className="text-yellow-600 font-semibold">{category}</span>
            </>
          )}
        </div>

        {/* Catalog Introduction — Figma Frame 79:5035 */}
        <div className="bg-[#f6f6f4] rounded-[20px] p-6 sm:p-8 border border-[#ebebeb] mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider block">
              Marketplace Konsinyasi Teruji
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-ink tracking-tight">
              Katalog Komponen PC Teruji
            </h1>
            <p className="text-xs sm:text-sm text-[#4b4b4b] leading-relaxed">
              Jelajahi RAM, SSD, dan GPU bekas terkurasi. Setiap komponen telah lolos uji stres beban penuh oleh tim teknisi kami dan dilindungi garansi toko 7 hari serta rekening bersama resmi.
            </p>
          </div>

          {/* Trust Highlight Box — Figma Frame 79:5040 */}
          <div className="bg-white p-5 rounded-[16px] border border-[#ebebeb] shadow-xs flex items-start gap-4 lg:w-72 shrink-0">
            <div className="size-11 rounded-full bg-[#e6f6ec] text-[#1f9d55] flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <strong className="text-xs sm:text-sm font-bold text-ink block">
                100% Lolos Uji Teknis
              </strong>
              <p className="text-[11px] text-[#8a8a8a] leading-snug">
                Dites MemTest86, CrystalDisk, atau FurMark sebelum tayang.
              </p>
            </div>
          </div>
        </div>

        {/* Category Shortcuts — Figma Frame 79:5045 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          <Link
            href="/katalog"
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
              !category
                ? "bg-yellow-500 text-ink shadow-xs"
                : "bg-[#f6f6f4] text-[#4b4b4b] hover:bg-gray-200 border border-[#ebebeb]"
            }`}
          >
            Semua Kategori
          </Link>
          <Link
            href="/katalog?kategori=RAM"
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
              category === "RAM"
                ? "bg-yellow-500 text-ink shadow-xs"
                : "bg-[#f6f6f4] text-[#4b4b4b] hover:bg-gray-200 border border-[#ebebeb]"
            }`}
          >
            RAM DDR4 & DDR5
          </Link>
          <Link
            href="/katalog?kategori=SSD"
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
              category === "SSD"
                ? "bg-yellow-500 text-ink shadow-xs"
                : "bg-[#f6f6f4] text-[#4b4b4b] hover:bg-gray-200 border border-[#ebebeb]"
            }`}
          >
            SSD NVMe & SATA
          </Link>
          <Link
            href="/katalog?kategori=GPU"
            className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all shrink-0 ${
              category === "GPU"
                ? "bg-yellow-500 text-ink shadow-xs"
                : "bg-[#f6f6f4] text-[#4b4b4b] hover:bg-gray-200 border border-[#ebebeb]"
            }`}
          >
            VGA / GPU Card
          </Link>
        </div>

        {/* Search Results Layout — Figma Frame 79:5052 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Search Filters — Figma Frame 79:5053 */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebebeb]">
              <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                <Filter className="size-4 text-yellow-600" />
                Filter Pencarian
              </span>
              <Link
                href="/katalog"
                className="text-[11px] font-semibold text-[#8a8a8a] hover:text-ink flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="size-3" />
                Reset
              </Link>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#8a8a8a] block">
                Kategori Hardware
              </span>
              <div className="space-y-2 text-xs">
                <Link
                  href={query ? `/katalog?q=${encodeURIComponent(query)}` : "/katalog"}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-[8px] transition-colors ${
                    !category ? "bg-[#fffbeb] text-yellow-900 font-bold" : "text-[#4b4b4b] hover:bg-gray-100"
                  }`}
                >
                  <span>Semua Kategori</span>
                  {!category && <CheckCircle2 className="size-3.5 text-yellow-600" />}
                </Link>
                <Link
                  href={`/katalog?kategori=RAM${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-[8px] transition-colors ${
                    category === "RAM" ? "bg-[#fffbeb] text-yellow-900 font-bold" : "text-[#4b4b4b] hover:bg-gray-100"
                  }`}
                >
                  <span>RAM DDR4 & DDR5</span>
                  {category === "RAM" && <CheckCircle2 className="size-3.5 text-yellow-600" />}
                </Link>
                <Link
                  href={`/katalog?kategori=SSD${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-[8px] transition-colors ${
                    category === "SSD" ? "bg-[#fffbeb] text-yellow-900 font-bold" : "text-[#4b4b4b] hover:bg-gray-100"
                  }`}
                >
                  <span>SSD NVMe & SATA</span>
                  {category === "SSD" && <CheckCircle2 className="size-3.5 text-yellow-600" />}
                </Link>
                <Link
                  href={`/katalog?kategori=GPU${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-[8px] transition-colors ${
                    category === "GPU" ? "bg-[#fffbeb] text-yellow-900 font-bold" : "text-[#4b4b4b] hover:bg-gray-100"
                  }`}
                >
                  <span>VGA / GPU Card</span>
                  {category === "GPU" && <CheckCircle2 className="size-3.5 text-yellow-600" />}
                </Link>
              </div>
            </div>

            {/* Price Range Filter Form */}
            <div className="pt-4 border-t border-[#ebebeb] space-y-3">
              <span className="font-bold text-xs uppercase tracking-wider text-[#8a8a8a] block">
                Rentang Harga (Rp)
              </span>
              <form action="/katalog" method="GET" className="space-y-2 text-xs">
                {category && <input type="hidden" name="kategori" value={category} />}
                {query && <input type="hidden" name="q" value={query} />}
                {sort && <input type="hidden" name="sort" value={sort} />}
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Harga Minimum (Rp)"
                  defaultValue={minPrice || ""}
                  className="w-full h-9 px-3 border border-[#ebebeb] rounded-[10px] text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Harga Maksimum (Rp)"
                  defaultValue={maxPrice || ""}
                  className="w-full h-9 px-3 border border-[#ebebeb] rounded-[10px] text-xs text-ink focus:border-yellow-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#f6f6f4] hover:bg-yellow-500 hover:text-ink text-xs font-bold text-ink rounded-[10px] transition-all"
                >
                  Terapkan Filter
                </button>
              </form>
            </div>

            {/* Trust Assurance Badge */}
            <div className="pt-4 border-t border-[#ebebeb] space-y-2">
              <div className="p-3 bg-[#fffbeb] rounded-[12px] border border-[#ffe58a] text-[11px] text-[#4b4b4b] space-y-1">
                <span className="font-bold text-ink block">Garansi Toko 7 Hari</span>
                <p>Retur mudah jika terjadi kendala teknis fungsi hardware.</p>
              </div>
            </div>
          </aside>

          {/* Right Main Column: Search Results — Figma Frame 79:5090 */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search Bar & Sort Dropdown Row */}
            <div className="bg-[#f6f6f4] p-3 sm:p-4 rounded-[16px] border border-[#ebebeb] flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Form */}
              <form action="/katalog" method="GET" className="relative w-full sm:max-w-md">
                {category && <input type="hidden" name="kategori" value={category} />}
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8a8a]" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Cari RAM Corsair, SSD Samsung, GPU ASUS..."
                  className="w-full h-10 pl-10 pr-3.5 bg-white border border-[#ebebeb] rounded-[12px] text-xs text-ink placeholder-[#8a8a8a] focus:outline-none focus:border-yellow-500 shadow-xs"
                />
              </form>

              {/* Sort Selector using Client Component */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-[#8a8a8a] shrink-0 font-medium">Urutkan:</span>
                <CatalogSortSelect currentSort={sort} />
              </div>
            </div>

            {/* Results Header Summary & Applied Filters */}
            <div className="flex items-center justify-between text-xs text-[#8a8a8a] px-1">
              <p>
                Menampilkan <strong className="text-ink font-bold">{items.length}</strong> produk tayang
                {category ? ` dalam kategori ${category}` : ""}
                {query ? ` untuk "${query}"` : ""}
              </p>

              {(category || query || minPrice || maxPrice) && (
                <Link
                  href="/katalog"
                  className="font-bold text-yellow-600 hover:underline"
                >
                  Hapus Semua Filter
                </Link>
              )}
            </div>

            {/* Product Grid — 3 Columns Desktop (width 322px each), 2 Columns Mobile */}
            {items.length === 0 ? (
              <div className="text-center py-16 bg-[#f6f6f4] rounded-[20px] border border-dashed border-[#ebebeb] space-y-4">
                <div className="size-12 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center mx-auto text-[#8a8a8a]">
                  <Search className="size-6" />
                </div>
                <div>
                  <p className="text-ink font-bold text-base">Tidak ada komponen yang sesuai pencarian.</p>
                  <p className="text-xs text-[#8a8a8a] mt-1 max-w-sm mx-auto">
                    Coba ganti kata kunci pencarian atau ubah filter kategori untuk menemukan komponen PC bekas lainnya.
                  </p>
                </div>
                <Link
                  href="/katalog"
                  className="inline-block px-5 py-2.5 bg-yellow-500 text-ink text-xs font-bold rounded-[12px] shadow-sm hover:bg-yellow-600 transition-all"
                >
                  Reset Filter Katalog
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {items.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
