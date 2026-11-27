import { ItemStatus, UserRole } from "@/types";

export const ITEM_STATUSES: ItemStatus[] = [
  "Diajukan",
  "Ditolak saat screening",
  "Disetujui, menunggu kiriman",
  "Dalam perjalanan ke Hingo",
  "Diterima, sedang diuji",
  "Ditolak setelah pengecekan",
  "Menunggu ongkir kembali",
  "Dikembalikan ke consignor",
  "Tayang",
  "Ditahan menunggu pembayaran",
  "Dibayar, dikemas",
  "Dikirim ke pembeli",
  "Diterima pembeli",
  "Klaim diproses",
  "Klaim: cacat tersembunyi",
  "Klaim: kesalahan Hingo",
  "Siap dibayar ke consignor",
  "Consignor sudah dibayar",
  "Masa penitipan habis",
  "Klaim: kesalahan pengiriman",
];

export const TERMINAL_STATUSES: ItemStatus[] = [
  "Ditolak saat screening",
  "Dikembalikan ke consignor",
  "Consignor sudah dibayar",
];

interface TransitionRule {
  from: ItemStatus;
  to: ItemStatus;
  actor: "ADMIN" | "USER" | "SYSTEM";
  description: string;
}

export const VALID_TRANSITIONS: TransitionRule[] = [
  { from: "Diajukan", to: "Ditolak saat screening", actor: "ADMIN", description: "Ditolak saat screening online (alasan baku wajib)" },
  { from: "Diajukan", to: "Disetujui, menunggu kiriman", actor: "ADMIN", description: "Lolos screening awal" },
  { from: "Disetujui, menunggu kiriman", to: "Dalam perjalanan ke Hingo", actor: "USER", description: "Consignor telah mengisi nomor resi pengiriman" },
  { from: "Disetujui, menunggu kiriman", to: "Ditolak saat screening", actor: "SYSTEM", description: "Kedaluwarsa karena resi tidak diisi dalam 48 jam" },
  { from: "Dalam perjalanan ke Hingo", to: "Diterima, sedang diuji", actor: "ADMIN", description: "Paket tiba di gudang Hinggo & masuk tahap pengujian" },
  { from: "Diterima, sedang diuji", to: "Tayang", actor: "ADMIN", description: "Pengujian LULUS & harga tayang disepakati" },
  { from: "Diterima, sedang diuji", to: "Ditolak setelah pengecekan", actor: "ADMIN", description: "Gagal uji atau kondisi tidak sesuai" },
  { from: "Diterima, sedang diuji", to: "Menunggu ongkir kembali", actor: "ADMIN", description: "Hasil uji lebih buruk & Consignor memilih ambil kembali" },
  { from: "Ditolak setelah pengecekan", to: "Menunggu ongkir kembali", actor: "ADMIN", description: "Setelah alasan penolakan dicatat" },
  { from: "Menunggu ongkir kembali", to: "Dikembalikan ke consignor", actor: "ADMIN", description: "Bukti transfer ongkir kembali diverifikasi & resi balik diisi" },
  { from: "Tayang", to: "Ditahan menunggu pembayaran", actor: "SYSTEM", description: "Pembeli menyelesaikan checkout (dikunci 24 jam)" },
  { from: "Ditahan menunggu pembayaran", to: "Tayang", actor: "SYSTEM", description: "24 jam lewat tanpa bukti transfer valid" },
  { from: "Ditahan menunggu pembayaran", to: "Dibayar, dikemas", actor: "ADMIN", description: "Bukti transfer pembeli diverifikasi valid" },
  { from: "Dibayar, dikemas", to: "Dikirim ke pembeli", actor: "ADMIN", description: "Nomor resi pengiriman ke pembeli diisi" },
  { from: "Dikirim ke pembeli", to: "Diterima pembeli", actor: "ADMIN", description: "Barang diterima pembeli (garansi 7 hari mulai berjalan)" },
  { from: "Diterima pembeli", to: "Klaim diproses", actor: "USER", description: "Pembeli mengajukan klaim garansi dalam 7 hari" },
  { from: "Diterima pembeli", to: "Siap dibayar ke consignor", actor: "SYSTEM", description: "Garansi 7 hari selesai tanpa klaim" },
  { from: "Klaim diproses", to: "Klaim: cacat tersembunyi", actor: "ADMIN", description: "Cacat tersembunyi tidak terdeteksi saat uji" },
  { from: "Klaim diproses", to: "Klaim: kesalahan Hingo", actor: "ADMIN", description: "Kesalahan laporan pengujian Hinggo" },
  { from: "Klaim diproses", to: "Klaim: kesalahan pengiriman", actor: "ADMIN", description: "Barang rusak oleh ekspedisi" },
  { from: "Klaim diproses", to: "Diterima pembeli", actor: "ADMIN", description: "Klaim ditolak / tidak valid" },
  { from: "Klaim: cacat tersembunyi", to: "Menunggu ongkir kembali", actor: "ADMIN", description: "Barang kembali ke Hinggo lalu dikembalikan ke consignor" },
  { from: "Klaim: kesalahan Hingo", to: "Tayang", actor: "ADMIN", description: "Barang diuji ulang dan kembali tayang" },
  { from: "Siap dibayar ke consignor", to: "Consignor sudah dibayar", actor: "ADMIN", description: "Hasil penjualan ditransfer ke Consignor" },
  { from: "Tayang", to: "Masa penitipan habis", actor: "SYSTEM", description: "Hari ke-60 penitipan terlewati" },
  { from: "Masa penitipan habis", to: "Tayang", actor: "USER", description: "Consignor memilih perpanjang 1x selama 30 hari" },
  { from: "Masa penitipan habis", to: "Menunggu ongkir kembali", actor: "SYSTEM", description: "Consignor memilih ambil kembali atau lewat 72 jam" },
  { from: "Tayang", to: "Menunggu ongkir kembali", actor: "ADMIN", description: "Consignor mengajukan penarikan dini (biaya penarikan Rp 25.000)" },
];

export function validateTransition(
  fromStatus: ItemStatus,
  toStatus: ItemStatus,
  actorRole: UserRole | "SYSTEM"
): { valid: boolean; reason?: string } {
  if (TERMINAL_STATUSES.includes(fromStatus)) {
    return { valid: false, reason: `Status '${fromStatus}' adalah status akhir permanen dan tidak dapat diubah.` };
  }

  const rule = VALID_TRANSITIONS.find((t) => t.from === fromStatus && t.to === toStatus);
  if (!rule) {
    return { valid: false, reason: `Transisi dari '${fromStatus}' ke '${toStatus}' tidak diizinkan dalam State Machine.` };
  }

  if (rule.actor === "ADMIN" && actorRole !== "ADMIN") {
    return { valid: false, reason: "Aksi transisi ini hanya dapat dilakukan oleh Admin." };
  }

  return { valid: true };
}

export function getAvailableNextStatuses(currentStatus: ItemStatus, role: UserRole | "SYSTEM"): ItemStatus[] {
  if (TERMINAL_STATUSES.includes(currentStatus)) return [];
  return VALID_TRANSITIONS
    .filter((t) => t.from === currentStatus && (role === "ADMIN" || t.actor === role || t.actor === "USER"))
    .map((t) => t.to);
}
