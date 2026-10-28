# Master Prompt All-in-One Google Antigravity — Proyek Hingo (`obdczozspvkdebhtyhoh.supabase.co`)

Seluruh instruksi sebelumnya (**Integrasi Supabase `@supabase/ssr`**, **Hapus Semua Data Dummy di Katalog & Seluruh Halaman**, **Strict Guest Mode Saat Belum Login**, **Login Page Awal Figma**, **Kirim OTP Beneran ke WhatsApp & Email**, **Redirect ke Halaman Profil `/account` Setelah Login**, **Persistent Session 30 Hari**, **Real-Time Wishlist & Keranjang**, serta **Chat Responsif Mulai dari 0**) sudah dijadikan **SATU BLOK PROMPT UTUH** di bawah ini.

---

## 1. SATU PROMPT GABUNGAN (TinggalKlik Copy 1 Kali & Paste ke Agent Chat Antigravity)

````markdown
# TASK: ALL-IN-ONE FULL SUPABASE INTEGRATION (`obdczozspvkdebhtyhoh`), WIPE ALL DUMMY DATA (CATALOG & USER START AT 0), STRICT GUEST-FIRST AUTH, ORIGINAL FIGMA LOGIN PAGE, REAL WHATSAPP/EMAIL OTP, REDIRECT TO `/account`, REAL-TIME WISHLIST/CART, AND RESPONSIVE ZERO-HISTORY CHAT

Tolong jalankan refactoring dan integrasi menyeluruh untuk aplikasi **"Hingo — Titip Jual Gear, Kami yang Urus"** dengan menggabungkan seluruh instruksi wajib di bawah ini secara berurutan dan tuntas:

====================================================================
BAGIAN 1: INSTALL PACKAGES, SETUP `.env.local` & HELPER `@supabase/ssr`
====================================================================

1. Jalankan perintah instalasi di terminal:
   npm install @supabase/supabase-js @supabase/ssr @whiskeysockets/baileys qrcode pino
   npm install -D @types/qrcode
   npx skills add supabase/agent-skills

2. Buat atau perbarui file `.env.local` di root project dengan kredensial resmi Supabase berikut:
   NEXT_PUBLIC_SUPABASE_URL=https://obdczozspvkdebhtyhoh.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_qYJsxxD04jDxX2WXPPysTg_vf8IY1AN

3. Buat 4 file helper Supabase berikut secara presisi:
   a) File `utils/supabase/server.ts` (atau `src/utils/supabase/server.ts`):
      import { createServerClient } from "@supabase/ssr";
      import { cookies } from "next/headers";

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

      export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
        return createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Ignored when called from a Server Component with middleware active
              }
            },
          },
        });
      };

   b) File `utils/supabase/client.ts`:
      import { createBrowserClient } from "@supabase/ssr";

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

      export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);

   c) File `utils/supabase/middleware.ts`:
      import { createServerClient } from "@supabase/ssr";
      import { type NextRequest, NextResponse } from "next/server";

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

      export const createClient = (request: NextRequest) => {
        let supabaseResponse = NextResponse.next({
          request: { headers: request.headers },
        });

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        });

        return { supabase, supabaseResponse };
      };

   d) File `middleware.ts` di root project:
      - Panggil helper middleware Supabase di setiap request agar session cookie (`hingo_user_id` & Supabase Auth session) selalu diperbarui otomatis.
      - Proteksi route `/account`, `/cart`, `/checkout`, `/wishlist`, `/orders`, `/seller/*`, dan `/chat/*`: jika pengguna belum login (tidak ada cookie `hingo_user_id` atau session Supabase aktif), otomatis redirect ke `/auth/login`.

====================================================================
BAGIAN 2: HAPUS SEMUA DATA DUMMY DI KATALOG, BERANDA & SELURUH HALAMAN (MULAI MURNI DARI 0!)
====================================================================

1. **Hapus Semua Array Dummy di Kode Frontend**:
   - Cari di seluruh folder project (`app/`, `src/`, `components/`, `lib/`, `data/`) semua konstanta/array produk dan transaksi statis seperti `const products = [...]`, `mockProducts`, `initialProducts`, `bestSellers`, `recommendations`, `mockConsignments`, `mockOrders`, `mockMessages`.
   - **Hapus total seluruh array dummy tersebut!** Jangan pernah memberikan fallback ke data dummy jika tabel di database Supabase masih kosong (`0 baris`).

