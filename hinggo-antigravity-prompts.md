# Hinggo - Panduan Prompt Antigravity

Dokumen ini berisi prompt bertahap untuk Antigravity. Cara pakai:

1. Tempel bagian **ATURAN PROYEK** sekali di awal, sebagai rules proyek atau sebagai pesan pertama.
2. Kerjakan step **satu per satu** secara berurutan. Salin isi kotak kode tiap step ke chat Antigravity.
3. Jangan lanjut ke step berikutnya sebelum bagian **Selesai kalau** di step itu terpenuhi.
4. Kalau Antigravity minta izin untuk hal yang ada di daftar "Wajib minta persetujuan", baca dulu rencananya sebelum menyetujui.

Data proyek:
- File Figma: https://www.figma.com/design/xKNQ51VDVCSdk8qF8bUelM/Hinggo
- File key Figma: `xKNQ51VDVCSdk8qF8bUelM`
- Produksi: https://hinggo.vercel.app
- Stack: Next.js (App Router) + TypeScript + Supabase, deploy di Vercel
- Deadline: 2 minggu. Pembayaran masih simulasi.

Peringatan keamanan: **jangan pernah menempel API key atau secret ke chat**, termasuk `service_role`. Sebut nama variabelnya saja.

---

## ATURAN PROYEK (tempel sekali di awal)

```
Kamu bekerja di proyek "Hinggo", marketplace titip jual peripheral komputer preloved
(admin Hinggo mengecek, menyimpan, memasarkan, dan mengirim barang milik penitip).
Stack: Next.js App Router, TypeScript, Supabase, Vercel. Bahasa antarmuka: Indonesia.

SUMBER DESAIN
- File Figma: https://www.figma.com/design/xKNQ51VDVCSdk8qF8bUelM/Hinggo (fileKey: xKNQ51VDVCSdk8qF8bUelM)
- Utamakan Figma MCP: baca frame lewat node ID yang disebut di tiap step.
- Kalau Figma MCP gagal atau tidak mengembalikan data, pakai "Spesifikasi cadangan" yang ada di prompt.
- Setiap layar punya versi Desktop (lebar 1440) dan Mobile (lebar 390). Bangun SATU codebase
  responsif. Jangan membuat dua halaman terpisah. Breakpoint desktop mulai sekitar 1024px.

ATURAN KERJA
1. Kerjakan HANYA step yang sedang diminta. Jangan memperluas cakupan.
2. Jangan menulis, mencetak, atau meng-commit nilai API key/secret. Jangan commit file .env.
   Hanya sebut NAMA variabel environment.
3. WAJIB minta persetujuan (tulis rencana dulu, lalu berhenti dan tunggu) sebelum:
   - mengubah skema tabel Supabase (migration, kolom, tabel baru),
   - menambah/mengubah/menghapus RLS policy,
   - menghapus atau menimpa data di database,
   - menambah dependency besar.
4. Tampilan mengikuti Figma. Jangan mengarang warna, font, atau teks. Teks UI persis seperti di Figma.
5. Gunakan komponen yang bisa dipakai ulang (Header, Footer, ProductCard, Chip, Button, dll).
   Cek komponen yang sudah ada sebelum membuat yang baru.
6. Setiap step ditutup dengan: jalankan `npm run build` (harus lolos tanpa error TypeScript),
   lalu laporkan file apa saja yang berubah. Lakukan `git commit` dengan pesan yang jelas.
7. Jangan klaim "berhasil" tanpa bukti. Sertakan output perintah atau hasil request yang kamu jalankan.
8. Kalau ragu atau data tidak cukup, tanya. Jangan menebak.

DESIGN TOKEN (perkiraan dari screenshot, VERIFIKASI ke Figma lalu pakai nilai Figma kalau berbeda)
- Kuning utama (tombol, badge, logo): sekitar #FFC72C
- Krem lembut (latar section/chip aktif): sekitar #FFFBE6 s.d. #FFF3C4
- Hitam/arang (footer, teks utama): sekitar #1A1A1A
- Hijau (ikon "Dicek tim"): hijau lembut
- Kartu: putih, border tipis abu-abu muda, sudut membulat sedang
- Tombol: sudut membulat; primer kuning teks hitam, sekunder putih dengan border
- Font: sans-serif geometris (tampak seperti Plus Jakarta Sans). Konfirmasi nama font di Figma.
```

