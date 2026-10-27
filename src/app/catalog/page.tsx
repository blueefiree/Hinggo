"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  ShieldCheck,
  Search,
} from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { PRODUCTS, Product } from "@/lib/data";

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Active filter chips removal
  const [filterChips, setFilterChips] = useState([
    { id: "cond", label: "Kondisi: Baik+" },
    { id: "price", label: "≤ Rp2 juta" },
    { id: "loc", label: "Jakarta Selatan" },
  ]);

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
    setFilterChips([
      { id: "cond", label: "Kondisi: Baik+" },
      { id: "price", label: "≤ Rp2 juta" },
      { id: "loc", label: "Jakarta Selatan" },
    ]);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (selectedCategory !== "ALL" && p.category !== selectedCategory)
        return false;
      if (
        selectedCondition !== "ALL" &&
        p.condition !== selectedCondition
      )
        return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // default newest
    });
  }, [selectedCategory, selectedCondition, minPrice, maxPrice, sortBy, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      {/* 1. TOP BANNER (#FFFBEB) */}
      <div className="rounded-3xl bg-[#FFFBEB] border border-[#FDE68A] p-6 sm:p-10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            KURASI HINGO / PRELOVED PILIHAN
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black text-[#1A1A1A]">
            Upgrade gear, bukan anggaran.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 max-w-lg">
            Semua peripheral telah melalui 12 poin inspeksi fungsi, switch, sensor,
            dan kelengkapan original sebelum diterbitkan di katalog.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-[#FDE68A] shadow-xs shrink-0 flex items-center gap-3 self-start md:self-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1A1A]">Ditangani tim kami</h4>
            <p className="text-[11px] text-neutral-500">Stok preloved aman & teruji</p>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {[
          { label: "Semua gear", value: "ALL" },
          { label: "Keyboard", value: "KEYBOARD" },
          { label: "Mouse", value: "MOUSE" },
          { label: "Headset", value: "HEADSET" },
          { label: "Monitor", value: "MONITOR" },
          { label: "Aksesoris", value: "ACCESSORIES" },
        ].map((pill) => (
          <button
            key={pill.value}
            onClick={() => setSelectedCategory(pill.value)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition shadow-xs ${
              selectedCategory === pill.value
                ? "bg-[#FFC629] text-[#1A1A1A] border border-[#F59E0B]"
                : "bg-[#F6F6F4] text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {pill.label}
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
                className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black"
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
                  { label: "Semua peripheral", value: "ALL" },
                  { label: "Keyboard", value: "KEYBOARD" },
                  { label: "Mouse", value: "MOUSE" },
                  { label: "Headset", value: "HEADSET" },
                  { label: "Monitor", value: "MONITOR" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-2.5 cursor-pointer hover:text-black"
                  >
                    <input
                      type="radio"
                      name="catRadio"
                      checked={selectedCategory === item.value}
                      onChange={() => setSelectedCategory(item.value)}
                      className="accent-[#FFC629] h-4 w-4 cursor-pointer"
                    />
                    <span>{item.label}</span>
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
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
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
        <div className="lg:col-span-9 flex flex-col gap-5">
          {/* Header row with count & sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A]">
                Peripheral preloved
              </h2>
              <p className="text-xs text-neutral-500">
                {filteredProducts.length} barang ditemukan di Jakarta Selatan
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-[#1A1A1A]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filter</span>
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-bold text-[#1A1A1A] outline-none"
              >
                <option value="newest">Urutkan: Terbaru ↓</option>
                <option value="price_asc">Harga: Terendah ke Tertinggi</option>
                <option value="price_desc">Harga: Tertinggi ke Terendah</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {filterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filterChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1 text-xs font-semibold text-amber-900"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => removeChip(chip.id)}
                    className="hover:text-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-neutral-500 hover:text-black underline ml-1"
              >
                Hapus semua
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center flex flex-col items-center justify-center gap-3">
              <p className="text-base font-bold text-neutral-700">
                Tidak ada barang yang cocok dengan filter kamu.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl bg-[#FFC629] px-4 py-2 text-xs font-bold text-black"
              >
                Reset Filter
              </button>
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
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
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
                      onClick={() => setSelectedCategory(item.value)}
                      className={`p-2.5 rounded-xl border text-left ${
                        selectedCategory === item.value
                          ? "bg-[#FFFBEB] border-[#FFC629] font-bold text-black"
                          : "border-neutral-200 text-neutral-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                  Kondisi
                </label>
                <div className="flex gap-2">
                  {["ALL", "Sangat baik", "Baik"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCondition(c)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border ${
                        selectedCondition === c
                          ? "bg-[#1A1A1A] text-white border-black"
                          : "border-neutral-200 text-neutral-700"
                      }`}
                    >
                      {c === "ALL" ? "Semua" : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 py-3 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#FFC629] text-xs font-bold text-black"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