2. **Katalog (`/catalog`) & Beranda (`/`) Wajib 100% Dinamis dari Tabel `public.products` Supabase**:
   - Ambil daftar produk di `/` dan `/catalog` murni dari `supabase.from('products').select('*').eq('status', 'AVAILABLE')`.
   - Hapus angka kategori statis (`1.240 produk`, `860 produk`, `540 produk`, `320 produk`, `6 barang ditemukan`). Hitung jumlah produk per kategori (`Keyboard`, `Mouse`, `Headset`, `Monitor`, `Aksesoris`) secara real-time dari tabel `public.products` di Supabase. Saat tabel `products` kosong, tampilkan **`0 produk`** dan **`0 barang ditemukan`**.
   - Jika katalog masih `0 produk`, tampilkan kartu **Empty State** rapi bertema Hingo (`#FFFBEB`): *"Belum ada barang titipan di katalog. Semua barang berasal dari pengajuan titip jual yang lolos inspeksi tim Hingo."* dengan tombol **`"+ Ajukan titip jual sekarang"`**.
   - Pastikan produk baru di `/catalog` dan `/` hanya muncul ketika pengguna mengajukan barang di `/seller/consignments/new` lalu ditayangkan/di-approve lewat `/admin` (atau ditambahkan lewat form **Tambah Barang Katalog** di `/admin`).

====================================================================
BAGIAN 3: STRICT GUEST MODE SAAT AWAL BUKA APP + LOGIN PAGE AWAL FIGMA + REAL WA/EMAIL OTP + REDIRECT KE `/account`
====================================================================

1. **Jangan Pernah Auto-Login Saat Awal Buka Aplikasi**:
   - Hapus semua kode fallback yang otomatis masuk sebagai `"Naya Putri"` atau user pertama di database.
   - Saat aplikasi pertama kali dibuka tanpa session login, status wajib **Belum Login (`Guest`)**: di Top Navbar tampil tombol kuning **`Masuk`** (`/auth/login`) dan angka badge Wishlist serta Keranjang adalah `0` / disembunyikan.

2. **Pertahankan Desain Login Page (`/auth/login`) & Verifikasi OTP (`/auth/verify-otp`) Persis Desain Awal Figma**:
   - `/auth/login`: Layout 2 kolom khas Figma Hingo (Kiri: badge `PRELOVED, RELOVED.`, judul `"Gear bagus tak harus baru."`, foto keyboard, kartu `"Satu akun, banyak kesempatan"`; Kanan: judul `"Masuk atau daftar"`, toggle `Nomor HP` & `Email`, input Nomor HP `+62 812 3456 7890`, tombol kuning `#FFC629` **`"Kirim OTP ke nomor HP"`**, pemisah `"atau gunakan email"`, input `Alamat email` + tombol **`"Kirim OTP ke email"`**, dan tombol **`"G Lanjutkan dengan Google"`**). Jangan tambahkan tombol demo yang mengubah desain asli Figma.
   - `/auth/verify-otp`: Judul `"Verifikasi nomor HP"` (atau email), nomor tujuan + link `Ubah`, 6 kotak input digit `KODE OTP`, timer `00:42`, dan tombol kuning **`"Verifikasi & lanjutkan"`**.

3. **Kirim Kode OTP 6 Digit Beneran ke WhatsApp & Email (`/api/auth/send-otp`)**:
   - Generate kode 6 digit angka acak (`100000`–`999999`) dan simpan ke tabel `public.otp_verifications` di Supabase (`target`, `otp_code`, `channel`, `expires_at: +5 menit`).
   - **Untuk Nomor HP / WhatsApp**:
     - Normalisasi nomor ke format `628...`.
     - Bangun modul pengirim WhatsApp nyata (`/lib/whatsapp-gateway.ts`) dengan:
       a) **Built-in WhatsApp Web QR Gateway (`@whiskeysockets/baileys` + `qrcode`)**: Sediakan endpoint `/api/whatsapp/qr` dan modal **"Tautkan Pengirim WhatsApp (Scan QR)"** yang bisa dibuka dari indikator kecil di halaman `/auth/login`. Jika pengirim WA belum tertaut saat tombol `"Kirim OTP ke nomor HP"` diklik, munculkan modal QR Code tersebut agar pengguna bisa men-scan QR 1 kali dari menu *Perangkat Tertaut* di WhatsApp HP-nya. Begitu tertaut, server langsung mengirim pesan chat WhatsApp asli ke nomor tujuan berisi kode 6 digit OTP Hingo!
       b) **Dukungan Fonnte API (`FONNTE_TOKEN`)**: Jika `process.env.FONNTE_TOKEN` ada di `.env.local`, kirimkan juga via `POST https://api.fonnte.com/send`.
   - **Untuk Email**:
     - Kirimkan OTP ke email asli menggunakan `supabase.auth.signInWithOtp({ email })` dan/atau `nodemailer` SMTP.