---

## Peta layar Figma (node ID)

| Layar | Desktop (1440) | Mobile (390) |
|---|---|---|
| Beranda | `1:2` (frame "01 · Home") | `48:2963` (Beranda), `48:3198` (setelah digulir) |
| Katalog dan pencarian | `10:25047` | `10:25319` |
| Detail produk | `10:25521` | `10:25655` |
| Keranjang | `10:25747` | `10:25867` |
| Masuk atau daftar | `10:25941` | `10:26026` |
| Verifikasi nomor HP | `10:26079` | `10:26164` |
| Verifikasi identitas | `10:26217` | `10:26343` |
| Chat admin produk | `10:26423` | `10:26544` |
| Chat admin dan CS | `10:26610` | `10:26735` |
| Checkout dan pembayaran | `10:26798` | `10:26966` |
| Detail transaksi dan status pesanan | `10:27088` | `10:27286` |
| Pengajuan titip jual | `14:12784` | `14:12992` |
| Barang titipan saya | `14:13159` | `14:13435` |
| Detail barang titipan | `14:13670` | `14:13929` |

---

# BAGIAN A - STABILKAN DULU

## Step 0 - Cadangan dan branch

```
STEP 0: Amankan kode.
1. Jalankan `git status` dan tampilkan hasilnya.
2. Pastikan file .env* dan secret TIDAK ikut ter-track. Kalau ada yang ter-track, hentikan dan laporkan
   (jangan tampilkan isinya).
3. Commit semua perubahan yang ada dengan pesan "chore: cadangan sebelum stabilisasi".
4. Buat dan pindah ke branch baru bernama `fix/stabilize`.
5. Tampilkan hasil `git log --oneline -5` dan `git branch --show-current`.
```

Selesai kalau: branch aktif `fix/stabilize` dan commit cadangan ada di log.

## Step 1 - Audit dan diagnosis (hanya membaca, jangan mengubah apa pun)

```
STEP 1: Diagnosis. Di step ini JANGAN mengubah file, database, atau pengaturan apa pun.
Hanya baca dan laporkan.

Gejala yang dilaporkan pengguna:
- Halaman di produksi (hinggo.vercel.app) menampilkan error mulai dari API key dan data database.
- Keranjang dan wishlist hilang setelah halaman di-refresh.

Lakukan:
1. Daftar SEMUA variabel environment yang dipakai kode (cari `process.env.` dan `NEXT_PUBLIC_`).
   Tulis tabelnya: nama variabel | dipakai di file mana | dipakai di client atau server.
   JANGAN tampilkan nilainya.
2. Bandingkan dengan `.env.local` (hanya NAMA variabelnya, bukan nilai). Tandai variabel yang
   dipakai kode tapi tidak ada di .env.local, dan sebaliknya.
3. Cek bagaimana client Supabase dibuat (file mana, key jenis apa: anon atau service_role).
   Laporkan kalau key service_role dipakai di kode yang bisa dijalankan di browser, atau variabel
   rahasia memakai prefix NEXT_PUBLIC_.
4. Lewat MCP Supabase (gunakan mode baca saja kalau tersedia): daftar tabel di schema public,
   status RLS tiap tabel (aktif/tidak), dan policy yang ada. Hitung jumlah baris tabel produk.
5. Jalankan aplikasi lokal (`npm run dev`) dan uji endpoint utama dengan permintaan nyata:
   produk/katalog, cart, wishlist, auth session. Catat status HTTP dan pesan error masing-masing.
6. Cari di kode di mana keranjang dan wishlist disimpan (state memori, localStorage, atau Supabase)
   dan jelaskan kenapa data hilang saat refresh.
7. Tulis laporan akhir: daftar masalah berurutan dari yang paling parah, penyebab akar tiap masalah,
   dan rencana perbaikan. Berhenti di sini dan tunggu persetujuan.
```

Selesai kalau: ada laporan masalah + rencana. **Baca laporannya sebelum lanjut**, dan kalau ada saran perubahan RLS/skema, putuskan sendiri apakah disetujui.

## Step 2 - Perbaiki koneksi Supabase dan environment

