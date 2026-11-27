# Project Specification: Hinggo — Platform Consignment Komponen & Periferal Komputer Bekas (MVP)

## 1. Peran & Tujuan Utama

Bertindaklah sebagai **Senior Full-Stack Engineer & UI/UX Implementer**. Tugasmu adalah membangun aplikasi web *full-stack* bernama **Hinggo** (terkadang tertulis *Hingo* di dokumen draf) berdasarkan desain Figma dan Product Requirements Document (PRD) di bawah ini, menggunakan **Supabase** sebagai backend database & storage, hingga siap di-*deploy* secara penuh ke **Vercel**.

### Integrasi MCP & Desain Referensi
* **Supabase MCP (`project_ref=obdczozspvkdebhtyhoh`):** Gunakan tools dari **Supabase MCP** yang sudah terhubung di workspace ini untuk memeriksa skema project, menjalankan migrasi SQL/Prisma secara langsung ke database Supabase, mengatur *Storage Buckets*, dan memverifikasi data.
* **URL Figma:** `https://www.figma.com/design/xKNQ51VDVCSdk8qF8bUelM/Hinggo?node-id=0-1&p=f&t=fpg0EB5yFSMoYuBO-0`
* **Instruksi Desain (Figma MCP):**
  1. Baca token desain (*Design System*), struktur *frame* `Desktop`, dan `Mobile` secara langsung menggunakan **Figma MCP** agar warna (aksen kuning/amber khas Hinggo, latar *Light Mode*), tipografi (`Gearly` / sans-serif modern yang bersih), dan tata letak komponen presisi.
  2. Pastikan desain responsif mencakup seluruh halaman utama di Figma: `Home`, `Katalog dan Pencarian`, `Detail Produk`, `Keranjang & Checkout`, `Masuk / Daftar`, `Verifikasi Nomor HP & Identitas`, `Pengajuan Barang`, `Dasbor Barang Saya (Consignor)`, `Pesanan Saya (Pembeli)`, `Halaman Kebijakan`, dan `Dasbor Admin`.

## 2. Tech Stack & Arsitektur Supabase + Vercel

Gunakan *stack* modern yang 100% kompatibel dengan **Vercel Serverless / Edge Runtime** dan terintegrasi erat dengan **Supabase**:

* **Framework:** Next.js 14+ (App Router) dengan TypeScript.
* **Styling & UI:** Tailwind CSS + Shadcn/UI + Lucide Icons (sesuaikan tema warna dengan Figma Design System).
* **Database & ORM (Supabase PostgreSQL):**
  * Menggunakan **Supabase PostgreSQL** (`project_ref: obdczozspvkdebhtyhoh`) dengan **Prisma ORM** (gunakan `DATABASE_URL` via Supabase Connection Pooler port `6543` dengan `?pgbouncer=true` dan `DIRECT_URL` port `5432` untuk migrasi) ATAU eksekusi migrasi DDL langsung melalui **Supabase MCP**.
* **Autentikasi & Otorisasi:** Auth.js (NextAuth v5) atau custom JWT HTTP-only cookie dengan *password hashing* (`bcryptjs`) yang menyimpan data akun langsung di tabel `User` Supabase (agar pendaftaran tanpa verifikasi email OTP dan manajemen blokir/nonaktifkan akun oleh Admin berjalan mulus tanpa hambatan *rate-limit* Supabase Auth bawaan). Mendukung *role-based access control* (`USER` yang merangkap Consignor & Pembeli, serta `ADMIN`).
* **Penyimpanan File (Supabase Storage):**
  * Gunakan `@supabase/supabase-js` (dengan `SUPABASE_SERVICE_ROLE_KEY` di sisi server/API route) untuk mengelola dua *bucket* di Supabase Storage:
    1. `hinggo-public` *(Public Bucket)*: untuk foto produk saat pengajuan, foto hasil uji teknis, bukti transfer pembayaran, dan foto bukti klaim.
    2. `hinggo-private` *(Private Bucket)*: khusus untuk file **KTP** dan **bukti kepemilikan** consignor. Akses hanya melalui API route terproteksi yang menghasilkan *Short-Lived Signed URL* (`createSignedUrl`) setelah memvalidasi bahwa peminta adalah **Admin** atau **Consignor pemilik barang tersebut**.
