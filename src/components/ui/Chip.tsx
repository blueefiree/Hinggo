import React from "react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  count?: number;
}

export default function Chip({
  active = false,
  children,
  count,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap ${
        active
          ? "bg-[#FFFBEB] text-[#1A1A1A] border border-[#FFE58A] shadow-xs font-bold"
          : "bg-[#F6F6F4] text-[#4B4B4B] border border-[#EBEBEB] hover:bg-[#EFEFEF] hover:text-[#1A1A1A] font-medium"
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-[#FFC629] text-[#1A1A1A]" : "bg-neutral-200 text-neutral-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
