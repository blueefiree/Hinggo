# Master Prompt & Perbaikan Google Antigravity — Proyek Hingo (Hapus Total Data Dummy di Katalog & Home — 100% Murni Database)

Dokumen ini berisi **Prompt Khusus (Bagian 1)** untuk **menghapus seluruh data dummy produk di halaman Katalog (`/catalog`), Home (`/`), dan Detail Produk (`/product/[slug]`)** — baik yang masih tersimpan di kode *frontend* (`const products = [...]`) maupun yang berasal dari *database seed* (`prisma/seed.ts`).

---

## 1. Prompt Antigravity: "Hapus Semua Produk Dummy di Katalog & Home (Mulai Murni dari 0 Produk)"

Salin seluruh blok prompt di bawah ini dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

```markdown
# TASK: WIPE ALL DUMMY CATALOG PRODUCTS FROM FRONTEND & DATABASE (START WITH 0 PRODUCTS & 100% DYNAMIC COUNTS)

Saat ini di halaman Katalog (`/catalog`) dan Beranda (`/`) masih muncul produk-produk dummy (seperti Keychron K2 V2, Logitech MX Master 3, Sony WH-1000XM4, Dell P2419H, Logitech G304, Akko 3068B Plus, dll.) serta angka jumlah kategori yang masih di-hardcode (`1.240 produk`, `860 produk`, dll.).

Tolong bersihkan **100% data dummy di Katalog dan Beranda** dengan langkah-langkah wajib berikut:

---

### LANGKAH 1: HAPUS SEMUA ARRAY PRODUK DUMMY DI KODE FRONTEND & DATA HELPER
1. Cari di seluruh folder project (`app/`, `src/`, `components/`, `lib/`, `data/`) semua array atau objek produk statis/dummy seperti:
   - `const products = [...]`, `mockProducts`, `initialProducts`, `defaultProducts`, `bestSellers`, `recommendations`, atau fallback array di `/catalog`, `/` (Home), `/promo`, dan `/product/[slug]`.
2. **Hapus total seluruh array produk dummy tersebut!** Jangan pernah memberikan fallback ke array dummy jika hasil query database kosong (`products.length === 0`).

---

### LANGKAH 2: KOSONGKAN TABEL `Product` DI DATABASE & HAPUS SEED PRODUK DUMMY
1. Buka `prisma/seed.ts` dan **hapus semua kode yang melakukan `prisma.product.create` / `createMany` produk dummy**.
2. Jalankan perintah atau script pembersihan database untuk menghapus seluruh data dummy yang sudah terlanjur masuk ke database:
   - Kosongkan tabel `CartItem`, `Wishlist`, `Order`, `OrderTimeline`, `ConsignmentItem`, `ConsignmentTimeline`, `ChatMessage`, `ChatThread`, dan **`Product`** (`await prisma.product.deleteMany({})`).
3. Pastikan setelah dibersihkan, jumlah baris di tabel `Product` adalah **`0`**.

---

### LANGKAH 3: UBAH ANGKA KATEGORI & TAMPILAN KATALOG MENJADI 100% DINAMIS DARI DATABASE
1. **Angka Jumlah Produk per Kategori di `/` (Home) & `/catalog`**:
   - Hapus teks hardcode `1.240 produk`, `860 produk`, `540 produk`, `320 produk`, dan `6 barang ditemukan`.
   - Hitung jumlah produk secara real-time dari database menggunakan `prisma.product.count({ where: { category: 'KEYBOARD', status: 'AVAILABLE' } })` (dan kategori lainnya: `MOUSE`, `HEADSET`, `MONITOR`, `ACCESSORIES`).
   - Saat database masih kosong, masing-masing kartu kategori menampilkan **`0 produk`** dan header katalog menampilkan **`0 barang ditemukan`**.
2. **Tampilan Empty State Rapi Saat Katalog Masih `0 Produk`**:
   - Di halaman `/catalog` dan bagian `Produk terlaris` / `Rekomendasi untukmu` di `/` (Home), jika hasil query `prisma.product.findMany()` masih kosong (`0 barang`), tampilkan komponen **Empty State** yang bersih sesuai desain Hingo (`#FFFBEB` cream card):
     - Judul: `"Belum ada barang titipan di katalog"`
     - Subteks: `"Semua barang di katalog Hingo berasal dari pengajuan titip jual yang telah lolos inspeksi tim kami."`
     - Tombol CTA: **`"+ Ajukan titip jual sekarang"`** (mengarah ke `/seller/consignments/new`, atau ke `/auth/login` jika belum login).