* **Email Notifikasi:** Nodemailer (SMTP) atau Resend dengan pencatatan log pengiriman ke database Supabase.
* **Penjadwal Otomatis (Scheduler):** Vercel Cron Jobs (`/api/cron/scheduler`) + **Tombol/Kontrol Simulasi Percepatan Waktu di Dasbor Admin** untuk mempermudah pengujian/demo skenario berbasis waktu.

## 3. Ringkasan Bisnis & Batasan Lingkup MVP

* **Model Bisnis:** Hinggo menerima titipan komponen komputer bekas dari **Consignor**, melakukan pengujian fisik menyeluruh, menayangkannya di website, menjual ke **Pembeli**, memberikan garansi 7 hari, lalu mentransfer hasil penjualan dikurangi *fee* ke Consignor.
* **Kategori MVP (3 Kategori):** Hanya **RAM**, **SSD**, dan **GPU** (masing-masing memiliki *checklist* pengujian teknis khusus).
* **Perhitungan Fee Hinggo:**
  * Harga jual $\le \text{Rp}200.000 \rightarrow$ Fee tetap $\text{Rp}10.000$.
  * Harga jual $> \text{Rp}200.000 \rightarrow$ Fee $5\%$ dari harga jual akhir.
  * Consignor menerima: $\text{Harga Jual Akhir} - \text{Fee}$.
  * *Catatan:* Semua angka parameter bisnis (fee, ambang $\text{Rp}200.000$, ongkir dummy, batas asuransi $\text{Rp}500.000$, biaya penarikan $\text{Rp}25.000$, dll.) **wajib disimpan di tabel Pengaturan database**, bukan *hardcode*.
* **Pengganti Fitur Non-MVP:**
  * Pembayaran menggunakan **transfer manual + unggah bukti transfer** (diverifikasi Admin), tanpa *payment gateway*.
  * Ongkos kirim menggunakan **nominal dummy tetap** yang diatur Admin. Barang dengan harga $> \text{Rp}500.000$ otomatis dikenakan **asuransi dummy wajib** yang dibayar pembeli saat *checkout*.
  * Notifikasi dikirim via **Email otomatis + Notifikasi In-App di Dasbor**. Nomor WhatsApp wajib diisi saat registrasi untuk kontak manual oleh Admin (tanpa integrasi WhatsApp API).
  * Pendaftaran akun langsung aktif tanpa verifikasi email OTP. KTP diunggah dan diperiksa manual oleh Admin.

## 4. State Machine: 20 Status Barang & Aturan Transisi Ketat

Setiap barang memiliki tepat satu dari **20 status** berikut. Backend **wajib memvalidasi setiap perubahan status** agar hanya mengikuti transisi yang sah dan aktor yang berwenang.

### 4.1 Daftar 20 Status

