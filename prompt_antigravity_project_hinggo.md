# Master Prompt Google Antigravity — Perbaikan Full CRUD Tambah Barang, Dashboard Admin (`/admin`) & Pembuatan Tabel Supabase (`obdczozspvkdebhtyhoh`)

Dokumen ini berisi:
1. **Bagian 1 (Copy-Paste ke Agent Chat Antigravity)**: Prompt untuk memperbaiki **Full CRUD Produk (Tambah, Lihat, Edit, Hapus Barang + Upload Foto)**, **Dashboard Admin Lengkap (`/admin`)**, serta **Sinkronisasi Otomatis Prisma ↔ Supabase**.
2. **Bagian 2 (Copy-Paste 1 Kali ke SQL Editor Supabase Kamu)**: Script SQL untuk membuat 12 tabel di project Supabase `obdczozspvkdebhtyhoh` kamu (karena `DATABASE_URL="file:./dev.db"` di proyekmu sebelumnya hanya membuat tabel di file SQLite lokal, belum di cloud Supabase).

---

## 1. Prompt Antigravity: "Perbaiki Full CRUD Tambah/Edit/Hapus Barang, Dashboard Admin Lengkap & Sinkronisasi Supabase"

Salin **seluruh blok prompt di bawah ini** dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

````markdown
# TASK: FIX FULL PRODUCT CRUD (CREATE, READ, UPDATE, DELETE WITH IMAGE UPLOAD), UPGRADE COMPLETE ADMIN DASHBOARD (`/admin`), AND FIX SUPABASE TABLE SYNC

Saat ini kami ingin memastikan **fungsi CRUD untuk menambah, mengedit, dan menghapus barang** serta **seluruh fitur di Dashboard Admin (`/admin`)** berjalan 100% tanpa error, dan tersinkronisasi penuh ke database **Supabase (`https://obdczozspvkdebhtyhoh.supabase.co`)** maupun **Prisma (`dev.db`)**.

Tolong kerjakan perbaikan menyeluruh berikut:

====================================================================
BAGIAN 1: PERBAIKI API & FUNGSI FULL CRUD PRODUK (`src/app/api/products/*` & `src/app/api/admin/route.ts`)
====================================================================

1. **CREATE — Tambah Barang Baru (`POST /api/products` & `POST /api/admin`)**:
   - Pastikan endpoint `POST /api/products` menerima input lengkap:
     - `name` (wajib, misal `"Keychron K2 V2"`)
     - `brand` (wajib, misal `"KEYCHRON"`)
     - `category` (wajib: `"Keyboard"` | `"Mouse"` | `"Headset"` | `"Monitor"` | `"Aksesoris"`)
     - `subtitle` / `switchOrVariant` (misal `"Wireless mechanical keyboard · Brown switch"`)
     - `condition` (`"Sangat baik"` | `"Baik"`)
     - `usageDuration` (misal `"8 bulan"`)
     - `completeness` (misal `"Box, kabel, keycap puller"`)
     - `description` (deskripsi & laporan uji fungsi tim Hingo)
     - `defectNotes` (catatan cacat kosmetik halus)
     - `price` (angka integer harga jual, misal `850000`)
     - `originalNewPrice` (angka integer harga baru, misal `1499000`)
     - `location` (default `"Jakarta Selatan"`)
     - `stock` (default `1`)
     - `images` (mendukung array foto berupa **File Upload gambar dari perangkat yang dikonversi ke Base64 Data URL / disimpan ke `/public/uploads/products/`** MAUPUN input link URL gambar).
   - **Auto-Generate `code` & `slug` Unik**:
     - Buat `code` unik otomatis (misal `HG-PRD-8492`) dan `slug` URL-friendly unik (misal `keychron-k2-v2-8492`) agar tidak pernah terjadi error `Unique constraint failed` meskipun ada 2 barang dengan nama yang mirip!
   - **Dual-Write (Supabase + Prisma)**:
     - Simpan barang baru ke tabel `public.products` di Supabase (`supabase.from('products').insert(...)`) DAN ke tabel `Product` di Prisma (`prisma.product.create(...)`).
     - Panggil `revalidatePath('/')`, `revalidatePath('/catalog')`, dan `revalidatePath('/admin')` agar barang yang baru ditambahkan **detik itu juga langsung tampil di Beranda (`/`), Katalog (`/catalog`), dan Admin (`/admin`)**!