---

### LANGKAH 4: PASTIKAN PRODUK BARU DI KATALOG MURNI BERASAL DARI INPUT USER / ADMIN
Agar katalog bisa terisi dengan data asli (bukan dummy), pastikan 2 alur ini bekerja 100% ke tabel `Product` di database:
1. **Otomatis Masuk ke Katalog dari Alur Titip Jual (`/seller/consignments/new` → `/admin` / Persetujuan Harga)**:
   - Ketika user yang login mengajukan barang di `/seller/consignments/new`, data tersimpan di tabel `ConsignmentItem`.
   - Sediakan tombol cepat **`"Loloskan Inspeksi & Tayangkan ke Katalog"`** di halaman `/admin` (atau saat penjual menekan **`"Setujui harga & kondisi"`** di `/seller/consignments/[code]`) yang otomatis membuat record baru di tabel `Product` berdasarkan data dan foto asli dari `ConsignmentItem` tersebut.
   - Begitu ditayangkan, barang tersebut **langsung muncul secara real-time di `/catalog` dan `/` (Home)**, dan angka jumlah produk pada kategorinya otomatis bertambah (`0 produk` → `1 produk`)!
2. **Form "Tambah Produk ke Katalog" di `/admin`**:
   - Di halaman `/admin`, sediakan juga form sederhana **"Tambah Barang Katalog Baru"** (Nama barang, Brand, Kategori, Kondisi, Harga jual, Harga baru, Lokasi, Spesifikasi, Kelengkapan, dan Upload Foto) yang langsung menyimpan ke tabel `Product` database agar admin bisa menambahkan stok kapan saja tanpa data dummy.

---

### LANGKAH 5: VERIFIKASI AKHIR
1. Jalankan pembersihan database dan buka `/` serta `/catalog` di browser preview Antigravity: pastikan **0 produk dummy** yang tampil dan semua kategori tertulis **`0 produk`**.
2. Coba login, ajukan 1 barang titipan baru di `/seller/consignments/new` (atau tambahkan 1 barang lewat `/admin`), tayangkan ke katalog, lalu buka `/catalog` — pastikan hanya barang asli yang baru saja kamu input yang muncul di katalog!
```

---

## 2. Apa yang Berubah Setelah Prompt Ini Dijalankan?

| Bagian | Sebelum Prompt Ini | Sesudah Prompt Ini Dijalankan |
| :--- | :--- | :--- |
| **Isi Halaman `/catalog` & `Home` Saat Awal Buka** | Masih muncul 6–12 produk dummy (`Keychron K2 V2`, `MX Master 3`, `Sony WH-1000XM4`, dll.) | **0 Produk (100% Bersih)** — menampilkan *Empty State* rapi dengan tombol **"+ Ajukan titip jual sekarang"**. |
| **Angka Jumlah Produk per Kategori** | Hardcode statis (`1.240 produk`, `860 produk`, dll.) | **Dihitung *live* dari database (`0 produk` saat kosong)** dan otomatis bertambah (`1 produk`, `2 produk`, dst.) saat ada barang yang ditayangkan. |
| **Asal Produk yang Muncul di Katalog** | Dari `prisma/seed.ts` atau array `const products` | **100% murni dari input kamu sendiri** (baik dari form *Ajukan Titip Jual* yang di-*publish* maupun dari form tambah barang di `/admin`). |