1. `Diajukan` — Consignor mengisi form + unggah KTP & bukti kepemilikan. Menunggu *screening* daring.
2. `Ditolak saat screening` *(Status Akhir)* — Ditolak Admin (dengan alasan baku) atau kedaluwarsa karena resi tidak diisi dalam $2 \times 24$ jam.
3. `Disetujui, menunggu kiriman` — Lolos *screening*. Consignor harus menyetujui syarat penitipan sebelum mengisi resi.
4. `Dalam perjalanan ke Hingo` — Consignor telah mengisi nomor resi pengiriman ke Hinggo (ongkir ditanggung Consignor).
5. `Diterima, sedang diuji` — Paket tiba & dibuka dengan video. Admin mengisi *checklist* uji kategori. Jika hasil uji lebih buruk dari klaim, barang tertahan di status ini hingga Consignor sepakat penyesuaian harga atau pilih ambil kembali.
6. `Ditolak setelah pengecekan` — Gagal uji, kondisi tidak sesuai, atau rusak saat pengiriman ke Hinggo.
7. `Menunggu ongkir kembali` — Menunggu Consignor membayar ongkir kembali (dan biaya penarikan $\text{Rp}25.000$ jika ditarik sebelum masa habis) via unggah bukti transfer.
8. `Dikembalikan ke consignor` *(Status Akhir)* — Ongkir kembali terverifikasi dan barang sudah dikirim balik dengan nomor resi.
9. `Tayang` — Tampil di katalog publik website. Masa penitipan $60$ hari mulai berjalan.
10. `Ditahan menunggu pembayaran` — Pembeli menyelesaikan *checkout*. Barang dikunci selama $24$ jam menunggu bukti transfer.
11. `Dibayar, dikemas` — Bukti transfer pembeli diverifikasi Admin. Barang sedang dikemas.
12. `Dikirim ke pembeli` — Admin mengisi nomor resi pengiriman ke pembeli.
13. `Diterima pembeli` — Barang tiba. Masa garansi $7$ **hari** mulai berjalan sejak tanggal diterima.
14. `Klaim diproses` — Pembeli mengajukan klaim dalam masa garansi $7$ hari disertai foto & tautan video bukti.
15. `Klaim: cacat tersembunyi` *(Akhir Transaksi)* — Cacat tidak mungkin terdeteksi saat pengujian. Consignor tidak dibayar; barang kembali ke Hinggo lalu masuk ke `Menunggu ongkir kembali`.
16. `Klaim: kesalahan Hingo` *(Akhir Transaksi)* — Cacat seharusnya terdeteksi / laporan uji keliru. Pembeli di-*refund*, barang diuji ulang dan kembali `Tayang`.
17. `Siap dibayar ke consignor` — Dana pembeli sudah masuk dan masa garansi $7$ hari lewat tanpa klaim.
18. `Consignor sudah dibayar` *(Status Akhir)* — Admin telah mentransfer hasil penjualan (dikurangi *fee*) dan mengunggah/mencatat bukti transfer.
19. `Masa penitipan habis` — Hari ke-$60$ sejak pertama `Tayang` terlewati. Menunggu keputusan Consignor maksimal $3 \times 24$ jam.
20. `Klaim: kesalahan pengiriman` *(Akhir Transaksi)* — Barang rusak saat pengiriman ke pembeli (ditangani Hinggo dengan ekspedisi di luar sistem MVP).

### 4.2 Matriks Transisi Valid (Wajib Ditegakkan di API)

* `Diajukan` $\rightarrow$ `Ditolak saat screening` (Admin, alasan baku wajib)
* `Diajukan` $\rightarrow$ `Disetujui, menunggu kiriman` (Admin)
* `Disetujui, menunggu kiriman` $\rightarrow$ `Dalam perjalanan ke Hingo` (Consignor, syarat: sudah centang persetujuan syarat)
* `Disetujui, menunggu kiriman` $\rightarrow$ `Ditolak saat screening` (Sistem, jika $> 2 \times 24$ jam belum isi resi)
* `Dalam perjalanan ke Hingo` $\rightarrow$ `Diterima, sedang diuji` (Admin)
* `Diterima, sedang diuji` $\rightarrow$ `Tayang` (Admin, syarat: laporan uji LULUS & harga tayang ditetapkan)
* `Diterima, sedang diuji` $\rightarrow$ `Ditolak setelah pengecekan` (Admin)
* `Diterima, sedang diuji` $\rightarrow$ `Menunggu ongkir kembali` (Admin, jika hasil uji lebih buruk & Consignor memilih ambil kembali)
* `Ditolak setelah pengecekan` $\rightarrow$ `Menunggu ongkir kembali` (Admin, setelah alasan dicatat)
* `Menunggu ongkir kembali` $\rightarrow$ `Dikembalikan ke consignor` (Admin, setelah bukti transfer ongkir kembali & biaya penarikan diverifikasi + resi balik diisi)
* `Tayang` $\rightarrow$ `Ditahan menunggu pembayaran` (Sistem, saat Pembeli *checkout* — gunakan *database transaction / row locking* PostgreSQL `FOR UPDATE` untuk mencegah *race condition* 2 pembeli *checkout* bersamaan)
* `Ditahan menunggu pembayaran` $\rightarrow$ `Tayang` (Sistem, jika $24$ jam lewat tanpa bukti transfer)
* `Ditahan menunggu pembayaran` $\rightarrow$ `Dibayar, dikemas` (Admin, bukti transfer valid)
* `Dibayar, dikemas` $\rightarrow$ `Dikirim ke pembeli` (Admin, resi diisi)
* `Dikirim ke pembeli` $\rightarrow$ `Diterima pembeli` (Admin, tanggal terima diisi)
* `Diterima pembeli` $\rightarrow$ `Klaim diproses` (Pembeli, maksimal $7$ hari sejak tanggal diterima)
* `Diterima pembeli` $\rightarrow$ `Siap dibayar ke consignor` (Sistem, jika $7$ hari garansi lewat tanpa klaim aktif)
* `Klaim diproses` $\rightarrow$ `Klaim: cacat tersembunyi` | `Klaim: kesalahan Hingo` | `Klaim: kesalahan pengiriman` | `Diterima pembeli` (Admin)
* `Klaim: cacat tersembunyi` $\rightarrow$ `Menunggu ongkir kembali` (Admin)
* `Klaim: kesalahan Hingo` $\rightarrow$ `Tayang` (Admin, setelah uji ulang)
* `Siap dibayar ke consignor` $\rightarrow$ `Consignor sudah dibayar` (Admin, pencatatan transfer)
* `Tayang` $\rightarrow$ `Masa penitipan habis` (Sistem, hari ke-$60$)
* `Masa penitipan habis` $\rightarrow$ `Tayang` (Consignor pilih perpanjang $1\times$ untuk $30$ hari dengan harga kesepakatan baru)
* `Masa penitipan habis` $\rightarrow$ `Menunggu ongkir kembali` (Consignor pilih ambil kembali, atau Sistem otomatis setelah $3 \times 24$ jam tanpa respons)
* `Tayang` $\rightarrow$ `Menunggu ongkir kembali` (Consignor ajukan penarikan dini dengan biaya penarikan $\text{Rp}25.000$ $\rightarrow$ diproses Admin)