```
STEP 2: Perbaiki koneksi Supabase dan environment berdasarkan laporan Step 1. Kerjakan hanya
masalah yang sudah kamu buktikan di Step 1.

1. Rapikan pembuatan client Supabase: satu util untuk browser (anon key) dan satu util untuk
   server. Key rahasia tidak boleh dipakai di kode client dan tidak boleh berawalan NEXT_PUBLIC_.
2. Buat file `.env.example` berisi NAMA variabel yang dibutuhkan beserta komentar kegunaannya
   (tanpa nilai). Pastikan `.env*` ada di .gitignore.
3. Tambahkan penanganan error yang jelas di lapisan data: kalau variabel wajib kosong, lempar
   error dengan pesan "Variabel X belum diisi" (nama variabel saja).
4. Berikan daftar langkah untuk saya mengisi/mengecek Environment Variables di dashboard Vercel
   (Settings > Environment Variables) untuk Production dan Preview. Saya yang mengisi nilainya.
5. Kalau perlu mengubah RLS policy atau skema agar katalog bisa dibaca publik, TULIS RENCANANYA
   (SQL dan alasannya) dan tunggu persetujuan saya. Jangan jalankan sendiri.
6. Uji ulang endpoint dari Step 1 dan tampilkan hasil sebelum/sesudah.
7. `npm run build`, lalu commit: "fix: perbaiki koneksi supabase dan env".
```

Selesai kalau: endpoint katalog mengembalikan data di lokal, `.env.example` ada, dan kamu sudah mengisi variabel di Vercel lalu redeploy. Cek `hinggo.vercel.app/catalog` — produk muncul tanpa error.

## Step 3 - Keranjang dan wishlist tidak hilang saat refresh

```
STEP 3: Persistensi keranjang dan wishlist.

Perilaku yang diinginkan:
- Tamu (belum login): keranjang dan wishlist disimpan di localStorage.
- Setelah login: data disimpan di Supabase per akun. Saat login pertama kali, GABUNGKAN isi
  localStorage ke akun (hilangkan duplikat berdasarkan id barang), lalu kosongkan localStorage.
- Barang preloved hanya tersedia 1 (stok 1): jumlah per barang maksimal sama dengan stok.
- Setelah refresh, isi keranjang dan wishlist harus sama seperti sebelumnya.
- Badge jumlah di ikon keranjang di header selalu sinkron dengan isi keranjang.

Lakukan:
1. Buat satu store/context untuk cart dan wishlist dengan antarmuka yang sama untuk kedua mode
   (tamu dan login). Komponen tidak perlu tahu data disimpan di mana.
2. Wrap akses localStorage dengan try/catch dan pastikan tidak error saat server-side rendering
   (hindari hydration mismatch).
3. Sambungkan ke route API cart/wishlist yang sudah ada. Kalau perlu tabel baru atau kolom baru,
   TULIS RENCANANYA dan tunggu persetujuan.
4. Uji: tambah barang -> refresh -> barang masih ada (tamu). Login -> data tergabung -> refresh ->
   masih ada. Logout -> perilaku kembali ke mode tamu. Laporkan hasil tiap skenario.
5. `npm run build`, lalu commit: "fix: persistensi keranjang dan wishlist".
```

Selesai kalau: skenario tamu dan login lolos di uji manual.

---

# BAGIAN B - SAMAKAN TAMPILAN DENGAN FIGMA

## Step 4 - Fondasi: token, header, footer, kartu produk

```
STEP 4: Fondasi tampilan. Baca Figma lewat MCP: frame Beranda desktop (node 1:2) dan Katalog
desktop (node 10:25047) untuk header/footer/kartu, plus Beranda mobile (node 48:2963).

1. Ambil design token dari Figma (warna, font, ukuran teks, radius, bayangan, spacing) dan
   jadikan CSS variables / konfigurasi tema. Hapus warna dan font hardcode yang tidak sesuai.
2. Bandingkan komponen yang sudah ada dengan Figma dan perbaiki: Header (logo "H" kuning + "Hingo",
   kolom cari "Cari barang preloved impianmu...", menu Kategori / Promo / Titip jual, ikon chat,
   wishlist, keranjang, tombol kuning akun), strip info krem di bawah header, Footer gelap
   (kolom Belanja / Bantuan / Hingo), ProductCard, Chip, Button.
3. Mobile: header ringkas dan bar pencarian + navigasi bawah yang menempel (lihat frame mobile
   Beranda, bagian "Pencarian dan navigasi tetap").
4. Jangan mengubah logika data. Hanya tampilan.
5. Tampilkan perbandingan sebelum/sesudah (screenshot lokal di lebar 390 dan 1440 kalau bisa).
6. `npm run build`, lalu commit: "style: token, header, footer, kartu produk".
```

