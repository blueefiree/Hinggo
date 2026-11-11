"use client";

import React, { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useHingoStore();

  // Read URL query parameters
  const qParam = searchParams.get("q") || searchParams.get("search") || "";
  const catParam = (searchParams.get("cat") || searchParams.get("category") || "ALL").toUpperCase();
  const condParam = searchParams.get("condition") || searchParams.get("cond") || "ALL";
  const sortParam = searchParams.get("sort") || "newest";
  const minPriceParam = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const maxPriceParam = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 2000000;
  const locParam = searchParams.get("location") || "Jakarta Selatan";

  // State initialized from URL
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [selectedCondition, setSelectedCondition] = useState(condParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [locationFilter, setLocationFilter] = useState(locParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Products and Category counts from Supabase
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

  // Sync state if URL searchParams changes externally (e.g. back/forward button or header search)
  useEffect(() => {
    setSearchQuery(qParam);
    setSelectedCategory(catParam);
    setSelectedCondition(condParam);
    setSortBy(sortParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setLocationFilter(locParam);
  }, [qParam, catParam, condParam, sortParam, minPriceParam, maxPriceParam, locParam]);

  // Update URL parameters whenever filter states change
  const updateUrlParams = useCallback(
    (newFilters: {
      q?: string;
      cat?: string;
      condition?: string;
      sort?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
    }) => {
      const current = new URLSearchParams(searchParams.toString());

      if (newFilters.q !== undefined) {
        if (newFilters.q.trim()) current.set("q", newFilters.q.trim());
        else current.delete("q");
      }
      if (newFilters.cat !== undefined) {
        if (newFilters.cat && newFilters.cat !== "ALL") current.set("cat", newFilters.cat);
        else current.delete("cat");
      }
      if (newFilters.condition !== undefined) {
        if (newFilters.condition && newFilters.condition !== "ALL") current.set("condition", newFilters.condition);
        else current.delete("condition");
      }
      if (newFilters.sort !== undefined) {
        if (newFilters.sort && newFilters.sort !== "newest") current.set("sort", newFilters.sort);
        else current.delete("sort");
      }
      if (newFilters.minPrice !== undefined) {
        if (newFilters.minPrice > 0) current.set("minPrice", String(newFilters.minPrice));
        else current.delete("minPrice");
      }
      if (newFilters.maxPrice !== undefined) {
        if (newFilters.maxPrice < 5000000 && newFilters.maxPrice !== 2000000) current.set("maxPrice", String(newFilters.maxPrice));
        else if (newFilters.maxPrice === 2000000) current.set("maxPrice", "2000000");
        else current.delete("maxPrice");
      }
      if (newFilters.location !== undefined) {
        if (newFilters.location && newFilters.location !== "ALL") current.set("location", newFilters.location);
        else current.delete("location");
      }

      const qs = current.toString();
      router.replace(`/catalog${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch products from database
  const fetchProducts = async () => {
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
    fetchProducts();
  }, []);

  // Filter and sort products purely from database
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "ALL" && p.category.toUpperCase() !== selectedCategory.toUpperCase()) {
          return false;
        }
        // Condition filter
        if (selectedCondition !== "ALL") {
          if (selectedCondition === "Sangat baik" && p.condition !== "Sangat baik") return false;
          if (selectedCondition === "Baik" && p.condition !== "Baik") return false;
          if (selectedCondition === "Baik+" && p.condition !== "Sangat baik" && p.condition !== "Baik") return false;
        }
        // Price range
        if (p.price < minPrice || p.price > maxPrice) {
          return false;
        }
        // Location filter
        if (locationFilter && locationFilter !== "ALL") {
          const loc = p.location || "Jakarta Selatan";
          if (!loc.toLowerCase().includes(locationFilter.toLowerCase())) {
            return false;
          }
        }
        // Search query
        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(term);
          const matchBrand = p.brand.toLowerCase().includes(term);
          const matchDesc = p.description?.toLowerCase().includes(term);
          if (!matchName && !matchBrand && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 5) - (a.rating || 5);
        // Default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [products, selectedCategory, selectedCondition, minPrice, maxPrice, locationFilter, searchQuery, sortBy]);

  // Handle filter changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams({ cat });
  };

  const handleConditionChange = (cond: string) => {
    setSelectedCondition(cond);
    updateUrlParams({ condition: cond });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUrlParams({ sort });
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlParams({ minPrice: min, maxPrice: max });
  };

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedCondition("ALL");
    setMinPrice(0);
    setMaxPrice(5000000);
    setLocationFilter("ALL");
    setSearchQuery("");
    setSortBy("newest");
    router.replace("/catalog", { scroll: false });
  };

  // Active filter chips count
  const activeFiltersCount =
    (selectedCategory !== "ALL" ? 1 : 0) +
    (selectedCondition !== "ALL" ? 1 : 0) +
    (maxPrice < 5000000 ? 1 : 0) +
    (locationFilter && locationFilter !== "ALL" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* 0. Mobile Search Input (Visible on < 768px sesuai Figma node 10:25319) */}
      <div className="md:hidden mb-3">
        <label htmlFor="catalog-search" className="block text-[11px] font-semibold text-neutral-600 mb-1">
          Cari barang preloved
        </label>
        <div className="relative">
          <input
            id="catalog-search"
            name="search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              updateUrlParams({ q: e.target.value });
            }}
            placeholder="Peripheral komputer"
            className="w-full rounded-xl border border-neutral-300 bg-[#F6F6F4] py-2.5 pl-9 pr-4 text-xs font-semibold text-[#1A1A1A] outline-none transition focus:border-[#FFC629] focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                updateUrlParams({ q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 1. TOP BANNER (#FFFBEB) sesuai Figma node 10:25047 & 10:25319 */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#FFFBEB] border border-[#FFE58A] p-5 sm:p-8 md:p-10 mb-5 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 shadow-xs">
        <div className="max-w-xl">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
            KURASI HINGO / PRELOVED PILIHAN
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight">
            Upgrade gear, bukan anggaran.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Semua peripheral telah melalui 12 poin inspeksi fungsi, switch, sensor,
            dan kelengkapan original sebelum diterbitkan di katalog.
          </p>
        </div>

        {/* White Card "Ditangani tim kami." (Desktop) */}
        <div className="hidden md:flex rounded-2xl bg-white p-5 border border-[#FFE58A] shadow-xs shrink-0 items-center gap-3.5 max-w-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#1F9D55] border border-emerald-100">
            <ShieldCheck className="h-6 w-6 text-[#1F9D55]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">
              Ditangani tim kami.
            </h3>
            <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
              Dari pengecekan dan penyimpanan hingga pengiriman ke pembeli.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY SHORTCUT CHIPS (Semua gear, Keyboard, Mouse, Headset, Monitor, Aksesoris) */}
      <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
        {[
          { label: "Semua gear", value: "ALL", count: categoryCounts.TOTAL },
          { label: "Keyboard", value: "KEYBOARD", count: categoryCounts.KEYBOARD },
          { label: "Mouse", value: "MOUSE", count: categoryCounts.MOUSE },
          { label: "Headset", value: "HEADSET", count: categoryCounts.HEADSET },
          { label: "Monitor", value: "MONITOR", count: categoryCounts.MONITOR },
          { label: "Aksesoris", value: "ACCESSORIES", count: categoryCounts.ACCESSORIES },
        ].map((chip) => {
          const isActive = selectedCategory === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => handleCategoryChange(chip.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#FFF3C4] text-[#1A1A1A] border border-[#FFC629] shadow-xs"
                  : "bg-white text-neutral-700 border border-[#EBEBEB] hover:bg-[#F6F6F4]"
              }`}
            >
              <span>{chip.label}</span>
              {chip.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive
                      ? "bg-[#FFC629] text-black"
                      : "bg-[#F6F6F4] text-neutral-500"
                  }`}
                >
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN CATALOG: SIDEBAR FILTER + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (Desktop >= 1024px sesuai Figma node 10:25047) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 rounded-3xl border border-[#EBEBEB] bg-white p-6 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="flex items-center gap-2 text-sm font-black text-[#1A1A1A]">
                <Filter className="h-4 w-4" /> Filter
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer transition"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            {/* Filter 1: Kategori (Radio buttons) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Kategori
              </label>
              <div className="flex flex-col gap-2.5 text-xs font-semibold text-neutral-700">
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
                        name="desktopCategory"
                        checked={selectedCategory === item.value}
                        onChange={() => handleCategoryChange(item.value)}
                        className="accent-[#FFC629] h-4 w-4 cursor-pointer"
                      />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">({item.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 2: Kondisi Barang (Sangat baik, Baik) */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Kondisi Barang
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Semua", value: "ALL" },
                  { label: "Sangat baik", value: "Sangat baik" },
                  { label: "Baik", value: "Baik" },
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleConditionChange(c.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedCondition === c.value
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F6F6F4] text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Rentang Harga */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                Rentang Harga (Rp)
              </label>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label htmlFor="catalog-min-price" className="text-[10px] text-neutral-500 font-semibold block">Harga Minimum</label>
                  <input
                    id="catalog-min-price"
                    name="minPrice"
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
                    step={50000}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
                  />
                </div>
                <div>
                  <label htmlFor="catalog-max-price" className="text-[10px] text-neutral-500 font-semibold block">Harga Maksimum</label>
                  <input
                    id="catalog-max-price"
                    name="maxPrice"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                    step={100000}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-[#1A1A1A] outline-none focus:border-[#FFC629]"
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
                <span className="h-2 w-2 rounded-full bg-[#1F9D55]" />
                <span>Jakarta Selatan (Gudang Hingo)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Product Grid & Filter Bar */}
        <div className="lg:col-span-9 flex flex-col gap-4 sm:gap-5">
          {/* Header row: Title + count + Desktop sort */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                Peripheral preloved
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {filteredProducts.length} barang ditemukan di {locationFilter || "Jakarta Selatan"}
              </p>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <select
                  id="catalog-sort-desktop"
                  name="sortBy"
                  aria-label="Urutkan produk"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none rounded-xl border border-[#EBEBEB] bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-[#1A1A1A] outline-none hover:border-neutral-400 cursor-pointer shadow-xs"
                >
                  <option value="newest">Urutkan: Terbaru ↓</option>
                  <option value="price_asc">Harga: Terendah ke Tertinggi</option>
                  <option value="price_desc">Harga: Tertinggi ke Terendah</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Mobile Filter Bar & Quick Actions (< 768px sesuai Figma node 10:25319) */}
          <div className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {/* Filter Pill Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#FFC629] px-3.5 py-1.5 font-black text-[#1A1A1A] border border-amber-400 shrink-0 shadow-xs cursor-pointer active:scale-95"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter {activeFiltersCount > 0 ? `· ${activeFiltersCount}` : ""}</span>
            </button>

            {/* Mobile Sort Dropdown */}
            <select
              id="catalog-sort-mobile"
              name="sortBy"
              aria-label="Urutkan produk"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-800 shrink-0 outline-none"
            >
              <option value="newest">Terbaru ↓</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Termahal</option>
              <option value="rating">Rating Tertinggi</option>
            </select>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-700 shrink-0"
            >
              Lokasi ↓
            </button>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 font-bold text-neutral-700 shrink-0"
            >
              Harga ↓
            </button>
          </div>

          {/* Baris Chip Filter Aktif yang Bisa Dihapus (Sesuai Figma node 10:25047 & 10:25319) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {selectedCondition !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] border border-[#FFC629] px-3 py-1 font-bold text-[#1A1A1A] shadow-2xs">
                Kondisi: {selectedCondition}
                <button
                  type="button"
                  onClick={() => handleConditionChange("ALL")}
                  className="hover:text-red-600 font-extrabold ml-0.5 cursor-pointer"
                  aria-label="Hapus filter kondisi"
                >
                  ×
                </button>
              </span>
            )}

            {maxPrice < 5000000 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] border border-[#FFC629] px-3 py-1 font-bold text-[#1A1A1A] shadow-2xs">
                ≤ Rp{Math.round(maxPrice / 1000000)} juta
                <button
                  type="button"
                  onClick={() => handlePriceChange(0, 5000000)}
                  className="hover:text-red-600 font-extrabold ml-0.5 cursor-pointer"
                  aria-label="Hapus filter harga"
                >
                  ×
                </button>
              </span>
            )}

            {locationFilter && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] border border-[#FFC629] px-3 py-1 font-bold text-[#1A1A1A] shadow-2xs">
                {locationFilter}
                <button
                  type="button"
                  onClick={() => {
                    setLocationFilter("ALL");
                    updateUrlParams({ location: "ALL" });
                  }}
                  className="hover:text-red-600 font-extrabold ml-0.5 cursor-pointer"
                  aria-label="Hapus filter lokasi"
                >
                  ×
                </button>
              </span>
            )}

            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] border border-[#FFC629] px-3 py-1 font-bold text-[#1A1A1A] shadow-2xs">
                {selectedCategory}
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ALL")}
                  className="hover:text-red-600 font-extrabold ml-0.5 cursor-pointer"
                  aria-label="Hapus filter kategori"
                >
                  ×
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] border border-[#FFC629] px-3 py-1 font-bold text-[#1A1A1A] shadow-2xs">
                Cari: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateUrlParams({ q: "" });
                  }}
                  className="hover:text-red-600 font-extrabold ml-0.5 cursor-pointer"
                  aria-label="Hapus kata kunci pencarian"
                >
                  ×
                </button>
              </span>
            )}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-neutral-500 hover:text-black underline ml-1 cursor-pointer"
              >
                Hapus semua filter
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="rounded-3xl border border-[#EBEBEB] bg-white p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFC629]" />
              <p className="text-xs font-bold text-neutral-500">Memuat katalog peripheral...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Product Grid: 2 columns on mobile, 3 columns on desktop (grid-cols-2 lg:grid-cols-3) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Teks Penutup Sesuai Figma node 10:25047 line 1170 */}
              <div className="mt-8 rounded-2xl bg-[#F6F6F4] p-5 text-center text-xs text-neutral-600 font-medium">
                Kamu sudah melihat semua barang. Simpan pencarian untuk temuan baru.
              </div>
            </>
          ) : (
            /* Clean Empty State as required by prompt */
            <div className="rounded-3xl bg-[#FFFBEB] border border-[#FFE58A] p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-[#FFC629] text-[#1A1A1A] flex items-center justify-center shadow-xs">
                <Package className="h-8 w-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg sm:text-xl font-black text-[#1A1A1A]">
                  Tidak ada barang yang cocok
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                  Coba ubah kriteria filter atau hapus kata kunci pencarianmu untuk melihat barang lainnya.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold text-[#1A1A1A] hover:bg-neutral-50 transition cursor-pointer"
                >
                  Reset Filter
                </button>
                <Link
                  href={user ? "/seller/consignments/new" : "/auth/login?callbackUrl=/seller/consignments/new"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold shadow-md transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Ajukan titip jual</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal Sheet (Sesuai Figma node 10:25319) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden animate-in fade-in">
          <div className="w-full rounded-t-3xl bg-white p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#1A1A1A]" />
                <h3 className="text-base font-black text-[#1A1A1A]">Filter Produk</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 flex flex-col gap-6">
              {/* Category */}
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
                    { label: "Aksesoris", value: "ACCESSORIES" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleCategoryChange(item.value)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        selectedCategory === item.value
                          ? "border-[#FFC629] bg-[#FFF3C4] font-bold text-[#1A1A1A]"
                          : "border-neutral-200 text-neutral-600 bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Kondisi Barang
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Semua kondisi", value: "ALL" },
                    { label: "Sangat baik", value: "Sangat baik" },
                    { label: "Baik", value: "Baik" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleConditionChange(item.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                        selectedCondition === item.value
                          ? "bg-[#1A1A1A] text-white border-black"
                          : "border-neutral-200 text-neutral-700 bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price max */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Harga Maksimum
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Semua harga", value: 5000000 },
                    { label: "≤ Rp1 Juta", value: 1000000 },
                    { label: "≤ Rp2 Juta", value: 2000000 },
                    { label: "≤ Rp3 Juta", value: 3000000 },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handlePriceChange(0, item.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                        maxPrice === item.value
                          ? "bg-[#1A1A1A] text-white border-black"
                          : "border-neutral-200 text-neutral-700 bg-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 rounded-xl bg-[#FFC629] py-3 text-xs font-black text-black shadow-md hover:bg-[#FFC420] transition"
                >
                  Terapkan Filter
                </button>
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