4. **Simpan Sesi Permanen di Supabase (Tidak Perlu Login Lagi) & Langsung Redirect ke `/account`**:
   - Saat 6 digit OTP diverifikasi di `/auth/verify-otp` (`POST /api/auth/verify-otp`):
     - Validasi kode terhadap tabel `public.otp_verifications` di Supabase.
     - Lakukan `upsert` user ke tabel `public.users` di Supabase (`phone` + `phone_verified: true` jika login via WA, atau `email` + `email_verified: true` jika login via Email).
     - Pasang persistent HTTP-Only Cookie `hingo_user_id` (`maxAge: 30 hari` / `2592000` detik) agar **kalau sudah login tidak perlu login lagi** saat menutup/membuka ulang browser.
     - **Langsung arahkan (`router.push('/account')`) ke Halaman Profil Pengguna (`/account`)**!

====================================================================
BAGIAN 4: HALAMAN PROFIL PENGGUNA (`/account`), REAL-TIME WISHLIST/KERANJANG & CHAT MULAI DARI 0
====================================================================

1. **Halaman Profil Pengguna Lengkap (`/account`) — Tersimpan di Supabase**:
   - Menampilkan Nomor WhatsApp (`✓ Terverifikasi`) atau Email (`✓ Terverifikasi`) yang digunakan saat login, serta menyediakan fitur tautkan Email/WA pendamping ke akun yang sama.
   - Form Edit Profil (`Nama Lengkap`, `Kota Domisili`, `Bio`, `Foto Avatar`) yang meng-update tabel `public.users` di Supabase.
   - Kartu Status Verifikasi Identitas / KYC (`Belum Verifikasi` / `Menunggu Peninjauan` / `Terverifikasi`) yang terhubung ke `/auth/verify-identity` dan tabel `public.kyc_documents`.
   - Manajemen Buku Alamat Pengiriman (CRUD tabel `public.addresses`) dan Rekening Bank Pencairan Titip Jual (CRUD tabel `public.bank_accounts`).
   - Tombol **`Keluar (Logout)`** yang menghapus session cookie dan mengembalikan aplikasi ke mode `Guest`.

2. **Wishlist (`♡`) & Keranjang (`Cart`) Ter-update Secara Real-Time**:
   - Buat `CartWishlistProvider` global yang membaca & memutasi tabel `public.wishlists` dan `public.cart_items` di Supabase untuk user yang sedang login.
   - Setiap kali user menekan ikon hati (`♡`) atau tombol **`"Tambah keranjang"`** / hapus item di `/cart` / selesai `/checkout`, langsung update UI detik itu juga (*optimistic update*), simpan ke Supabase, dan langsung perbarui angka badge **Wishlist** serta **Keranjang** di Top Navbar secara real-time tanpa perlu refresh!

3. **Chat Admin Produk (`/chat/product`) & CS (`/chat/support`) Responsif & Mulai Murni dari 0**:
   - Untuk user baru, tabel `public.chat_threads` dan `public.chat_messages` mulai dari **0 (kosong, tanpa chat dummy bawaan)**.
   - Saat user membuka chat (atau menekan `"Chat admin"` dari halaman detail produk), ruang chat mulai dari 0 pesan dengan *quick-reply chips*.
   - Begitu user mengirim pesan, simpan ke tabel `public.chat_messages` di Supabase, tampilkan indikator `"Admin Hingo sedang mengetik..."`, lalu jalankan *Smart Auto-Reply* kontekstual (membaca data asli produk/pesanan dari Supabase) yang menyimpan balasan admin ke tabel `public.chat_messages` dan menampilkannya secara real-time.
   - Pastikan layout Chat 100% responsif di layar Mobile (`390px` dengan *single-pane view* + tombol `← Kembali` + *sticky input bar*) maupun Desktop (`1440px` 3 kolom).