Spesifikasi cadangan (kalau MCP gagal):
- Header: logo kotak kuning berisi huruf "H" + teks "Hingo" tebal; kolom cari lebar dengan placeholder "Cari barang preloved impianmu..."; menu "Kategori", "Promo", "Titip jual"; ikon chat, hati, keranjang; tombol kuning di kanan (di desain contoh tertulis "Naya" = nama pengguna; kalau belum login tampilkan "Masuk").
- Strip krem di bawah header: kiri "Titip jual gear. Kami cek, simpan, dan pasarkan.", kanan "Konsinyasi dikelola tim kami · Pusat bantuan".
- Footer hitam: logo + deskripsi "Titip jual peripheral preloved. Kami cek, simpan, pasarkan lewat media sosial, dan kirim ke pembeli."; kolom **Belanja** (Keyboard, Mouse, Headset, Monitor, Aksesoris), **Bantuan** (Pusat Bantuan, Chat CS, Cara titip jual, Pengembalian), **Hingo** (Tentang Kami, Titip jual di Hingo, Kebijakan Privasi, Syarat & Ketentuan); judul kolom berwarna kuning.
- ProductCard: gambar dengan badge hijau "Dicek tim" di kiri atas dan tombol hati bulat putih di kanan atas; merek huruf kecil kapital abu-abu; nama barang tebal; kondisi + jumlah ("Sangat baik · 1 barang"); harga tebal; baris "Hingo · Jakarta Selatan" dengan ikon perisai hijau.

## Step 5 - Beranda

```
STEP 5: Halaman Beranda. Baca Figma lewat MCP: desktop node 1:2, mobile node 48:2963 dan 48:3198
(setelah digulir). Samakan halaman Beranda dengan Figma, urutan section dari atas:

1. Hero kuning: badge "Konsinyasi dikelola tim kami", judul "Titip jual gear, kami yang urus.",
   deskripsi, dua tombol (hitam "Belanja sekarang", putih "Cara titip jual"), panel ilustrasi
   keyboard/mouse/headset di kanan.
2. Strip 4 keunggulan: Dikelola tim kami, Pengecekan barang, Chat admin, Pengiriman terlacak.
3. "Kategori populer" (Keyboard, Mouse, Headset, Monitor + jumlah produk) dengan tautan "Lihat semua".
4. "Produk terlaris" - 4 kartu produk dari data Supabase (bukan data palsu).
5. Section krem "Titip jual, kami urus sampai terjual" dengan 4 langkah bernomor
   (Ajukan titip jual, Kami cek & simpan, Kami pasarkan, Terjual & dikirim).
6. "Rekomendasi untukmu" - 4 kartu produk.
7. Footer.

Aturan: data produk, jumlah per kategori, rating, dan jumlah terjual berasal dari database.
Kalau kolom itu belum ada, JANGAN ubah skema; tulis daftar kolom yang kurang dan tampilkan nilai
sementara yang jelas diberi komentar TODO. Tombol "Belanja sekarang" ke /catalog, "Cara titip
jual" ke halaman titip jual. Mobile: kartu produk dua kolom, tata letak sesuai frame mobile.
`npm run build`, lalu commit: "style: halaman beranda sesuai figma".
```

## Step 6 - Katalog dan pencarian