2. **READ — Ambil Daftar & Detail Barang (`GET /api/products` & `GET /api/products/[slug]`)**:
   - Baca daftar produk dari Supabase (`public.products`) dan gabungkan/fallback dengan Prisma (`prisma.product.findMany`) agar tidak pernah kosong jika salah satu database baru diisi.
   - Hitung jumlah produk per kategori (`Keyboard`, `Mouse`, `Headset`, `Monitor`, `Aksesoris`) secara real-time berdasarkan barang yang berstatus `AVAILABLE` dan `stock > 0`.

3. **UPDATE — Edit Data Barang & Ubah Status (`PATCH /api/products/[slug]` & `PATCH /api/admin`)**:
   - Sediakan fungsi untuk mengedit seluruh field barang (Nama, Brand, Kategori, Harga, Kondisi, Kelengkapan, Deskripsi, Foto, serta Status `AVAILABLE` / `SOLD` / `ARCHIVED`) baik di Supabase (`public.products`) maupun Prisma (`Product`).

4. **DELETE — Hapus Barang (`DELETE /api/products/[slug]` & `DELETE /api/admin`)**:
   - Sediakan fungsi hapus barang berdasarkan `id` atau `slug` yang menghapus baris produk dari Supabase (`supabase.from('products').delete()`) dan Prisma (`prisma.product.delete()`), lalu langsung memperbarui tampilan di `/admin`, `/catalog`, dan `/`.

====================================================================
BAGIAN 2: PERBAIKI & LENGKAPI DASHBOARD ADMIN (`/admin` — `src/app/admin/page.tsx`)
====================================================================

Jadikan halaman **`/admin`** sebagai pusat kendali operasional Hingo yang lengkap, rapi, responsif (Desktop & Mobile), dan bebas bug dengan **6 Tab Utama**:

1. **Tab 1: "Manajemen Produk Katalog (Full CRUD)"**:
   - **Tombol & Modal/Form `"+ Tambah Barang ke Katalog"`**:
     - Form interaktif untuk menambahkan produk baru secara langsung (Nama Barang, Brand, Kategori, Varian/Switch, Kondisi `Sangat baik`/`Baik`, Lama Pemakaian, Kelengkapan, Harga Jual `Rp`, Harga Baru Referensi `Rp`, Lokasi, Deskripsi Inspeksi, Catatan Cacat, serta **Upload Foto Gambar langsung dari file laptop/HP + preview gambar**).
     - Saat disubmit, tampilkan loading state, simpan ke database, tampilkan toast sukses, dan langsung munculkan produk baru di tabel bawahnya serta di `/catalog`!
   - **Tabel Daftar Produk Katalog Aktif**:
     - Menampilkan foto thumbnail, Kode & Nama Barang, Kategori, Kondisi, Harga Jual, Status (`Tersedia` / `Terjual`), serta 3 tombol aksi di setiap baris:
       - **`Lihat`** (membuka `/product/[slug]`)
       - **`Edit`** (membuka modal edit barang dengan data yang sudah terisi untuk diubah & disimpan)
       - **`Hapus`** (menghapus barang dari database dengan konfirmasi).

2. **Tab 2: "Antrean Titip Jual & Inspeksi Penjual" (Terhubung ke `/seller/consignments`)**:
   - Menampilkan seluruh pengajuan titip jual (`ConsignmentItem`) yang disubmit oleh pengguna dari `/seller/consignments/new`.
   - Di setiap kartu/baris barang titipan, sediakan tombol aksi tahapan Admin:
     - **Tahap 1 (`ONLINE_CHECK`)**: Tombol **`"Loloskan Cek Online (Minta Penjual Kirim Barang)"`** atau **`"Minta Revisi Foto"`**.
     - **Tahap 2 (`SHIPPING_TO_HINGO`)**: Tombol **`"Konfirmasi Paket Diterima di Gudang Hingo"`**.
     - **Tahap 3 (`INSPECTION_COMPLETED`)**: Form/Modal **`"Input Laporan Inspeksi Fisik & Usulan Harga"`** (Admin mengisi Uji Fungsi, Catatan Cacat Kosmetik, Usulan Harga Jual `Rp`, Biaya Komisi Konsinyasi, dan Estimasi Hasil Bersih Penjual).
     - **Tahap 4 (`PUBLISH TO CATALOG`)**: Tombol kuning **`"Tayangkan Barang ke Katalog Belanja"`** yang **otomatis menyalin data & foto barang titipan tersebut menjadi produk baru di tabel `Product` (`public.products`)**, sehingga barang titipan penjual langsung muncul di halaman `/catalog` untuk dibeli pengguna lain!