====================================================================
BAGIAN 5: PASTIKAN SKEMA 11 TABEL SUPABASE BERIKUT DIGUNAKAN DI SELURUH QUERY
====================================================================
Simpan juga script SQL berikut ke file `supabase/schema.sql` di dalam project dan pastikan seluruh query `supabase.from(...)` di aplikasi menggunakan nama tabel dan kolom yang persis sama:
- `public.users`: `id`, `name`, `phone`, `email`, `city`, `bio`, `avatar_url`, `role`, `phone_verified`, `email_verified`, `kyc_status`, `created_at`, `updated_at`
- `public.otp_verifications`: `id`, `target`, `otp_code`, `channel`, `verified`, `expires_at`, `created_at`
- `public.kyc_documents`: `id`, `user_id`, `full_name_ktp`, `nik_number`, `masked_nik`, `ktp_image_url`, `ktp_file_size`, `selfie_image_url`, `selfie_file_size`, `status`, `created_at`
- `public.addresses`: `id`, `user_id`, `label`, `recipient_name`, `phone`, `full_address`, `city`, `postal_code`, `is_primary`, `created_at`
- `public.bank_accounts`: `id`, `user_id`, `bank_name`, `account_number`, `account_holder`, `is_primary`, `created_at`
- `public.products`: `id`, `code`, `slug`, `seller_id`, `brand`, `name`, `subtitle`, `category`, `condition`, `usage_duration`, `switch_or_variant`, `completeness`, `description`, `defect_notes`, `price`, `original_new_price`, `stock`, `location`, `rating`, `sold_count`, `is_verified_by_team`, `images`, `status`, `created_at`
- `public.wishlists`: `id`, `user_id`, `product_id`, `created_at`
- `public.cart_items`: `id`, `user_id`, `product_id`, `quantity`, `selected`, `created_at`
- `public.consignments`: `id`, `code`, `seller_id`, `category`, `brand_model`, `variant_spec`, `usage_duration`, `additional_specs`, `current_condition`, `defect_details`, `completeness`, `photos`, `expected_price`, `proposed_price`, `consignment_fee`, `estimated_net_payout`, `origin_city`, `handover_method`, `inbound_courier`, `inbound_tracking_number`, `stage`, `badge_label`, `status_summary`, `created_at`, `updated_at`
- `public.orders`: `id`, `order_code`, `buyer_id`, `product_id`, `address_id`, `item_price`, `shipping_courier`, `shipping_cost`, `shipping_protection`, `service_fee`, `total_amount`, `payment_method`, `buyer_note`, `tracking_number`, `escrow_status`, `order_status`, `created_at`
- `public.chat_threads` & `public.chat_messages`: `id`, `user_id`, `type`, `title`, `ticket_code`, `related_product_id`, `related_order_id`, `updated_at` & `id`, `thread_id`, `sender_role`, `content`, `is_read`, `created_at`
````

---

## 2. Script SQL untuk Dijalankan 1 Kali di Supabase SQL Editor (`obdczozspvkdebhtyhoh`)

Jika kamu belum menjalankan pembuatan tabel di dashboard Supabase kamu, buka **[Supabase SQL Editor (obdczozspvkdebhtyhoh)](https://www.google.com/search?q=https://supabase.com/dashboard/project/obdczozspvkdebhtyhoh/sql/new)**, *copy-paste* blok SQL di bawah ini, lalu klik **Run**:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name_ktp TEXT NOT NULL,
  nik_number TEXT NOT NULL,
  masked_nik TEXT NOT NULL,
  ktp_image_url TEXT NOT NULL,
  ktp_file_size TEXT DEFAULT '1.5 MB',
  selfie_image_url TEXT NOT NULL,
  selfie_file_size TEXT DEFAULT '1.8 MB',
  status TEXT DEFAULT 'PENDING_REVIEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  selected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  item_price BIGINT NOT NULL,
  shipping_courier TEXT DEFAULT 'JNE REG',
  shipping_cost BIGINT DEFAULT 18000,
  shipping_protection BIGINT DEFAULT 5000,
  service_fee BIGINT DEFAULT 2500,
  total_amount BIGINT NOT NULL,
  payment_method TEXT DEFAULT 'BCA_VA',
  buyer_note TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  escrow_status TEXT DEFAULT 'HELD_BY_HINGO',
  order_status TEXT DEFAULT 'PAID_PACKING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'PRODUCT_ADMIN',
  title TEXT DEFAULT 'Admin Hingo',
  ticket_code TEXT DEFAULT '',
  related_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Allow all access for Hingo app" ON public.users FOR ALL USING (true) WITH CHECK (true);
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