*Aturan Tambahan:*
* Status akhir (`Ditolak saat screening`, `Dikembalikan ke consignor`, `Consignor sudah dibayar`) **terkunci permanen** dan tidak bisa diubah lagi. Koreksi hanya melalui penambahan catatan audit.
* Barang dengan status selain `Tayang` **tidak muncul di katalog**, dan jika URL halaman produknya dibuka langsung, wajib menampilkan label **"Tidak tersedia"** serta menonaktifkan tombol beli/keranjang.

## 5. Aturan Berbasis Waktu & Mekanisme Demo

Implementasikan *scheduler* yang mengevaluasi aturan berikut:

1. **Batas Isi Resi Pengiriman:** $2 \times 24$ jam sejak `Disetujui, menunggu kiriman` $\rightarrow$ otomatis kedaluwarsa (`Ditolak saat screening`).
2. **Penahanan Pesanan (Order Hold):** $24$ jam sejak *checkout* $\rightarrow$ pengingat jam ke-$12$; jika belum ada bukti transfer di jam ke-$24$, pesanan batal otomatis dan barang kembali `Tayang`.
3. **Usulan Penurunan Harga Otomatis:**
   * Barang harga $\ge \text{Rp}200.000$: Usulan turun $5\%$ dari harga awal pada **hari ke-21, ke-36, dan ke-50** sejak pertama `Tayang`.
   * Barang harga $< \text{Rp}200.000$: Usulan turun $10\%$ satu kali pada **hari ke-30**.
   * **Batasan:** Nominal usulan tidak boleh lebih rendah dari `harga_minimum` yang ditetapkan Consignor di awal.
   * **Batas Respons:** $3$ hari (dengan $1\times$ pengingat). Jika tanpa jawaban, usulan dianggap ditolak dan harga tetap.
4. **Masa Penitipan & Perpanjangan:**
   * Pengingat $7$ hari sebelum hari ke-$60$.
   * Hari ke-$60$: status berubah menjadi `Masa penitipan habis`.
   * Batas keputusan akhir masa: $3 \times 24$ jam. Jika tidak direspons, otomatis masuk `Menunggu ongkir kembali`.
   * Perpanjangan hanya dapat dilakukan **1 kali selama** $30$ **hari**.
