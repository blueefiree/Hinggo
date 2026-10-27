import React from "react";
import { CheckCircle2, AlertCircle, Clock, PackageCheck, Truck, ShieldCheck } from "lucide-react";

interface StatusBadgeProps {
  label: string;
  variant?: "auto" | "verified" | "warning" | "neutral" | "info";
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({
  label,
  variant = "auto",
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  // Determine variant automatically if set to "auto"
  let resolvedVariant = variant;
  if (resolvedVariant === "auto") {
    const l = label.toLowerCase();
    if (
      l.includes("dicek") ||
      l.includes("dikelola") ||
      l.includes("selesai") ||
      l.includes("diterima") ||
      l.includes("lunas") ||
      l.includes("terverifikasi") ||
      l.includes("normal")
    ) {
      resolvedVariant = "verified";
    } else if (
      l.includes("tinjau") ||
      l.includes("siap dikirim") ||
      l.includes("revisi") ||
      l.includes("bahas") ||
      l.includes("tindakan") ||
      l.includes("cacat") ||
      l.includes("retur")
    ) {
      resolvedVariant = "warning";
    } else {
      resolvedVariant = "neutral";
    }
  }

  let styleClasses = "";
  let IconComponent = CheckCircle2;

  switch (resolvedVariant) {
    case "verified":
      styleClasses = "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]";
      IconComponent = ShieldCheck;
      break;
    case "warning":
      styleClasses = "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]";
      IconComponent = AlertCircle;
      break;
    case "info":
      styleClasses = "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]";
      IconComponent = Clock;
      break;
    case "neutral":
    default:
      styleClasses = "bg-[#F6F6F4] text-[#1A1A1A] border border-[#E5E5E5]";
      IconComponent = Clock;
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2.5 py-0.5 gap-1 font-medium"
      : "text-xs px-3 py-1 gap-1.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full transition-all tracking-tight ${sizeClasses} ${styleClasses} ${className}`}
    >
      {showIcon && <IconComponent className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{label}</span>
    </span>
  );
}