3. **Tab 3: "Pesanan Pembeli & Escrow Rekber" (Terhubung ke `/orders`)**:
   - Menampilkan semua pesanan (`Order`) yang masuk dari pembeli.
   - Sediakan tombol aksi Admin:
     - **`"Verifikasi Pembayaran Lunas"`** (mengubah status `UNPAID` → `PAID_PACKING`).
     - **`"Input Nomor Resi & Kirim Barang"`** (input kurir `JNE REG`/`J&T` & nomor resi → mengubah status ke `SHIPPED` dan menambahkan log ke `OrderTimeline`).
     - **`"Tandai Paket Tiba di Pembeli"`** (mengubah status ke `DELIVERED_CHECKING` agar pembeli bisa menekan tombol *"Barang sesuai, konfirmasi terima"*).
     - **`"Cairkan Dana Escrow ke Penjual"`** (melepas dana ke tabel `Payout` penjual).

4. **Tab 4: "Verifikasi Identitas KYC User" (Terhubung ke `/auth/verify-identity` & `/account`)**:
   - Menampilkan daftar dokumen KYC (`KycDocument`) yang diunggah pengguna (Nama KTP, NIK, preview Foto KTP & Selfie).
   - Sediakan tombol hijau **`"Setujui KYC (Verified)"`** (mengubah `user.kycStatus = 'VERIFIED'`) dan tombol merah **`"Tolak / Minta Upload Ulang"`**.

5. **Tab 5: "Live Chat Admin Produk & CS" (Terhubung ke `/chat/product` & `/chat/support`)**:
   - Menampilkan seluruh thread percakapan dari pengguna dan memungkinkan Admin membalas pesan secara langsung sebagai `Admin Hingo` maupun `CS Mira`.

6. **Tab 6: "Status Database Supabase & Sinkronisasi 1-Klik"**:
   - Tampilkan indikator status koneksi ke `https://obdczozspvkdebhtyhoh.supabase.co` (mengecek apakah tabel `public.products`, `public.users`, `public.consignments`, `public.orders` sudah ada di Supabase).
   - Sediakan tombol **`"Sinkronkan Data Lokal (Prisma) ke Cloud Supabase"`** (yang mendorong/meng-upsert semua produk, user, dan barang titipan dari SQLite lokal ke Supabase begitu tabel Supabase dibuat) serta tombol **`"Copy Script SQL Pembuatan Tabel Supabase"`** langsung dari UI!

====================================================================
BAGIAN 3: PASTIKAN AKSES KE `/admin` MUDAH DIUJI
====================================================================
- Di `Navbar.tsx` (pada dropdown profil user yang sedang login) dan di halaman `/account`, tambahkan tombol/link **`"Buka Panel Admin (/admin)"`** (atau gunakan `RoleSwitcherWidget` untuk mengubah role user aktif menjadi `ADMIN` di database) supaya pemilik proyek bisa langsung masuk ke `/admin` untuk menambah barang dan mengelola pengajuan tanpa terkunci.

====================================================================
BAGIAN 4: VERIFIKASI WAJIB
====================================================================
1. Buka `/admin` → masuk ke **Tab Manajemen Produk Katalog** → klik **`"+ Tambah Barang ke Katalog"`**, isi data barang beserta upload foto, lalu klik Simpan.
2. Pastikan barang baru langsung muncul di tabel `/admin`, langsung tampil di halaman `/catalog` serta Beranda (`/`), dan angka jumlah kategori otomatis bertambah (`0 produk` → `1 produk`).
3. Uji klik **`Edit`** (ubah harga barang) dan pastikan harganya langsung berubah di `/catalog`.
4. Uji klik **`Hapus`** pada barang percobaan dan pastikan barang langsung terhapus dari database dan hilang dari `/catalog`.
````

---

## 2. Kenapa di Dashboard Supabase Kamu Tadi Belum Ada Tabel? (Cara Membuatnya dalam 10 Detik)

Alasan kenapa di dashboard Supabase kamu belum muncul tabel adalah karena di file `.env` proyekmu tertulis `DATABASE_URL="file:./dev.db"` (SQLite lokal). Jadi waktu agen menjalankan `npx prisma db push`, Prisma hanya membuat tabel di dalam file `prisma/dev.db` di laptopmu, **bukan** di server cloud Supabase.