5. **Batas Pembayaran Ongkir Kembali:** $1 \times 24$ jam sejak `Menunggu ongkir kembali`. Jika lewat, barang tetap disimpan Hinggo (status tetap `Menunggu ongkir kembali`, halaman publik bertanda `Tidak tersedia`) hingga Consignor melunasi.
6. **Masa Garansi Pembeli:** $7$ hari sejak `Diterima pembeli`. Formulir klaim otomatis terkunci setelah hari ke-$7$.
7. **Retensi Dokumen KTP:** Tandai/hapus file KTP $90$ hari setelah status akhir tercapai (kecuali ada sengketa/klaim).
8. **Fitur Percepatan Waktu (Wajib untuk Demo MVP):** Di menu **Pengaturan Admin**, sediakan kontrol untuk mempercepat simulasi waktu (misalnya *time-offset* / tombol *"Majukan Waktu +1 Hari / +12 Jam / +60 Hari"* dan tombol *"Jalankan Scheduler Sekarang"*) sehingga seluruh skenario berbasis waktu dapat didemokan secara *real-time* saat presentasi.

## 6. Rincian 28 Fitur Fungsional (Checklist Implementasi)

### A. Modul Consignor (Fitur 1–7)
1. **Akun Consignor:** Registrasi & login (satu akun bisa bertindak sebagai Consignor maupun Pembeli). Profil menyimpan info rekening bank (Nama Bank, No. Rekening, Atas Nama).
2. **Formulir Pengajuan Barang:** Input kategori (`RAM`, `SSD`, `GPU`), merek, model, kondisi fisik, lama pemakaian, kelengkapan, foto barang (multi-upload ke Supabase Storage `hinggo-public`), harga yang diinginkan, dan harga minimum.
3. **Unggah KTP & Bukti Kepemilikan:** Wajib saat pengajuan (KTP + salah satu dari: nota/screenshot pembelian, foto dus asli, atau foto *serial number* + kertas bertulis nama & tanggal) + centang pernyataan kepemilikan. Disimpan di *private bucket* Supabase (`hinggo-private`), hanya bisa dibuka via *signed URL* oleh pemilik dan Admin.
4. **Persetujuan Syarat Penitipan:** Consignor wajib menyetujui syarat (*fee*, ongkir, pencairan setelah garansi $7$ hari, mekanisme usulan turun harga, aturan akhir masa) sebelum dapat mengisi resi. Tercatat dengan *timestamp*.
5. **Dasbor Consignor:** Daftar semua barang milik sendiri (isolasi data ketat antar consignor), filter status, riwayat perubahan harga, kotak tindakan untuk usulan penurunan harga yang menunggu persetujuan, dan rincian pendapatan (harga jual, *fee*, bersih diterima).
6. **Isi Resi Pengiriman:** Input kurir & nomor resi $\rightarrow$ mengubah status ke `Dalam perjalanan ke Hingo`.
7. **Keputusan Consignor atas Barang:**
   * Setujui / tolak usulan penurunan harga.
   * Saat `Masa penitipan habis`: pilih **Perpanjang** atau **Ambil Kembali**.
   * Saat `Tayang`: ajukan **Penarikan Barang Dini** (dikenai biaya penarikan $\text{Rp}25.000$ + ongkir kembali).
   * Unggah bukti transfer pembayaran ongkir kembali & biaya penarikan.

### B. Modul Pembeli (Fitur 8–14)
8. **Akun Pembeli:** Daftar & masuk dengan email + kata sandi (serta nomor WhatsApp).
9. **Katalog Publik:** Menampilkan hanya barang berstatus `Tayang`. Dilengkapi pencarian teks, filter kategori (`RAM`, `SSD`, `GPU`), rentang harga, kondisi, serta pengurutan (Terbaru, Harga Terendah, Harga Tertinggi).
10. **Halaman Detail Produk:** Galeri foto produk & foto hasil uji, spesifikasi lengkap, harga, laporan uji teknis (checklist), *embed* video YouTube pengujian (unlisted), tanggal uji, kelengkapan, ketentuan garansi $7$ hari, dan penghitung *view* unik/pembeli. Tanpa identitas Consignor.
11. **Keranjang & Checkout:**
    * Barang di keranjang **belum ditahan**. Jika barang terjual lebih dulu oleh orang lain, barang otomatis dikeluarkan dari keranjang dengan notifikasi peringatan.
    * Satu pesanan dapat berisi lebih dari satu barang (termasuk dari Consignor berbeda), namun status pengiriman & klaim dilacak per item.
    * Otomatis menghitung ongkir dummy + asuransi dummy wajib untuk setiap item berharga $> \text{Rp}500.000$.
    * Submit *checkout* mengunci barang selama $24$ jam (`Ditahan menunggu pembayaran`).
