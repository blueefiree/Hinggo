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

---

# BAGIAN D - PERBAIKAN SETELAH REVIEW (Step 14-21)

Bagian ini ditambahkan setelah laporan Step 0-13 dari Antigravity direview. Kerjakan berurutan. Step 14 hanya membaca; sisanya memperbaiki. Perubahan skema/RLS/penghapusan data tetap wajib minta persetujuan.

## Step 14 - Review keamanan dan kebersihan data (hanya membaca)

```
STEP 14: Review keamanan dan kebersihan data. JANGAN mengubah file atau data di step ini; hanya
baca dan laporkan, lalu tunggu persetujuan.

1. Auth/sesi: jelaskan persis bagaimana sesi login dibuat dan diverifikasi (cookie
   hingo_user_email). Apakah nilainya ditandatangani/dienkripsi? Apakah cookie HttpOnly, Secure,
   dan SameSite? Apakah orang yang membuat cookie itu sendiri dengan email orang lain bisa
   dianggap login? Buktikan dengan satu permintaan nyata ke endpoint session TANPA login yang
   sah, lalu laporkan hasilnya.
2. OTP: jelaskan bagaimana kode OTP dibuat dan dikirim. Apakah kode dikembalikan di respons
   API atau memakai nilai tetap? Apakah ada batas percobaan dan kedaluwarsa? Tandai mana yang
   sengaja untuk simulasi.
3. Secret: cari semua key/token yang tertulis di kode atau riwayat git (git grep dan git log -S).
   Jelaskan apa yang dimaksud "fallback token" dan "toleransi variabel env" di Step 2 dan apakah
   itu membuat aplikasi berjalan dengan key yang salah secara diam-diam. Jangan tampilkan nilai
   key, hanya lokasi file dan nama variabel.
4. Sumber data: jelaskan peran Prisma dan Supabase. Di mana pengguna, keranjang, dan pesanan
   sebenarnya tersimpan di produksi? Pastikan tidak ada penyimpanan file lokal di Vercel.
5. Data uji: daftar semua baris yang dibuat oleh skrip pengujian Step 13 di database produksi
   (pengguna "Pengguna 5432", order GRL-20261111-3729, item keranjang). Tulis SQL penghapusannya
   dan TUNGGU persetujuan sebelum menjalankan.
6. RLS: daftar tabel dan status RLS-nya, dan tandai tabel yang bisa dibaca atau diubah publik
   lewat anon key padahal seharusnya tidak.
7. Tulis laporan berurutan dari risiko tertinggi, beserta rencana perbaikan, lalu berhenti.
```

Selesai kalau: laporan keluar. Baca dulu sebelum lanjut ke Step 15.

## Step 15 - Amankan sesi login

```
STEP 15: Amankan sesi login. Masalah: sesi disimpan di cookie hingo_user_email (email polos),
sehingga cookie bisa dipalsukan dan seseorang bisa masuk sebagai pengguna lain.

Lakukan:
1. Ganti mekanisme sesi. Pilih salah satu dan jelaskan alasannya di rencana:
   (a) Supabase Auth bawaan, atau
   (b) token sesi acak/JWT yang DITANDATANGANI dengan secret server (variabel SESSION_SECRET).
   Cookie sesi wajib: HttpOnly, Secure (di produksi), SameSite=Lax, path=/, masa berlaku jelas.
   Isi cookie TIDAK boleh berisi email atau data pribadi yang bisa diubah klien.
2. Semua route API yang butuh login (cart, wishlist, checkout, orders, user/*, consignments,
   payouts, chat, admin) harus memverifikasi sesi di SERVER dan memeriksa kepemilikan data
   (pengguna hanya boleh mengakses datanya sendiri; /admin hanya untuk peran admin).
3. Tambahkan logout yang benar-benar menghapus cookie sesi.
4. Nama variabel baru (mis. SESSION_SECRET) dicatat di .env.example TANPA nilai. Saya yang
   mengisinya di Vercel. Kalau variabel belum ada, aplikasi harus berhenti dengan pesan error
   yang jelas, bukan memakai nilai cadangan.
5. Kalau butuh perubahan skema atau RLS, TULIS rencananya dan tunggu persetujuan.
6. Uji dengan permintaan nyata dan laporkan hasilnya:
   - cookie lama hingo_user_email dengan email orang lain -> harus DITOLAK (401),
   - cookie sesi yang diubah satu karakter -> ditolak,
   - mengakses /api/orders milik pengguna lain -> ditolak (403/404),
   - /admin dengan akun biasa -> ditolak,
   - login sah -> berhasil dan keranjang tetap jalan.
7. `npm run build`, lalu commit: "fix(auth): sesi bertanda tangan dan otorisasi per pengguna".
```

