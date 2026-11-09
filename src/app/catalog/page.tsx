"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  ShieldCheck,
  Search,
  Package,
  Plus,
  Loader2,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/lib/data";
import { useHingoStore } from "@/lib/store";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get("cat") || "ALL").toUpperCase();
  const { user } = useHingoStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState({
    KEYBOARD: 0,
    MOUSE: 0,
    HEADSET: 0,
    MONITOR: 0,
    ACCESSORIES: 0,
    TOTAL: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Active filter chips removal
  const [filterChips, setFilterChips] = useState<Array<{ id: string; label: string }>>([]);

  const fetchCatalogProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.categoryCounts) {
          setCategoryCounts(data.categoryCounts);
        }
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error("Error fetching catalog products:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogProducts();
  }, []);

  useEffect(() => {
    if (searchParams.get("cat")) {
      setSelectedCategory((searchParams.get("cat") || "ALL").toUpperCase());
    }
  }, [searchParams]);

  const removeChip = (id: string) => {
    setFilterChips((prev) => prev.filter((c) => c.id !== id));
    if (id === "price") setMaxPrice(5000000);
    if (id === "cond") setSelectedCondition("ALL");
  };

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedCondition("ALL");
    setMinPrice(0);
    setMaxPrice(2000000);
    setSearchQuery("");
    setFilterChips([]);
  };

  // Filtered products purely from DB
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
        if (selectedCondition !== "ALL" && p.condition !== selectedCondition) return false;
        if (p.price < minPrice || p.price > maxPrice) return false;
        if (
          searchQuery &&
          !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // default newest
      });
  }, [products, selectedCategory, selectedCondition, minPrice, maxPrice, sortBy, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-6 md:py-10 pb-20 md:pb-10">
      {/* 0. KOTAK PENCARIAN DI BAWAH HEADER (Mobile < 768px sesuai Figma) */}
      <div className="md:hidden mb-3">
        <label className="block text-[11px] font-bold text-neutral-600 mb-1">
          Cari barang preloved
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Peripheral komputer"
            className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] py-2 pl-9 pr-3 text-xs font-semibold text-[#1A1A1A] outline-none transition focus:border-[#FFC629] focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      {/* 1. TOP BANNER (#FFFBEB) - Kartu putih disembunyikan di mobile */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-4 sm:p-8 md:p-10 mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shadow-xs">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
            KURASI HINGO / PRELOVED PILIHAN
          </span>
          <h1 className="mt-0.5 text-xl sm:text-2xl md:text-4xl font-black text-[#1A1A1A]">
            Upgrade gear, bukan anggaran.
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-neutral-600 max-w-lg leading-relaxed">
            Semua peripheral telah melalui 12 poin inspeksi fungsi, switch, sensor,
            dan kelengkapan original sebelum diterbitkan di katalog.
          </p>
        </div>

        <div className="hidden md:flex rounded-2xl bg-white p-4 border border-[#FDE68A] shadow-xs shrink-0 items-center gap-3 self-start md:self-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1A1A1A] block">
              100% Terverifikasi Teknisi
            </span>
            <span className="text-[11px] text-neutral-500">
              Garansi pengembalian 48 jam jika cacat
            </span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILL TABS (Wrap rapi di mobile sesuai Figma) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        {[
          { label: "Semua gear", value: "ALL", count: categoryCounts.TOTAL },
          { label: "Keyboard", value: "KEYBOARD", count: categoryCounts.KEYBOARD },
          { label: "Mouse", value: "MOUSE", count: categoryCounts.MOUSE },
          { label: "Headset", value: "HEADSET", count: categoryCounts.HEADSET },
          { label: "Monitor", value: "MONITOR", count: categoryCounts.MONITOR },
          { label: "Aksesoris", value: "ACCESSORIES", count: categoryCounts.ACCESSORIES },
        ].map((pill) => (
          <button
            key={pill.value}
            onClick={() => setSelectedCategory(pill.value)}
            className={`whitespace-nowrap rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 ${
              selectedCategory === pill.value
                ? "bg-[#FFC629] text-[#1A1A1A] border border-[#F59E0B]"
                : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <span>{pill.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === pill.value ? "bg-black/10 text-black font-extrabold" : "bg-neutral-200 text-neutral-500"
              }`}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3. MAIN CATALOG GRID WITH SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 rounded-3xl border border-[#E5E5E5] bg-white p-6 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="flex items-center gap-2 text-sm font-black text-[#1A1A1A]">
                <Filter className="h-4 w-4" /> Filter
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Filter 1: Kategori */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Kategori
              </label>
              <div className="flex flex-col gap-2 text-xs font-semibold text-neutral-700">
                {[
                  { label: "Semua peripheral", value: "ALL", count: categoryCounts.TOTAL },
                  { label: "Keyboard", value: "KEYBOARD", count: categoryCounts.KEYBOARD },
                  { label: "Mouse", value: "MOUSE", count: categoryCounts.MOUSE },
                  { label: "Headset", value: "HEADSET", count: categoryCounts.HEADSET },
                  { label: "Monitor", value: "MONITOR", count: categoryCounts.MONITOR },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center justify-between cursor-pointer hover:text-black py-0.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="catRadio"
                        checked={selectedCategory === item.value}
                        onChange={() => setSelectedCategory(item.value)}
                        className="accent-[#FFC629] h-4 w-4 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">({item.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 2: Kondisi Barang */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Kondisi Barang
              </label>
              <div className="flex flex-wrap gap-2">
                {["ALL", "Sangat baik", "Baik"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCondition(c)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selectedCondition === c
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F6F6F4] text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {c === "ALL" ? "Semua kondisi" : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Rentang Harga */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Rentang Harga (Rp)
              </label>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold">Harga Minimum</span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 font-semibold">Harga Maksimum</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-[#1A1A1A]"
                  />
                </div>
              </div>
            </div>

            {/* Filter 4: Asal Pengiriman */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Asal Pengiriman
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 bg-[#F6F6F4] p-2.5 rounded-xl border border-neutral-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Jakarta Selatan (Gudang Hingo)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-9 flex flex-col gap-4 md:gap-5">
          {/* Header row with count & sort (Desktop) */}
          <div className="hidden sm:flex sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A]">
                Peripheral preloved
              </h2>
              <p className="text-xs text-neutral-500">
                {filteredProducts.length} barang ditemukan di Jakarta Selatan
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer"
              >
                <option value="newest">Urutkan: Terbaru ↓</option>
                <option value="price_asc">Harga: Terendah ke Tertinggi</option>
                <option value="price_desc">Harga: Tertinggi ke Terendah</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Bar Pill Filter & Urutkan Horizontal Mobile (< 768px sesuai Figma) */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {/* Filter · 3 Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#FFC629] px-3.5 py-1.5 font-black text-[#1A1A1A] border border-amber-400 shrink-0 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter · 3</span>
            </button>

            {/* Quick Sort / Filter Dropdowns / Pills */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-800 shrink-0 outline-none cursor-pointer"
            >
              <option value="newest">Terbaru ↓</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
            </select>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-700 shrink-0 cursor-pointer"
            >
              Lokasi ↓
            </button>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-700 shrink-0 cursor-pointer"
            >
              Harga ↓
            </button>
          </div>

          {/* Baris Chip Filter Aktif yang Bisa Dihapus (Sesuai Figma) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-neutral-200 px-2.5 py-1 font-semibold text-neutral-700 shadow-2xs">
              Kondisi: Baik+
              <button
                type="button"
                onClick={() => setSelectedCondition("ALL")}
                className="hover:text-black font-bold ml-0.5"
              >
                ×
              </button>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-neutral-200 px-2.5 py-1 font-semibold text-neutral-700 shadow-2xs">
              ≤ Rp2 juta
              <button
                type="button"
                onClick={() => setMaxPrice(5000000)}
                className="hover:text-black font-bold ml-0.5"
              >
                ×
              </button>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-neutral-200 px-2.5 py-1 font-semibold text-neutral-700 shadow-2xs">
              Jakarta Selatan
              <button
                type="button"
                onClick={() => {}}
                className="hover:text-black font-bold ml-0.5"
              >
                ×
              </button>
            </span>
            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-1 font-bold text-amber-900">
                {selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className="hover:text-black font-bold ml-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
              <p className="text-xs font-bold text-neutral-500">Memuat katalog peripheral...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Products Grid: 2 kolom rapat di mobile (gap-2.5), 3 kolom di desktop */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Clean Empty State as required by prompt */
            <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-[#FFC629] text-[#1A1A1A] flex items-center justify-center shadow-xs">
                <Package className="h-8 w-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                  Belum ada barang titipan di katalog
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                  Semua barang di katalog Hingo berasal dari pengajuan titip jual yang telah lolos inspeksi tim kami.
                </p>
              </div>
              <Link
                href={user ? "/seller/consignments/new" : "/auth/login?callbackUrl=/seller/consignments/new"}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>+ Ajukan titip jual sekarang</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden">
          <div className="w-full rounded-t-3xl bg-white p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black text-[#1A1A1A]">Filter Produk</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    { label: "Semua", value: "ALL" },
                    { label: "Keyboard", value: "KEYBOARD" },
                    { label: "Mouse", value: "MOUSE" },
                    { label: "Headset", value: "HEADSET" },
                    { label: "Monitor", value: "MONITOR" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(item.value);
                        setMobileFilterOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        selectedCategory === item.value
                          ? "border-[#FFC629] bg-[#FFFBEB] font-bold text-[#1A1A1A]"
                          : "border-neutral-200 text-neutral-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