```
STEP 6: Katalog dan pencarian. Baca Figma lewat MCP: desktop node 10:25047, mobile node 10:25319.

Tampilan:
- Banner krem: label "KURASI HINGO / PRELOVED PILIHAN", judul "Upgrade gear, bukan anggaran.",
  deskripsi, dan kartu putih "Ditangani tim kami." di kanan.
- Baris chip kategori: Semua gear, Keyboard, Mouse, Headset, Monitor, Aksesoris (chip aktif krem).
- Sidebar filter (desktop): Kategori (radio), Kondisi barang (Sangat baik, Baik), Harga minimum,
  Harga maksimum, Asal pengiriman, tombol "Reset".
- Judul "Peripheral preloved", teks "N barang ditemukan di ...", chip filter aktif yang bisa
  dihapus, dropdown "Urutkan: Terbaru".
- Grid 3 kolom kartu produk (desktop), teks penutup "Kamu sudah melihat semua barang...".
- Mobile: filter dibuka lewat tombol/sheet sesuai frame mobile.

Fungsi (benar-benar bekerja, bukan tampilan saja), diambil dari Supabase:
- Pencarian berdasarkan kata kunci dari kolom cari di header.
- Filter kategori, kondisi, rentang harga, dan asal pengiriman.
- Urutan: Terbaru, Harga terendah, Harga tertinggi.
- State filter tersimpan di query string URL (bisa dibagikan, bertahan saat refresh).
- Tombol hati menambah/menghapus wishlist (pakai store dari Step 3).
- Tampilan kosong dan loading yang rapi saat tidak ada hasil.
`npm run build`, lalu commit: "feat: katalog dengan filter, pencarian, dan urutan".
```

## Step 7 - Detail produk

```
STEP 7: Detail produk. Baca Figma lewat MCP: desktop node 10:25521, mobile node 10:25655.

Samakan dengan Figma:
- Breadcrumb: Jelajah / Kategori / Nama barang.
- Galeri: foto besar + 3 thumbnail (geser untuk mobile), keterangan jumlah foto.
- Kolom info: chip kondisi (mis. "Sangat baik") dan chip "Stok 1 barang", judul, subjudul, harga,
  teks "Harga baru sekitar ... · Hemat N%" (hitung dari data), rincian pengiriman (Dikirim dari,
  Ke [kota pembeli] + ongkir, estimasi tiba), kotak krem "Dicek dan dikirim tim kami",
  dua tombol: "Chat admin" (putih) dan "Tambah keranjang" (kuning).
- Kartu "Dikelola tim Hingo" dengan avatar Admin Hingo dan tombol "Chat admin".
- Kartu "Tentang barang ini": Kondisi, Pemakaian, spesifikasi khusus, Kelengkapan, deskripsi,
  tanggal unggah, kode barang.
- Kotak krem "Gunakan pembayaran resmi".
- Tombol "Tambah keranjang" memakai store keranjang dari Step 3 dan menghormati batas stok 1.
- Halaman diakses lewat slug produk. Slug tidak ditemukan -> halaman 404 yang rapi.
`npm run build`, lalu commit: "style: detail produk sesuai figma".
```

## Step 8 - Keranjang

```
STEP 8: Keranjang. Baca Figma lewat MCP: desktop node 10:25747, mobile node 10:25867.

- Breadcrumb "BELANJA / KERANJANG", judul "Keranjangmu", subjudul "Satu temuan bagus, siap jadi milikmu."
- Daftar barang dikelompokkan per "Dikelola Hingo · kota", dengan checkbox "Pilih semua (N barang)"
  dan tautan "Hapus"; tiap barang: foto, nama, kondisi + spesifikasi, harga, jumlah/stok, tombol
  -/+ dan "Hapus barang", catatan "Barang preloved hanya tersedia 1...".
- Kotak "Dicek dan dikirim tim kami".
- Tombol "← Lanjut jelajahi barang" ke /catalog.
- Kartu "Ringkasan pembayaran" di kanan: Harga barang, Ongkir, Perlindungan pengiriman, Biaya
  layanan, Total pembayaran, tombol kuning "Lanjut checkout (N)", teks "Tidak ada biaya tersembunyi...".
  Total dihitung dari barang yang dicentang.
- Keranjang kosong: tampilan kosong yang rapi dengan tombol ke katalog.
- Data memakai store dari Step 3 (bertahan saat refresh).
`npm run build`, lalu commit: "style: keranjang sesuai figma".
```

Spesifikasi cadangan ringkas (angka contoh dari desain): harga Rp850.000, ongkir JNE REG Rp18.000, perlindungan Rp5.000, biaya layanan Rp2.500, total Rp875.500.

## Step 9 - Checkout dan status pesanan

