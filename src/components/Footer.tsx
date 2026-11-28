import Link from "next/link";
import { ShieldCheck, Truck, Clock, RefreshCcw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-auto">
      {/* Guarantees Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Garansi Toko 7 Hari</p>
              <p className="text-[#a0a0a0] text-xs mt-0.5">Uji coba langsung, retur jika bermasalah</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Uji Teknis Ketat</p>
              <p className="text-[#a0a0a0] text-xs mt-0.5">Lolos tes Furmark, MemTest86, & CrystalDisk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <RefreshCcw className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Titip Jual Transparan</p>
              <p className="text-[#a0a0a0] text-xs mt-0.5">Fee jelas hanya 5% / Rp 10.000 flat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Packing Ekstra Aman</p>
              <p className="text-[#a0a0a0] text-xs mt-0.5">Bubble wrap tebal & asuransi pengiriman</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-[10px] bg-yellow-500 flex items-center justify-center font-extrabold text-xl text-ink">
              H
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Hinggo</span>
          </div>
          <p className="text-[#a0a0a0] text-xs leading-relaxed max-w-sm">
            Platform konsinyasi dan marketplace komponen komputer bekas teruji fisik.
            Setiap komponen diuji menyeluruh oleh teknisi sebelum tayang ke pembeli.
          </p>
        </div>

        {/* Belanja */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-4 text-sm">Belanja</h4>
          <ul className="space-y-3 text-xs text-[#a0a0a0]">
            <li><Link href="/katalog?kategori=RAM" className="hover:text-white transition-colors">RAM DDR4 & DDR5</Link></li>
            <li><Link href="/katalog?kategori=SSD" className="hover:text-white transition-colors">SSD NVMe & SATA</Link></li>
            <li><Link href="/katalog?kategori=GPU" className="hover:text-white transition-colors">VGA / GPU Card</Link></li>
            <li><Link href="/katalog" className="hover:text-white transition-colors">Semua Produk Tayang</Link></li>
          </ul>
        </div>

        {/* Bantuan */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-4 text-sm">Bantuan</h4>
          <ul className="space-y-3 text-xs text-[#a0a0a0]">
            <li><Link href="/kebijakan" className="hover:text-white transition-colors">Pusat Bantuan</Link></li>
            <li><Link href="/kebijakan" className="hover:text-white transition-colors">Chat CS</Link></li>
            <li><Link href="/kebijakan#rekber" className="hover:text-white transition-colors">Cara Rekber</Link></li>
            <li><Link href="/kebijakan#retur" className="hover:text-white transition-colors">Pengembalian</Link></li>
          </ul>
        </div>

        {/* Hinggo */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-4 text-sm">Hinggo</h4>
          <ul className="space-y-3 text-xs text-[#a0a0a0]">
            <li><Link href="/kebijakan" className="hover:text-white transition-colors">Tentang Kami</Link></li>
            <li><Link href="/titip-jual" className="hover:text-white transition-colors">Titip jual di Hinggo</Link></li>
            <li><Link href="/kebijakan#privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="/kebijakan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-[#6a6a6a]">
        <p>&copy; {new Date().getFullYear()} Hinggo. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
