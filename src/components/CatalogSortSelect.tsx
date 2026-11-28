"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CatalogSortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/katalog?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="h-10 px-3 bg-white border border-[#ebebeb] rounded-[12px] text-xs text-ink font-medium focus:outline-none focus:border-yellow-500 cursor-pointer shadow-xs"
    >
      <option value="newest">Terbaru</option>
      <option value="price_asc">Harga Terendah</option>
      <option value="price_desc">Harga Tertinggi</option>
    </select>
  );
}
