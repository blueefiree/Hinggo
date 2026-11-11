import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-[#1A1A1A] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFC629] font-black text-xl text-[#1A1A1A]">
                H
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Hingo
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#D9D9D9] max-w-sm">
              Titip jual peripheral preloved. Kami cek, simpan, pasarkan lewat media sosial, dan
              kirim ke pembeli.
            </p>
            <div className="pt-2 text-xs text-[#8A8A8A]">
              <span>Pasar konsinyasi gear komputer terverifikasi · Jakarta Selatan</span>
            </div>
          </div>

          {/* Col 1: Belanja */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Belanja
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[#D9D9D9]">
              <li>
                <Link href="/catalog?category=KEYBOARD" className="hover:text-white transition">
                  Keyboard
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=MOUSE" className="hover:text-white transition">
                  Mouse
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=HEADSET" className="hover:text-white transition">
                  Headset
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=MONITOR" className="hover:text-white transition">
                  Monitor
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=ACCESSORIES" className="hover:text-white transition">
                  Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Bantuan */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Bantuan
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[#D9D9D9]">
              <li>
                <Link href="/chat/support" className="hover:text-white transition">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="/chat/product" className="hover:text-white transition">
                  Chat CS
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  Cara titip jual
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  Pengembalian
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hingo */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-bold tracking-wider text-[#FFC629] uppercase">
              Hingo
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[#D9D9D9]">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/seller/consignments/new" className="hover:text-white transition">
                  Titip jual di Hingo
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8A8A]">
          <p>© 2026 Hingo. Pasar konsinyasi peripheral preloved terverifikasi.</p>
          <div className="flex items-center gap-4">
            <span>Rekening Bersama (Escrow)</span>
            <span>·</span>
            <span>Pengiriman Terlacak</span>
            <span>·</span>
            <span>Pengecekan Fisik Ketat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
