# Master Prompt Google Antigravity — Sesi & Penyimpanan Data Berbasis Email Pengguna (Anti-Hilang Saat Refresh)

Dokumen ini berisi **Prompt Perbaikan Permanen (Bagian 1)** agar:
1. **Setiap sesi login dikunci langsung berdasarkan `email` pengguna** (`hingo_user_email` di Cookie 30 hari + Database Session).
2. **Seluruh data di setiap tabel (terutama Barang Titipan / `ConsignmentItem`, Keranjang, Wishlist, Pesanan, Alamat, Rekening, dan Chat) disimpan & dipanggil berdasarkan `email` masing-masing pengguna**, sehingga **tidak akan pernah hilang saat halaman di-refresh** dan tidak akan tertukar antar-akun.
3. **Form Pengajuan Titip Jual (`/seller/consignments/new`) memiliki fitur Auto-Save per Email**, sehingga jika halaman ter-refresh saat sedang mengisi form sekalipun, isian barang yang mau diajukan tetap tersimpan utuh.

---

## 1. Prompt Antigravity: "Kunci Sesi & Seluruh Tabel Database Berdasarkan Email Pengguna (Data Tidak Hilang Saat Refresh)"

Salin **seluruh blok prompt di bawah ini** dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

````markdown
# TASK: BIND USER SESSION AND ALL DATABASE RECORDS DIRECTLY TO USER EMAIL SO SUBMITTED CONSIGNMENTS, FORMS, CART, AND PROFILE DATA NEVER DISAPPEAR ON REFRESH

Saat ini terdapat bug kritis: ketika pengguna yang sudah login mengajukan barang titip jual (atau mengisi data) lalu me-refresh halaman, barang yang diajukan / data halamannya hilang karena:
1. Data hanya tersimpan sementara di React state (`store.tsx`) tanpa di-fetch ulang dengan benar dari database saat refresh, ATAU
2. Terjadi ketidaksinkronan `userId` acak antara cookie, Prisma (`dev.db`), dan Supabase (`public.consignments`) sehingga query `WHERE sellerId = ...` gagal menemukan barang milik user tersebut saat halaman di-refresh.

Tolong rombak dan perbaiki arsitektur penyimpanan sesi & relasi data dengan aturan **Email-Based Session & Persistence** berikut:

====================================================================
ATURAN 1: SESI LOGIN DIKUNCI BERDASARKAN EMAIL PENGGUNA (`hingo_user_email`)
====================================================================

1. **Simpan Identitas Email di Cookie & Session (`src/lib/auth.ts` & `/api/auth/verify-otp`)**:
   - Saat user berhasil login / verifikasi OTP di `/auth/verify-otp`:
     - Pastikan setiap user memiliki identitas `email` yang konsisten di tabel `User` (jika login via email gunakan email asli yang dinormalisasi `email.trim().toLowerCase()`; jika login via Nomor HP dan belum mengisi email, buatkan identifier email standar `628xxx@wa.hingo.id` sampai user menautkan email aslinya).
     - Pasang HTTP-Only Cookie **`hingo_user_email`** (berisi email user tersebut, `maxAge: 30 hari`, `path: '/'`) bersama `hingo_user_id` dan `hingo_session`.
2. **Resolusi User Saat Refresh (`GET /api/auth/session` & `getCurrentUser()`)**:
   - Setiap kali halaman di-refresh, `getCurrentUser()` mencari user di database (Prisma `dev.db` & Supabase `public.users`) menggunakan **`email: cookieEmail`** (dengan fallback ke `id: cookieUserId`).
   - Dengan mengunci pencarian user berdasarkan `email`, meskipun database disinkronkan ulang antara lokal dan Supabase, akun user yang sedang login **100% selalu ditemukan dengan tepat**!

====================================================================
ATURAN 2: SIMPAN & FILTER SEMUA TABEL BERDASARKAN EMAIL MASING-MASING PENGGUNA
====================================================================

1. **Pastikan Setiap Tabel Menyimpan Email Pemilik Data**:
   - Di `prisma/schema.prisma` (jalankan `npx prisma db push`) dan query Supabase, pastikan setiap record transaksi selalu menyertakan dan mengindeks email pemiliknya (atau berelasi langsung ke `User.email`):
     - **`ConsignmentItem` (`public.consignments`)**: Simpan `sellerEmail` (`user.email`) dan `sellerId` (`user.id`).
     - **`Product` (`public.products`)**: Simpan `sellerEmail` dan `sellerId`.
     - **`CartItem` (`public.cart_items`)**: Simpan `userEmail` dan `userId`.
     - **`Wishlist` (`public.wishlists`)**: Simpan `userEmail` dan `userId`.
     - **`Order` (`public.orders`)**: Simpan `buyerEmail` dan `buyerId`.
     - **`Address` (`public.addresses`)**, **`BankAccount` (`public.bank_accounts`)**, **`KycDocument` (`public.kyc_documents`)**, dan **`ChatThread` (`public.chat_threads`)**: Simpan `userEmail` dan `userId`.

