import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Headphones, RefreshCw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-[#1A1A1A] text-white">
      {/* 4 Trust Strip */}
      <div className="border-b border-neutral-800 py-8 px-4">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 gap-6 text-neutral-300 text-xs md:text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629]/20 text-[#FFC629]">
              <ShieldCheck className="h-5 w-5 text-[#FFC629]" />
            </div>
            <div>
              <p className="font-bold text-white">Pengecekan Fisik Ketat</p>
              <p className="text-neutral-400 text-xs">Setiap fungsi gear diuji</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629]/20 text-[#FFC629]">
              <RefreshCw className="h-5 w-5 text-[#FFC629]" />
            </div>
            <div>
              <p className="font-bold text-white">Rekening Bersama (Escrow)</p>
              <p className="text-neutral-400 text-xs">Dana aman hingga barang dicek</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629]/20 text-[#FFC629]">
              <Truck className="h-5 w-5 text-[#FFC629]" />
            </div>
            <div>
              <p className="font-bold text-white">Pengiriman Aman & Terlacak</p>
              <p className="text-neutral-400 text-xs">Proteksi bubble wrap tebal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFC629]/20 text-[#FFC629]">
              <Headphones className="h-5 w-5 text-[#FFC629]" />
            </div>
            <div>
              <p className="font-bold text-white">Bantuan CS Responsif</p>
              <p className="text-neutral-400 text-xs">Respon rata-rata 2–5 menit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC629] font-black text-xl text-[#1A1A1A]">
                H
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Hingo
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
              Layanan konsinyasi peripheral komputer preloved terpercaya. Kami cek,
              simpan, pasarkan lewat media sosial (Instagram, TikTok, Facebook), dan
              kirim barang titipan langsung ke pembeli.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
              <span className="rounded-full bg-neutral-800 px-3 py-1 text-neutral-300 font-mono">
                DKI Jakarta · Bandung
              </span>
              <span>·</span>
              <span>Operasional 08.00–22.00 WIB</span>
            </div>
          </div>

          {/* Col 1: Belanja */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Belanja
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/catalog?cat=KEYBOARD" className="hover:text-white transition">
                  Keyboard Mechanical
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=MOUSE" className="hover:text-white transition">
                  Mouse Wireless & Gaming
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=HEADSET" className="hover:text-white transition">
                  Headset & Audio
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=MONITOR" className="hover:text-white transition">
                  Monitor Gaming & Kerja
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=ACCESSORIES" className="hover:text-white transition">
                  Aksesoris & Keycaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Bantuan */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Bantuan
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/chat/support" className="hover:text-white transition">
                  Pusat Bantuan & Tiket
                </Link>
              </li>
              <li>
                <Link href="/chat/product" className="hover:text-white transition">
                  Chat Admin Produk
                </Link>
              </li>
              <li>
                <Link href="/seller/consignments/new" className="hover:text-white transition">
                  Cara Titip Jual di Hingo
                </Link>
              </li>
              <li>
                <Link href="/orders/GRL-20261022-0842" className="hover:text-white transition">
                  Pelacakan & Pengembalian
                </Link>
              </li>
              <li>
                <Link href="/auth/verify-identity" className="hover:text-white transition">
                  Verifikasi Identitas (KYC)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hingo */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Hingo
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer">
                  Tentang Hingo
                </span>
              </li>
              <li>
                <Link href="/seller/consignments" className="hover:text-white transition">
                  Ruang Penjual Konsinyasi
                </Link>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer">
                  Kebijakan Privasi
                </span>
              </li>
              <li>
                <span className="text-neutral-400 hover:text-white cursor-pointer">
                  Syarat & Ketentuan Konsinyasi
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Hingo Indonesia. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4">
            <span>Escrow Terlindungi</span>
            <span>·</span>
            <span>JNE REG & J&T Logistik</span>
            <span>·</span>
            <span>BCA VA & QRIS Otomatis</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