Selesai kalau: semua uji penolakan di poin 6 lolos. Sebelum deploy, isi `SESSION_SECRET` (string acak panjang) di Vercel.

## Step 16 - Rapikan OTP (simulasi yang disengaja dan aman)

```
STEP 16: Rapikan OTP. Verifikasi OTP masih SIMULASI (tanpa SMS sungguhan), tapi simulasinya harus
aman dan disengaja.

1. Tentukan mode lewat variabel environment DEMO_MODE (true/false). Catat di .env.example.
2. Saat DEMO_MODE=true: kode OTP demo boleh berupa satu kode tetap yang diambil dari variabel
   DEMO_OTP_CODE (bukan ditulis di kode), dan UI menampilkan banner jelas "Mode demo: gunakan
   kode yang diberikan penyelenggara". Kode TIDAK boleh dikembalikan di respons API send-otp.
3. Saat DEMO_MODE=false atau kosong: buat kode acak 6 digit, simpan HASH-nya dengan masa
   kedaluwarsa 5 menit, batasi 5 percobaan salah per nomor lalu kunci sementara, dan beri jeda
   kirim ulang 60 detik. Sambungan SMS sungguhan belum ada, jadi tampilkan pesan bahwa pengiriman
   belum tersedia dan JANGAN mencetak kode ke log produksi.
4. Pesan error tidak boleh membocorkan apakah nomor/email terdaftar.
5. Uji dan laporkan: kode salah ditolak, kode kedaluwarsa ditolak, percobaan ke-6 terkunci,
   respons send-otp tidak berisi kode.
6. `npm run build`, lalu commit: "fix(auth): otp aman dan mode demo eksplisit".
```

Selesai kalau: respons `send-otp` tidak memuat kode dan uji penolakan lolos.

## Step 17 - Hapus fallback token dan secret di kode

```
STEP 17: Bersihkan secret dan fallback tersembunyi.

1. Cari dan tampilkan LOKASI (file:baris, nama variabel; bukan nilainya) semua key/token yang
   tertulis di kode atau riwayat git: `git grep -nE "eyJ[A-Za-z0-9_-]{20,}|service_role|sb_secret|sb_publishable"`
   dan `git log -p -S "<pola>" --all` (cukup laporkan commit dan file).
2. Hapus semua "fallback token" dan nilai cadangan untuk variabel env dari kode (Step 2). Ganti
   dengan pemeriksaan wajib di satu tempat (mis. `src/lib/env.ts`): kalau variabel wajib kosong,
   lempar error "Variabel X belum diisi" saat start/build, bukan memakai nilai lain.
3. Pastikan key rahasia (service_role dan sejenisnya) hanya dipakai di kode server dan tidak pernah
   berawalan NEXT_PUBLIC_.
4. Pastikan `.env*` ada di .gitignore dan tidak ter-track.
5. Kalau ada key yang pernah ter-commit, JANGAN mencoba menulis ulang riwayat git sendiri.
   Tulis daftar key yang harus saya ganti (rotate) di dashboard Supabase/Vercel, lalu berhenti
   dan tunggu saya.
6. `npm run build`, lalu commit: "fix: hapus fallback secret dan wajibkan env".
```

Selesai kalau: tidak ada key di kode, dan aplikasi gagal dengan pesan jelas kalau env kosong. **Kamu** yang mengganti (rotate) key yang bocor di dashboard Supabase, lalu memperbarui nilainya di Vercel dan redeploy.

