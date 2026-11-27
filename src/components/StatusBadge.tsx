import { ItemStatus } from "@/types";

interface StatusBadgeProps {
  status: ItemStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  }[size];

  // Map 20 status colors
  let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";

  switch (status) {
    case "Tayang":
      colorClasses = "bg-success-bg text-success border-success/30 font-bold";
      break;
    case "Disetujui, menunggu kiriman":
    case "Dalam perjalanan ke Hingo":
    case "Diterima, sedang diuji":
      colorClasses = "bg-yellow-100 text-yellow-700 border-yellow-200 font-medium";
      break;
    case "Diajukan":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200 font-medium";
      break;
    case "Ditahan menunggu pembayaran":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200 font-medium animate-pulse";
      break;
    case "Dibayar, dikemas":
    case "Dikirim ke pembeli":
    case "Diterima pembeli":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";
      break;
    case "Siap dibayar ke consignor":
    case "Consignor sudah dibayar":
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200 font-bold";
      break;
    case "Ditolak saat screening":
    case "Ditolak setelah pengecekan":
    case "Klaim: cacat tersembunyi":
    case "Klaim: kesalahan Hingo":
    case "Klaim: kesalahan pengiriman":
      colorClasses = "bg-danger-bg text-danger border-danger/30 font-semibold";
      break;
    case "Menunggu ongkir kembali":
    case "Dikembalikan ke consignor":
    case "Masa penitipan habis":
      colorClasses = "bg-orange-50 text-orange-700 border-orange-200 font-medium";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${colorClasses} ${sizeClasses}`}
    >
      {status}
    </span>
  );
}