2. **Query `GET` Wajib Memanggil Data berdasarkan Email User yang Sedang Login**:
   - Di **`GET /api/consignments`**:
     - Ambil semua barang titipan dari database (Prisma & Supabase) dimana **`sellerEmail === currentUser.email` ATAU `sellerId === currentUser.id`** (diurutkan dari `createdAt: 'desc'`).
     - Jangan pernah mengembalikan array kosong jika di database ada barang dengan `sellerEmail` milik user tersebut!
   - Di **`GET /api/cart`**, **`GET /api/wishlist`**, **`GET /api/orders`**, **`GET /api/chat`**, dan **`GET /api/user/profile`**:
     - Filter seluruh data berdasarkan `userEmail === currentUser.email` (atau `userId === currentUser.id`) sehingga setiap email pengguna memiliki ruang data pribadinya masing-masing di database dan tidak pernah hilang saat browser di-refresh!

====================================================================
ATURAN 3: PERBAIKI ALUR "PENGAJUAN TITIP JUAL" (`/seller/consignments/new` & `/seller/consignments`) AGAR ANTI-HILANG SAAT REFRESH
====================================================================

1. **Auto-Save Form Draft per Email di `/seller/consignments/new`**:
   - Saat user sedang mengetik/mengisi form pengajuan barang di `/seller/consignments/new` (Kategori, Nama/Merek/Model, Varian, Lama Pemakaian, Kondisi, Cacat, Kelengkapan, Foto Barang, Harapan Harga, Kota Asal, Pilihan Penyerahan):
     - Simpan progres isian form secara otomatis ke `localStorage` dengan key spesifik email user: **`hingo_consignment_draft_${user.email}`** setiap kali ada perubahan input.
     - Saat halaman `/seller/consignments/new` dibuka atau **tidak sengaja ke-refresh**, otomatis pulihkan (*restore*) isian form dan foto dari `hingo_consignment_draft_${user.email}` sehingga ketikan user **TIDAK PERNAH HILANG saat di-refresh**!
2. **Simpan Permanen ke Database Saat Klik `"Simpan draf"` atau `"Kirim untuk review"` (`POST /api/consignments`)**:
   - Saat tombol **`"Simpan draf"`** atau **`"Kirim untuk review"`** diklik:
     - Kirim request `POST /api/consignments` dan tunggu (`await`) hingga benar-benar tersimpan ke **Database Prisma (`prisma.consignmentItem.create`)** DAN **Database Supabase (`supabase.from('consignments').insert`)** lengkap dengan `sellerEmail: currentUser.email`, `sellerId: currentUser.id`, dan `ConsignmentTimeline` tahap pertama (`Pengajuan dikirim`).
     - Setelah sukses tersimpan di database, hapus draft sementara `hingo_consignment_draft_${user.email}` dan arahkan user ke `/seller/consignments` (atau `/seller/consignments/[code]`).
3. **Fetch Langsung dari Database Saat Halaman `/seller/consignments` & `/seller/consignments/[code]` Di-refresh**:
   - Di `/seller/consignments/page.tsx` dan `src/lib/store.tsx`:
     - Pastikan setiap kali halaman dimuat ulang (refresh), aplikasi memanggil `GET /api/consignments` dengan `cache: 'no-store'` (tidak menggunakan cache lama) dan langsung merender seluruh barang titipan milik email user tersebut dari database!
     - Di `/seller/consignments/[code]/page.tsx`, baca detail barang titipan langsung dari `GET /api/consignments/[code]` di database (bukan hanya mencari dari memory React state yang kosong saat di-refresh), sehingga halaman detail barang titipan **tidak pernah hilang atau 404 saat di-refresh**!

====================================================================
ATURAN 4: VERIFIKASI WAJIB END-TO-END
====================================================================
1. Login dengan akun Email A (misal `user1@gmail.com`).
2. Buka `/seller/consignments/new`, isi data barang titipan baru (misal `Keychron V1`), coba **refresh halaman di tengah pengisian** → pastikan isian form tidak hilang.
3. Klik **`"Kirim untuk review"`** → masuk ke `/seller/consignments` dan `/seller/consignments/[code]`.
4. **Refresh browser berkali-kali (`F5` / `Ctrl+R`)** pada halaman `/seller/consignments` dan `/seller/consignments/[code]` → pastikan sesi login tetap aktif, halaman tidak hilang, dan barang titipan `Keychron V1` milik `user1@gmail.com` tetap tampil utuh dari database!
5. Logout lalu login dengan Email B (misal `user2@gmail.com`) → pastikan daftar barang titipan Email B mulai dari 0 (terpisah sesuai email masing-masing), dan saat login kembali ke Email A, barang titipan Email A tadi tetap ada!
````

---

## 2. Script SQL Tambahan untuk Kolom Email di Supabase (`obdczozspvkdebhtyhoh`)

Jika kamu sudah menjalankan SQL di dashboard Supabase sebelumnya, jalankan blok `ALTER TABLE` singkat ini di **[SQL Editor Supabase (obdczozspvkdebhtyhoh)](https://www.google.com/search?q=https://supabase.com/dashboard/project/obdczozspvkdebhtyhoh/sql/new)** agar setiap tabel di Supabase memiliki kolom indeks `user_email` / `seller_email` / `buyer_email`:

```sql
ALTER TABLE public.consignments ADD COLUMN IF NOT EXISTS seller_email TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_email TEXT DEFAULT '';
ALTER TABLE public.wishlists ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email TEXT DEFAULT '';
ALTER TABLE public.addresses ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.kyc_documents ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.chat_threads ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_consignments_seller_email ON public.consignments(seller_email);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_email ON public.cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_email ON public.wishlists(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);
```