12. **Pembayaran & Riwayat Pesanan:** Menampilkan instruksi transfer ke rekening Hinggo, hitung mundur $24$ jam, unggah bukti transfer, dan pelacakan status pesanan.
13. **Klaim Garansi:** Form pengajuan klaim khusus untuk item berstatus `Diterima pembeli` yang masih dalam masa $7$ hari. Wajib mengisi alasan, unggah foto bukti, dan menempel tautan video bukti (*unlisted* YouTube/drive).
14. **Halaman Kebijakan:** Halaman statis/informatif mengenai ketentuan garansi $7$ hari dan prosedur retur, dapat diakses dari navbar/footer maupun halaman produk.

### C. Modul Admin (Fitur 15–24)
15. **Dasbor Admin:** Ringkasan KPI jumlah barang per status, akumulasi total *fee* Hinggo, dan daftar tugas prioritas (*Action Items*: pengajuan baru, bukti transfer masuk, klaim baru, barang siap dibayar ke consignor).
16. **Antrean Screening:** Review data & dokumen privat (KTP & bukti kepemilikan via *signed URL*) $\rightarrow$ Setujui atau Tolak dengan pilihan alasan baku dari daftar pengaturan.
17. **Penerimaan & Laporan Uji:** Form *checklist* pengujian dinamis sesuai kategori:
    * **RAM:** Kapasitas & kecepatan terbaca sesuai spek, tes stabilitas memori (MemTest86/TM5) bebas *error*, pin emas bersih/tidak korosi, fisik tidak patah/melengkung.
    * **SSD:** Kesehatan/Health (CrystalDiskInfo) $\ge$ klaim, kecepatan baca/tulis (CrystalDiskMark) normal, suhu operasional aman, tidak ada *bad sector*.
    * **GPU:** Suhu *idle* & *full load* (FurMark/3DMark) aman, *fan* berputar normal tanpa suara kasar, *port display* (HDMI/DP) berfungsi semua, bebas *artifact*, segel/kondisi fisik sesuai.
    * Input foto hasil uji, tautan video YouTube, kelengkapan aktual, dan kesimpulan (`Lulus` atau `Gagal`).
18. **Penetapan Harga:** Input harga tayang awal yang disepakati dengan Consignor, serta ubah harga atas permintaan Consignor (tercatat di riwayat harga).
19. **Ubah Status Barang:** Kontrol transisi status yang hanya menampilkan opsi valid sesuai Tabel 4.2.
20. **Pencatatan Penjualan & Pengiriman:** Verifikasi bukti transfer pembeli (atau tolak jika tidak valid), input nomor resi pengiriman ke pembeli, dan input tanggal barang diterima pembeli.
21. **Proses Klaim:** Tinjau bukti klaim pembeli dan tetapkan keputusan (`Cacat tersembunyi`, `Kesalahan Hingo`, `Kesalahan pengiriman`, atau `Tidak valid`).
22. **Antrean Pembayaran Consignor:** Menampilkan daftar item berstatus `Siap dibayar ke consignor` lengkap dengan rincian harga jual, *fee*, nominal bersih transfer, dan nomor rekening Consignor. Input bukti transfer $\rightarrow$ status berubah ke `Consignor sudah dibayar`.
23. **Pengaturan Sistem:** Edit parameter fee ($\text{Rp}10.000$ & $5\%$), ambang fee ($\text{Rp}200.000$), ongkir dummy, asuransi dummy, ambang asuransi ($\text{Rp}500.000$), biaya penarikan ($\text{Rp}25.000$), daftar alasan penolakan baku, serta **Kontrol Percepatan Jadwal Demo**.
24. **Manajemen Pengguna:** Daftar akun Consignor & Pembeli, tombol aktifkan / nonaktifkan akun. Tolak penonaktifan standar jika user masih memiliki barang aktif atau pesanan berjalan, kecuali Admin memilih **Nonaktifkan Paksa** dengan catatan wajib (otomatis menyembunyikan barang dari katalog dan membatalkan pesanan yang belum dibayar).