## Step 17B - Kunci RLS Supabase dan bucket Storage

```
STEP 17B: Kunci akses langsung ke database. Audit Step 14 menunjukkan tabel users, orders,
cart_items, dan otp_verifications bisa dibaca (dan sebagian ditulis) lewat anon key, padahal anon
key terlihat publik di browser.

1. PETAKAN dulu (hanya membaca): untuk tiap tabel di schema public, tulis kode mana yang
   mengaksesnya dan memakai apa: anon key (Supabase client di browser/server), service role,
   atau Prisma/koneksi langsung. Tandai tabel yang SAAT INI dibaca lewat anon key oleh aplikasi
   (mis. katalog produk), supaya tidak rusak saat RLS dikunci. Gunakan juga security advisor
   Supabase lewat MCP kalau tersedia.
2. TULIS RENCANA SQL (jangan jalankan), lalu berhenti dan tunggu persetujuan:
   - ENABLE ROW LEVEL SECURITY di SEMUA tabel schema public.
   - products: SELECT publik hanya untuk produk yang boleh tampil (mis. status aktif);
     INSERT/UPDATE/DELETE tanpa policy untuk anon (hanya service role).
   - users, orders, cart_items, wishlists, addresses, bank_accounts, consignments, payouts,
     chat, otp_verifications, dan tabel sensitif lain: TANPA policy untuk anon (default tolak).
     Aplikasi mengaksesnya lewat server (service role/Prisma) setelah sesi diverifikasi di Step 15.
   - Kalau ada tabel yang saat ini dibaca browser lewat anon key padahal sensitif, pindahkan
     aksesnya ke route API server dulu sebelum RLS dikunci.
3. Storage: daftar semua bucket dan statusnya (public/private). Bucket berisi dokumen KYC, foto
   KTP, atau bukti pembayaran HARUS private dan diakses lewat signed URL berumur pendek.
   Bucket foto produk boleh publik.
4. Setelah saya setujui: terapkan sebagai satu migration. Lalu uji dengan permintaan nyata
   memakai anon key dari environment (JANGAN mencetak key-nya) dan laporkan:
   - GET /rest/v1/users, /orders, /cart_items, /otp_verifications -> kosong atau ditolak,
   - INSERT/UPDATE ke products dengan anon key -> ditolak,
   - katalog dan detail produk di aplikasi masih memuat 12 produk,
   - login, keranjang, dan checkout simulasi masih berjalan.
5. `npm run build`, lalu commit file migration: "fix(db): aktifkan RLS dan kunci bucket".
```

Selesai kalau: semua permintaan anon ke tabel sensitif ditolak, katalog masih jalan, dan bucket KYC private.

## Step 18 - Satukan sumber data dan bersihkan data uji

```
STEP 18: Satukan sumber data dan bersihkan data uji.

A. Sumber data
1. Jelaskan di mana data pengguna, keranjang, wishlist, dan pesanan disimpan di produksi.
   Kalau ada dua sumber (Prisma dan Supabase) atau penyimpanan file lokal (mis. SQLite),
   usulkan satu sumber kebenaran: Supabase. Tulis rencana migrasi dan TUNGGU persetujuan.
2. Setelah disetujui, hapus kode "sinkronisasi fallback" yang menyalin data antar sumber dan
   pastikan route checkout/orders membaca dan menulis hanya ke Supabase.
3. Buktikan: buat pesanan simulasi di produksi, lalu tunjukkan baris pesanan itu lewat query di
   Supabase (jumlah baris sebelum dan sesudah).

B. Data uji
4. Tampilkan SQL (SELECT dulu, lalu DELETE) untuk menghapus: pengguna "Pengguna 5432", pesanan
   GRL-20261111-3729, serta keranjang, wishlist, dan alamat milik pengguna uji itu. Tampilkan
   baris yang akan terhapus dan TUNGGU persetujuan sebelum menjalankan DELETE.
5. Setelah dihapus, laporkan jumlah baris yang tersisa di tabel terkait dan pastikan 12 produk
   asli tidak ikut terhapus.
6. Mulai dari sini, pengujian ke produksi wajib memakai akun uji yang diberi penanda jelas
   (mis. email berakhiran @hinggo-test.local) supaya mudah dibersihkan.
7. `npm run build`, lalu commit: "chore: satu sumber data dan bersihkan data uji".
```

