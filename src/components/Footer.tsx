import Link from "next/link";
import { ShieldCheck, Truck, Clock, RefreshCcw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-auto border-t border-gray-700">
      {/* Guarantees Strip */}
      <div className="border-b border-gray-700/60 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Garansi Toko 7 Hari</p>
              <p className="text-gray-300 text-xs">Uji coba langsung, retur jika bermasalah</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Uji Teknis Ketat</p>
              <p className="text-gray-300 text-xs">Lolos tes Furmark, MemTest86, & CrystalDisk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <RefreshCcw className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Titip Jual Transparan</p>
              <p className="text-gray-300 text-xs">Fee jelas hanya 5% / Rp 10.000 flat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="font-bold text-white">Packing Ekstra Aman</p>
              <p className="text-gray-300 text-xs">Bubble wrap tebal & asuransi pengiriman</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-[10px] bg-yellow-500 flex items-center justify-center font-extrabold text-xl text-ink">
              H
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Hinggo
            </span>
          </div>
          <p className="text-gray-300 text-xs leading-relaxed max-w-sm">
            Platform konsinyasi dan marketplace komponen komputer bekas teruji fisik nomor 1 di Indonesia.
            Setiap komponen diuji menyeluruh oleh teknisi sebelum tayang ke pembeli.
          </p>
        </div>

        {/* Belanja */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-3 text-sm">Kategori Komponen</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/katalog?kategori=RAM" className="hover:text-white transition-colors">RAM DDR4 & DDR5</Link></li>
            <li><Link href="/katalog?kategori=SSD" className="hover:text-white transition-colors">SSD NVMe & SATA</Link></li>
            <li><Link href="/katalog?kategori=GPU" className="hover:text-white transition-colors">VGA / GPU Card</Link></li>
            <li><Link href="/katalog" className="hover:text-white transition-colors">Semua Produk Tayang</Link></li>
          </ul>
        </div>

        {/* Konsinyasi */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-3 text-sm">Titip Jual (Consignor)</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/titip-jual" className="hover:text-white transition-colors">Ajukan Barang Titipan</Link></li>
            <li><Link href="/consignor/dasbor" className="hover:text-white transition-colors">Dasbor Barang Saya</Link></li>
            <li><Link href="/kebijakan#alur-titip" className="hover:text-white transition-colors">Alur & Syarat Penitipan</Link></li>
            <li><Link href="/kebijakan#skema-fee" className="hover:text-white transition-colors">Kalkulator Fee Hinggo</Link></li>
          </ul>
        </div>

        {/* Bantuan & Kebijakan */}
        <div>
          <h4 className="font-bold text-yellow-500 mb-3 text-sm">Bantuan & Kebijakan</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/kebijakan" className="hover:text-white transition-colors">Ketentuan Garansi 7 Hari</Link></li>
            <li><Link href="/kebijakan#retur" className="hover:text-white transition-colors">Prosedur Klaim Retur</Link></li>
            <li><Link href="/kebijakan#privasi" className="hover:text-white transition-colors">Kebijakan Privasi & Dokumen KTP</Link></li>
            <li>
              <span className="text-gray-400">Gudang: Jl. Tebet Raya No. 42, Jakarta Selatan</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700/60 py-6 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Hinggo MVP. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