### D. Modul Sistem & Audit (Fitur 25–28)
25. **Penjadwal Otomatis:** Eksekusi seluruh aturan berbasis waktu di Bagian 5.
26. **Kalkulator Fee Otomatis:** Menghitung *fee* dan hak Consignor secara akurat di setiap transaksi.
27. **Audit Log & Riwayat Tidak Terubah (*Append-Only*):** Tabel `StatusHistory`, `PriceHistory`, dan `PriceDropProposal` hanya menerima operasi `INSERT` (dilarang `UPDATE`/`DELETE` di level aplikasi maupun PostgreSQL trigger/RLS), mencatat aktor, waktu, dan catatan. Mencatat pula jumlah tampilan produk (*product views*).
28. **Sistem Notifikasi & Log Email:** Mengirim email otomatis + membuat notifikasi in-app untuk seluruh peristiwa di PRD (Consignor, Pembeli, dan Admin). Jika SMTP gagal atau belum dikonfigurasi di environment demo, tangkap *error* dengan anggun dan catat status `GAGAL` di tabel `NotificationLog` yang dapat dipantau di Dasbor Admin (tanpa membuat aplikasi *crash*).

## 7. Skema Database Supabase (16 Entitas)

Rancang skema Prisma / PostgreSQL di Supabase (`project_ref: obdczozspvkdebhtyhoh`) yang mencakup seluruh 16 kelompok data dari PRD:

1. `User` (nama, email, passwordHash, whatsapp, role `USER`/`ADMIN`, isActive, forceDeactivatedNote, bankName, bankAccountNumber, bankAccountHolder, shippingAddress)
2. `Item` (consignorId, category `RAM`/`SSD`/`GPU`, brand, model, condition, usageDuration, completeness, photos\[\], desiredPrice, minPrice, currentPrice, status, firstListedAt, consignmentEndsAt, extensionUsed, viewCount)
3. `ItemDocument` (itemId, ktpStoragePath, ownershipProofStoragePath, ownershipProofType, ownershipDeclared, ktpDeleteScheduledAt)
4. `TermsAgreement` (itemId, consignorId, agreedAt)
5. `TestReport` (itemId, testedAt, checklistJson, testPhotos\[\], youtubeUrl, actualCompleteness, passed, notes)
6. `CartItem` (userId, itemId, addedAt)
7. `Order` (buyerId, shippingAddress, shippingCost, insuranceCost, totalAmount, checkedOutAt, holdExpiresAt, paymentProofUrl, status)
8. `OrderItem` (orderId, itemId, soldPrice, feeAmount, consignorNetAmount, trackingNumber, deliveredAt, warrantyEndsAt)
9. `Claim` (orderItemId, reason, evidencePhotos\[\], evidenceVideoUrl, status, resolutionType, adminNotes, createdAt, resolvedAt)
10. `ConsignorPayout` (orderItemId, consignorId, amount, paidAt, transferProofUrl)
11. `ItemReturn` (itemId, reason, returnShippingCost, withdrawalFee, paymentProofUrl, returnTrackingNumber, status)
12. `PriceDropProposal` (itemId, proposedPrice, proposedAt, expiresAt, response `PENDING`/`ACCEPTED`/`REJECTED`/`EXPIRED`, respondedAt)
13. `StatusHistory` (itemId, oldStatus, newStatus, actorId, actorRole, note, createdAt)
14. `PriceHistory` (itemId, oldPrice, newPrice, reason, actorId, createdAt)
15. `SystemSetting` (singleton config untuk seluruh tarif, ambang batas, waktu, daftar alasan penolakan, dan `timeOffsetHours` untuk demo)
16. `NotificationLog` (userId, channel `EMAIL`/`DASHBOARD`, eventType, title, message, isRead, emailStatus `SENT`/`FAILED`/`SKIPPED`, errorMessage, createdAt)

## 8. Setup Supabase, Data Seeding & Deployment Vercel

1. **Konfigurasi Supabase (via Supabase MCP & Client SDK):**
   * Buat seluruh tabel (16 entitas) di project Supabase `obdczozspvkdebhtyhoh`.
   * Buat 2 Storage Bucket di Supabase: `hinggo-public` (Public: `true`) dan `hinggo-private` (Public: `false`).
   * Aktifkan Row Level Security (RLS) pada tabel-tabel sensitif (`ItemDocument`, `User`, `StatusHistory`, `PriceHistory`) agar akses dari client anonim tertutup rapat (seluruh mutasi bisnis divalidasi melalui Next.js Server Actions / API Routes menggunakan Prisma / Service Role).