Selesai kalau: data uji hilang, 12 produk utuh, dan pesanan baru muncul di Supabase.

## Step 19 - Keranjang tamu: tidak melebihi batas cookie

```
STEP 19: Keranjang tamu dan batas ukuran.

Masalah: keranjang tamu disimpan di cookie (batas sekitar 4 KB). Kita sepakat tamu memakai
localStorage dan akun login memakai Supabase.

1. Pindahkan penyimpanan keranjang dan wishlist TAMU dari cookie ke localStorage (dibungkus
   try/catch, aman untuk server-side rendering). Cookie hanya boleh untuk sesi login.
2. Simpan hanya data minimal (id barang, jumlah, waktu ditambahkan). Detail produk diambil ulang
   dari Supabase saat ditampilkan.
3. Batas wajar: maksimal 20 barang di keranjang; tampilkan pesan yang ramah kalau terlampaui.
   Jumlah per barang tidak melebihi stok (preloved: stok 1).
4. Saat login, gabungkan isi localStorage ke akun (hilangkan duplikat), lalu kosongkan localStorage.
5. Uji: tambah 3 barang sebagai tamu, refresh, tetap ada; login, tergabung ke akun; refresh,
   tetap ada; logout, kembali ke mode tamu kosong. Laporkan hasil tiap skenario.
6. `npm run build`, lalu commit: "fix: keranjang tamu pindah ke localStorage".
```

Selesai kalau: skenario di poin 5 lolos dan tidak ada cookie keranjang lagi.

## Step 20 - Verifikasi visual tiap layar terhadap Figma

```
STEP 20: Bandingkan tampilan produksi/lokal dengan Figma, layar demi layar. Gunakan Figma MCP
untuk mengambil screenshot frame, dan browser untuk mengambil screenshot halaman di lebar 1440
dan 390.

Layar (desktop / mobile node):
- Beranda: 1:2 / 48:2963
- Katalog: 10:25047 / 10:25319
- Detail produk: 10:25521 / 10:25655
- Keranjang: 10:25747 / 10:25867
- Masuk atau daftar: 10:25941 / 10:26026
- Verifikasi HP: 10:26079 / 10:26164
- Verifikasi identitas: 10:26217 / 10:26343
- Chat admin produk: 10:26423 / 10:26544
- Chat admin dan CS: 10:26610 / 10:26735
- Checkout: 10:26798 / 10:26966
- Status pesanan: 10:27088 / 10:27286
- Pengajuan titip jual: 14:12784 / 14:12992
- Barang titipan saya: 14:13159 / 14:13435
- Detail barang titipan: 14:13670 / 14:13929

Untuk tiap layar, laporkan dalam satu tabel: layar | selisih utama (teks, warna, spasi, ukuran,
komponen yang hilang) | tingkat keparahan (tinggi/sedang/rendah). Jangan memperbaiki apa pun di
tahap ini. Setelah tabel selesai, berhenti dan tunggu saya memilih selisih mana yang diperbaiki.
```

Selesai kalau: ada tabel selisih per layar. Pilih sendiri yang tingkat keparahannya tinggi dulu, lalu minta perbaikan per layar dengan prompt biasa ("Perbaiki selisih nomor X di layar Y, node Z").

## Step 21 - Verifikasi akhir di produksi (termasuk uji penolakan)