```
STEP 9: Checkout dan detail transaksi. Baca Figma lewat MCP:
- Checkout dan pembayaran: desktop 10:26798, mobile 10:26966
- Detail transaksi dan status pesanan: desktop 10:27088, mobile 10:27286

Samakan tampilan dengan Figma dan sambungkan ke route API checkout/orders yang sudah ada.
Pembayaran SIMULASI: tombol bayar membuat pesanan berstatus "menunggu pembayaran" lalu simulasi
berhasil tanpa gateway sungguhan. Tampilkan status pesanan sesuai desain. Jangan mengubah skema
atau RLS tanpa persetujuan. `npm run build`, lalu commit: "style: checkout dan status pesanan".
```

## Step 10 - Masuk/daftar, verifikasi, dan chat

```
STEP 10: Baca Figma lewat MCP untuk tiap layar (desktop dan mobile):
- Masuk atau daftar: 10:25941 / 10:26026
- Verifikasi nomor HP: 10:26079 / 10:26164
- Verifikasi identitas: 10:26217 / 10:26343
- Chat admin produk: 10:26423 / 10:26544
- Chat admin dan CS: 10:26610 / 10:26735

Samakan tampilan dengan Figma dan sambungkan ke route API yang sudah ada (auth, send-otp,
verify-otp, kyc, chat). Jangan mengubah logika auth. Kalau ada elemen Figma yang butuh data
yang belum ada di backend, catat daftarnya di akhir laporan. Tambahkan atribut id dan name
pada setiap input form. `npm run build`, lalu commit: "style: auth, verifikasi, chat".
```

## Step 11 - Titip jual

```
STEP 11: Alur titip jual. Baca Figma lewat MCP:
- Pengajuan titip jual: desktop 14:12784, mobile 14:12992
- Barang titipan saya: desktop 14:13159, mobile 14:13435
- Detail barang titipan: desktop 14:13670, mobile 14:13929

Samakan tampilan dengan Figma dan sambungkan ke route API consignments/payouts yang sudah ada.
Pastikan tombol "Titip jual" dan "Cara titip jual" di header, beranda, dan footer mengarah ke
halaman ini. Catat kebutuhan data baru tanpa mengubah skema sebelum disetujui.
`npm run build`, lalu commit: "style: alur titip jual".
```

---

# BAGIAN C - PENUTUP

## Step 12 - Rapikan form, aksesibilitas, dan responsif

```
STEP 12: Pembersihan.
1. Pastikan SEMUA input/select/textarea punya atribut `id` atau `name` yang unik (peringatan
   DevTools: "A form field element should have an id or name attribute"). Beri label yang terhubung.
2. Tambahkan teks alternatif pada gambar produk dan label pada tombol ikon (wishlist, keranjang, chat).
3. Periksa semua layar di lebar 390px dan 1440px: tidak ada scroll horizontal, teks tidak terpotong.
4. Cari link mati dan halaman 404 di seluruh navigasi.
5. Jalankan `npm run build` dan `npm run lint`; perbaiki error. Commit: "chore: rapikan form dan aksesibilitas".
```

## Step 13 - Deploy dan verifikasi produksi

```
STEP 13: Deploy.
1. Merge `fix/stabilize` ke `master` (atau buat pull request kalau saya minta) dan push.
2. Jangan klaim sukses dari pesan build saja. Setelah deploy, buka URL produksi
   https://hinggo.vercel.app dan uji dengan permintaan nyata: katalog memuat produk, detail
   produk terbuka, tambah ke keranjang lalu refresh (barang tetap ada), login, checkout simulasi.
3. Laporkan hasil tiap pengujian beserta status HTTP, dan daftar masalah yang tersisa.
```

---

## Catatan

- Kalau Antigravity "berhasil" tapi hasil di produksi masih salah, kembali ke Step 1 dan minta diagnosis ulang dengan bukti permintaan nyata.
- Kalau Figma MCP bermasalah, hapus kalimat "Baca Figma lewat MCP" dan tempel PNG frame-nya ke chat bersama spesifikasi cadangan di step terkait.
- Data contoh di Figma (nama pengguna "Naya", kota Tebet/Jakarta Selatan, tanggal Okt 2026) hanya contoh; jangan di-hardcode.
- Beranda di Figma memakai ilustrasi vektor, sedangkan Katalog dan Detail memakai foto produk. Ikuti Figma per layar.
