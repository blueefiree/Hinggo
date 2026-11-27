import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Clock, RefreshCcw, FileText, CheckCircle2 } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        <div>
          <h1 className="text-3xl font-extrabold text-ink mb-2">Kebijakan & Ketentuan Layanan Hinggo</h1>
          <p className="text-sm text-gray-600">
            Transparansi penuh mengenai garansi toko 7 hari, prosedur retur, skema fee konsinyasi, dan perlindungan privasi dokumen KTP.
          </p>
        </div>

        {/* Section 1: Garansi Toko 7 Hari */}
        <section id="garansi" className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <ShieldCheck className="size-6" />
            <h2 className="text-xl font-bold text-ink">1. Ketentuan Garansi Toko 7 Hari</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Seluruh komponen yang dibeli melalui website Hinggo dilindungi garansi fungsional selama <strong>7 hari kalender</strong> sejak tanggal barang diterima oleh pembeli.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700 list-disc pl-5">
            <li>Pembeli berhak menguji coba komponen pada perangkat miliknya.</li>
            <li>Jika terjadi kendala fungsi yang tidak sesuai dengan laporan pengujian Hinggo, pembeli dapat mengajukan klaim garansi pada menu <strong>Pesanan Saya</strong>.</li>
            <li>Formulir pengajuan klaim mewajibkan foto bukti kendala serta tautan video pengujian pembeli (unlisted YouTube / Google Drive).</li>
            <li>Setelah hari ke-7 terlewati tanpa ada klaim aktif, transaksi dinyatakan selesai permanen dan dana penjualan diteruskan ke Consignor.</li>
          </ul>
        </section>

        {/* Section 2: Skema Fee Konsinyasi */}
        <section id="skema-fee" className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <RefreshCcw className="size-6" />
            <h2 className="text-xl font-bold text-ink">2. Skema Fee Konsinyasi Hinggo</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Hinggo tidak membebankan biaya di muka saat penitipan. Fee hanya dipotong saat barang berhasil terjual ke pembeli:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-btn bg-gray-50 border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Harga Jual &le; Rp 200.000</span>
              <p className="text-lg font-black text-ink mt-1">Fee Tetap Rp 10.000</p>
              <p className="text-xs text-gray-500 mt-1">Contoh: Laku Rp 180.000 &rarr; Consignor terima Rp 170.000</p>
            </div>
            <div className="p-4 rounded-btn bg-yellow-50 border border-yellow-200">
              <span className="text-xs font-semibold text-yellow-800">Harga Jual &gt; Rp 200.000</span>
              <p className="text-lg font-black text-yellow-900 mt-1">Fee 5% dari Harga Jual</p>
              <p className="text-xs text-yellow-800 mt-1">Contoh: Laku Rp 1.000.000 &rarr; Fee Rp 50.000, Consignor terima Rp 950.000</p>
            </div>
          </div>
        </section>

        {/* Section 3: Masa Penitipan 60 Hari */}
        <section id="masa-penitipan" className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <Clock className="size-6" />
            <h2 className="text-xl font-bold text-ink">3. Masa Penitipan & Batas Waktu</h2>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Masa Tayang 60 Hari:</strong> Barang ditayangkan di katalog website selama 60 hari kalender.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Perpanjangan:</strong> Saat hari ke-60 habis, Consignor dapat memperpanjang 1 kali selama 30 hari dengan harga kesepakatan baru.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Penarikan Dini:</strong> Jika Consignor ingin menarik barang sebelum 60 hari berakhir, dikenakan biaya penarikan Rp 25.000 + ongkos kirim pengembalian.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Privasi KTP */}
        <section id="privasi" className="bg-white p-6 sm:p-8 rounded-card border border-gray-200 space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <FileText className="size-6" />
            <h2 className="text-xl font-bold text-ink">4. Privasi & Keamanan Dokumen KTP</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            Foto KTP dan bukti kepemilikan consignor disimpan di <em>Private Storage Bucket</em> terisolasi. Dokumen hanya dapat diakses melalui <em>Signed URL</em> berdurasi singkat oleh Admin dan pemilik dokumen. File KTP akan dihapus otomatis (purged) 90 hari setelah status akhir transaksi tercapai.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
