import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Clock, RefreshCcw, FileText, CheckCircle2, Lock } from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-20 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-2">
            Kebijakan & Ketentuan Layanan Hinggo
          </h1>
          <p className="text-xs sm:text-sm text-[#8a8a8a]">
            Transparansi penuh mengenai garansi toko 7 hari, sistem rekber resmi, prosedur retur, skema fee konsinyasi, dan perlindungan privasi dokumen KTP.
          </p>
        </div>

        {/* Section 1: Garansi Toko 7 Hari */}
        <section id="garansi" className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <ShieldCheck className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">1. Ketentuan Garansi Toko 7 Hari</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4b4b4b] leading-relaxed">
            Seluruh komponen yang dibeli melalui website Hinggo dilindungi garansi fungsional selama <strong>7 hari kalender</strong> sejak tanggal barang diterima oleh pembeli.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#4b4b4b] list-disc pl-5">
            <li>Pembeli berhak menguji coba komponen pada perangkat miliknya begitu barang tiba.</li>
            <li>Jika terjadi kendala fungsi yang tidak sesuai dengan laporan pengujian teknis Hinggo, pembeli dapat mengajukan klaim garansi pada menu <strong>Pesanan Saya</strong>.</li>
            <li>Formulir pengajuan klaim mewajibkan foto bukti kendala serta tautan video pengujian pembeli (unlisted YouTube / Google Drive).</li>
            <li>Setelah hari ke-7 terlewati tanpa ada klaim aktif, transaksi dinyatakan selesai permanen dan dana penjualan diteruskan ke Consignor.</li>
          </ul>
        </section>

        {/* Section 2: Cara Rekber */}
        <section id="rekber" className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <Lock className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">2. Cara Kerja Rekening Bersama (Rekber) Hinggo</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4b4b4b] leading-relaxed">
            Hinggo bertindak sebagai pihak ketiga terpercaya (Escrow / Rekening Bersama) yang menjamin keamanan kedua belah pihak:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-4 rounded-[12px] bg-[#f6f6f4] border border-[#ebebeb] space-y-1">
              <strong className="text-ink font-bold block">1. Pembayaran Ditahan</strong>
              <p className="text-[#8a8a8a]">Uang pembeli disimpan aman di rekening resmi PT Hinggo Komputer Jaya saat checkout.</p>
            </div>
            <div className="p-4 rounded-[12px] bg-[#f6f6f4] border border-[#ebebeb] space-y-1">
              <strong className="text-ink font-bold block">2. Uji & Kirim Aman</strong>
              <p className="text-[#8a8a8a]">Barang yang dikirim telah lolos inspeksi fisik menyeluruh oleh tim teknisi bersertifikasi.</p>
            </div>
            <div className="p-4 rounded-[12px] bg-[#f6f6f4] border border-[#ebebeb] space-y-1">
              <strong className="text-ink font-bold block">3. Pencairan Dana</strong>
              <p className="text-[#8a8a8a]">Setelah garansi 7 hari tuntas tanpa komplain, dana penjualan langsung dicairkan ke rekening penjual.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Skema Fee Konsinyasi */}
        <section id="skema-fee" className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <RefreshCcw className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">3. Skema Fee Konsinyasi Hinggo</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4b4b4b] leading-relaxed">
            Hinggo tidak membebankan biaya di muka saat penitipan. Fee hanya dipotong saat barang berhasil terjual ke pembeli:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-[12px] bg-[#f6f6f4] border border-[#ebebeb]">
              <span className="text-xs font-semibold text-[#8a8a8a]">Harga Jual &le; Rp 200.000</span>
              <p className="text-lg font-extrabold text-ink mt-1">Fee Tetap Rp 10.000</p>
              <p className="text-xs text-[#8a8a8a] mt-1">Contoh: Laku Rp 180.000 &rarr; Consignor terima Rp 170.000</p>
            </div>
            <div className="p-4 rounded-[12px] bg-[#fffbeb] border border-[#ffe58a]">
              <span className="text-xs font-semibold text-yellow-800">Harga Jual &gt; Rp 200.000</span>
              <p className="text-lg font-extrabold text-yellow-900 mt-1">Fee 5% dari Harga Jual</p>
              <p className="text-xs text-yellow-800 mt-1">Contoh: Laku Rp 1.000.000 &rarr; Fee Rp 50.000, Consignor terima Rp 950.000</p>
            </div>
          </div>
        </section>

        {/* Section 4: Masa Penitipan 60 Hari */}
        <section id="masa-penitipan" className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <Clock className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">4. Masa Penitipan & Batas Waktu</h2>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-[#4b4b4b]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Masa Tayang 60 Hari:</strong> Barang ditayangkan di katalog website selama 60 hari kalender.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Perpanjangan:</strong> Saat hari ke-60 habis, Consignor dapat memperpanjang 1 kali selama 30 hari dengan harga kesepakatan baru.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
              <span><strong>Penarikan Dini:</strong> Jika Consignor ingin menarik barang sebelum 60 hari berakhir, dikenakan biaya penarikan Rp 25.000 + ongkos kirim pengembalian.</span>
            </li>
          </ul>
        </section>

        {/* Section 5: Privasi KTP */}
        <section id="privasi" className="bg-white p-6 sm:p-8 rounded-[20px] border border-[#ebebeb] shadow-xs space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <FileText className="size-6" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">5. Perlindungan Privasi Dokumen KTP</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4b4b4b] leading-relaxed">
            Foto KTP dan bukti kepemilikan disimpan dalam private bucket terenkripsi di Supabase Storage. Akses hanya diizinkan untuk Admin pemeriksa dan pemilik barang bersangkutan via short-lived signed URL. Dokumen KTP otomatis dijadwalkan untuk dihapus permanen 90 hari setelah transaksi selesai.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