Supaya ke-12 tabel langsung terbuat di dashboard Supabase kamu (`obdczozspvkdebhtyhoh`):
1. Klik link ini untuk membuka SQL Editor project Supabase kamu: **[Buka SQL Editor obdczozspvkdebhtyhoh](https://www.google.com/search?q=https://supabase.com/dashboard/project/obdczozspvkdebhtyhoh/sql/new)**
2. *Copy-paste* seluruh blok SQL di bawah ini ke dalam kotak editor di sana, lalu klik tombol hijau **Run** (di pojok kanan bawah):

```sql
-- 1. Tabel Users (Profil & Role Pengguna)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Pengguna Hingo',
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  city TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'USER',
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'UNVERIFIED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Sessions (Sesi Login 30 Hari)
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  user_agent TEXT DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel OTP Verifications
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id TEXT PRIMARY KEY,
  target TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'WHATSAPP',
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Dokumen KYC
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  full_name_ktp TEXT NOT NULL,
  nik_number TEXT NOT NULL,
  masked_nik TEXT NOT NULL,
  ktp_image_url TEXT NOT NULL,
  ktp_file_size TEXT DEFAULT '1.5 MB',
  selfie_image_url TEXT NOT NULL,
  selfie_file_size TEXT DEFAULT '1.8 MB',
  status TEXT DEFAULT 'PENDING_REVIEW',
  rejection_reason TEXT DEFAULT '',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Buku Alamat
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Rekening Bank Pencairan
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Katalog Produk (Full CRUD)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  consignment_item_id TEXT,
  seller_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Sangat baik',
  usage_duration TEXT DEFAULT '',
  switch_or_variant TEXT DEFAULT '',
  completeness TEXT DEFAULT '',
  description TEXT DEFAULT '',
  defect_notes TEXT DEFAULT '',
  price BIGINT NOT NULL,
  original_new_price BIGINT DEFAULT 0,
  stock INT DEFAULT 1,
  location TEXT DEFAULT 'Jakarta Selatan',
  rating NUMERIC(3,1) DEFAULT 5.0,
  sold_count INT DEFAULT 0,
  is_verified_by_team BOOLEAN DEFAULT TRUE,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Wishlist
CREATE TABLE IF NOT EXISTS public.wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 9. Tabel Keranjang Belanja
CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  selected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 10. Tabel Barang Titipan (Consignments)
CREATE TABLE IF NOT EXISTS public.consignments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  seller_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  brand_model TEXT NOT NULL,
  variant_spec TEXT DEFAULT '',
  usage_duration TEXT DEFAULT '',
  additional_specs TEXT DEFAULT '',
  current_condition TEXT DEFAULT 'Bekas · berfungsi normal',
  defect_details TEXT DEFAULT '',
  completeness TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  expected_price BIGINT NOT NULL,
  proposed_price BIGINT,
  consignment_fee BIGINT,
  estimated_net_payout BIGINT,
  origin_city TEXT DEFAULT '',
  handover_method TEXT DEFAULT 'SHIP_AFTER_ONLINE_CHECK',
  inbound_courier TEXT DEFAULT '',
  inbound_tracking_number TEXT DEFAULT '',
  stage TEXT DEFAULT 'ONLINE_CHECK',
  badge_label TEXT DEFAULT 'Menunggu review',
  status_summary TEXT DEFAULT 'Data sudah terkirim. Jangan kirim barang sebelum ada instruksi.',
  inspection_specs TEXT DEFAULT '',
  inspection_function_test TEXT DEFAULT '',
  inspection_condition_defect TEXT DEFAULT '',
  inspection_completeness TEXT DEFAULT '',
  inspected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Pesanan & Escrow (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_code TEXT UNIQUE NOT NULL,
  buyer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  address_id TEXT REFERENCES public.addresses(id) ON DELETE SET NULL,
  item_price BIGINT NOT NULL,
  shipping_courier TEXT DEFAULT 'JNE REG',
  shipping_cost BIGINT DEFAULT 18000,
  shipping_protection BIGINT DEFAULT 5000,
  service_fee BIGINT DEFAULT 2500,
  total_amount BIGINT NOT NULL,
  payment_method TEXT DEFAULT 'BCA_VA',
  va_number TEXT DEFAULT '',
  buyer_note TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  escrow_status TEXT DEFAULT 'HELD_BY_HINGO',
  order_status TEXT DEFAULT 'PAID_PACKING',
  inspection_deadline TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel Chat Threads & Messages
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'PRODUCT_ADMIN',
  title TEXT DEFAULT 'Admin Hingo',
  agent_name TEXT DEFAULT 'Tim Hingo · Online',
  ticket_code TEXT DEFAULT '',
  related_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  related_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan RLS & Buka Policy untuk Aplikasi Hingo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.users;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.sessions;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.otp_verifications;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.kyc_documents;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.addresses;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.products;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.wishlists;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.consignments;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.orders;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.chat_threads;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.chat_messages;

CREATE POLICY "Allow all access for Hingo app" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.otp_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.kyc_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.consignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.chat_threads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
```