```
STEP 21: Verifikasi akhir setelah deploy ke produksi (https://hinggo.vercel.app). Jangan klaim
sukses dari pesan build. Jalankan permintaan nyata, gunakan akun uji berpenanda @hinggo-test.local,
dan laporkan status HTTP serta bukti tiap uji.

Uji yang HARUS BERHASIL:
1. Katalog memuat 12 produk; filter dan pencarian bekerja.
2. Detail produk terbuka dengan slug yang valid.
3. Tamu: tambah ke keranjang lalu refresh, barang tetap ada.
4. Login dengan OTP demo; sesi bertahan setelah refresh.
5. Checkout simulasi menghasilkan pesanan yang muncul di Supabase.

Uji yang HARUS DITOLAK:
6. Cookie sesi dipalsukan atau lama (hingo_user_email) -> 401.
7. OTP salah -> ditolak; percobaan ke-6 -> terkunci.
8. Mengakses pesanan milik pengguna lain -> 403/404.
9. /admin dengan akun biasa -> ditolak.
10. Respons send-otp tidak mengandung kode OTP.

Setelah selesai, hapus semua data uji dari uji ini (tampilkan SQL dan tunggu persetujuan), lalu
tulis laporan: daftar uji, hasil, dan masalah yang tersisa.
```

Selesai kalau: 5 uji berhasil dan 5 uji penolakan lolos.

STEP 22: Tutup sisa celah. Kerjakan berurutan, bukti berupa permintaan/perintah nyata untuk tiap poin.

1. KODE DEMO: kode DEMO_OTP_CODE tidak boleh berlaku untuk akun berperan ADMIN atau akun seed
   (mis. admin@hingo.id) dan tidak boleh membuat/mengubah peran apa pun. Akun admin hanya boleh
   masuk lewat jalur terpisah (OTP acak sungguhan atau mekanisme lain yang kamu usulkan di rencana).
   Uji: login admin@hingo.id dengan kode demo harus ditolak; login akun pembeli demo harus berhasil.
   Pastikan DEMO_OTP_CODE tidak berawalan NEXT_PUBLIC_ dan tidak ada di kode atau git.
2. GIT: tampilkan hasil `git ls-files | grep -E "dev.db|\.env|wa_auth"`. Kalau ada yang ter-track,
   `git rm --cached` dan tambahkan ke .gitignore. Laporkan juga apakah dev.db pernah berisi data
   pengguna (jangan tampilkan isinya).
3. WHATSAPP: pastikan src/lib/whatsapp-gateway.ts tidak berjalan di Vercel dan tidak menulis ke
   disk di produksi (hanya aktif kalau variabel env khusus diset). Tunjukkan kondisinya.
4. OTP: tunjukkan baris yang membuat kode OTP dan pastikan memakai crypto.randomInt, bukan Math.random.
5. BUNDLE: setelah `npm run build`, jalankan `grep -r "SUPABASE_SERVICE_ROLE_KEY\|service_role" .next/static`
   dan laporkan hasilnya (harus kosong).
6. Deploy, lalu uji ulang di produksi: poin 1 (admin ditolak), cookie palsu 401, OTP salah ditolak,
   anon ke tabel sensitif kosong, katalog 12 produk. Hapus semua data uji sesudahnya (tampilkan
   SQL dan tunggu persetujuan).
7. `npm run build`, lalu commit: "fix: tutup sisa celah demo otp dan git".


## Catatan

- Kalau Antigravity "berhasil" tapi hasil di produksi masih salah, kembali ke Step 1 (atau Step 14 untuk masalah keamanan) dan minta diagnosis ulang dengan bukti permintaan nyata.
- Selalu minta bukti berupa permintaan nyata, bukan sekadar status 200. Uji penolakan (cookie palsu, OTP salah, akses data orang lain) sama pentingnya dengan uji yang berhasil.
- Kalau Figma MCP bermasalah, hapus kalimat "Baca Figma lewat MCP" dan tempel PNG frame-nya ke chat bersama spesifikasi cadangan di step terkait.
- Data contoh di Figma (nama pengguna "Naya", kota Tebet/Jakarta Selatan, tanggal Okt 2026) hanya contoh; jangan di-hardcode.
- Beranda di Figma memakai ilustrasi vektor, sedangkan Katalog dan Detail memakai foto produk. Ikuti Figma per layar.