2. **Database Seeding (`prisma/seed.ts`):**
   * Buat 1 akun **Admin** default (`admin@hinggo.id` / `Admin123!`).
   * Buat 2 akun **Consignor** dan 2 akun **Pembeli** uji.
   * Buat beberapa contoh barang (`RAM DDR4 16GB`, `SSD NVMe 1TB`, `GPU RTX 3060 12GB`) di berbagai status (termasuk yang sudah `Tayang` lengkap dengan laporan uji & tautan video YouTube valid agar katalog langsung hidup saat dibuka).
   * Isi nilai default `SystemSetting` sesuai PRD.
3. **Kompatibilitas Build & Deploy Vercel:**
   * Pastikan `npm run build` dan `npx tsc --noEmit` berjalan mulus tanpa *error* atau *warning* yang memblokir *build* Vercel.
   * Sediakan file `.env.example` yang mendokumentasikan semua variabel lingkungan yang dibutuhkan di Vercel:
     * `DATABASE_URL` (Supabase Transaction Pooler URI)
     * `DIRECT_URL` (Supabase Session/Direct URI untuk Prisma)
     * `NEXT_PUBLIC_SUPABASE_URL`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     * `SUPABASE_SERVICE_ROLE_KEY`
     * `AUTH_SECRET`
     * `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
     * `CRON_SECRET`
   * Buat `vercel.json` untuk mendaftarkan *cron job* `/api/cron/scheduler`.
   * Jika variabel `SUPABASE_SERVICE_ROLE_KEY` atau `SMTP_HOST` belum diisi saat pengujian lokal awal, sediakan *fallback* yang aman agar aplikasi tidak *error* saat demo.

## 9. Rencana Eksekusi Bertahap

Kerjakan proyek ini secara berurutan dan verifikasi setiap tahap sebelum lanjut ke tahap berikutnya:

1. **Tahap 1 — Inisialisasi & Inspeksi Desain & MCP:** Setup proyek Next.js + Tailwind + Prisma + `@supabase/supabase-js`. Verifikasi koneksi **Supabase MCP** (`obdczozspvkdebhtyhoh`) dan baca token desain dari **Figma MCP** untuk menerapkan *Design System* Hinggo.
2. **Tahap 2 — Database Supabase, Storage Buckets & Seed:** Implementasikan skema Prisma/SQL (16 entitas), buat bucket `hinggo-public` & `hinggo-private` di Supabase, jalankan migrasi, dan jalankan `seed.ts`.
3. **Tahap 3 — Core Engine & API:** Bangun *State Machine* 20 status, kalkulator *fee*, helper *Signed URL* Supabase Storage privat/publik, dan *Scheduler* + fitur *Time-Travel* demo.
4. **Tahap 4 — Antarmuka Publik & Pembeli:** Bangun `Home`, `Katalog` (filter & pencarian), `Detail Produk` (laporan uji & embed YouTube), `Keranjang & Checkout` (dengan *race-condition lock* PostgreSQL), `Riwayat Pesanan`, `Klaim Garansi`, dan `Halaman Kebijakan`.
5. **Tahap 5 — Antarmuka Consignor:** Bangun `Pengajuan Barang` (multi-step + upload KTP/kepemilikan ke bucket privat + persetujuan syarat), `Dasbor Consignor`, input resi, respons usulan penurunan harga, perpanjangan/penarikan, dan pembayaran ongkir kembali.
6. **Tahap 6 — Antarmuka Admin:** Bangun `Dasbor Admin`, `Screening` (dengan viewer *Signed URL* KTP), `Uji Kategori (RAM/SSD/GPU)`, `Manajemen Transaksi & Pengiriman`, `Proses Klaim`, `Antrean Payout Consignor`, `Manajemen User`, dan `Pengaturan + Percepatan Waktu`.
7. **Tahap 7 — Verifikasi 8 Skenario Uji (PRD Bagian 9.2):** Jalankan verifikasi menyeluruh untuk jalur lancar, penolakan, penahanan 24 jam & *race condition* checkout, klaim cacat tersembunyi vs kesalahan Hinggo, usulan penurunan harga, akhir masa 60 hari, isolasi hak akses KTP/barang, dan pengembalian/penarikan barang. Pastikan `npm run build` sukses 100% siap *deploy* ke Vercel.