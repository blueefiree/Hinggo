# Recap Pengerjaan & Stabilisasi Proyek Hinggo

Dokumen ini merangkum seluruh pekerjaan yang telah dilakukan pada proyek **Hingo / Hinggo** (`https://hinggo.vercel.app`) mengikuti panduan [`hinggo-antigravity-prompts.md`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/hinggo-antigravity-prompts.md), mulai dari stabilisasi sistem awal hingga penyelarasan desain Figma (desktop 1440px & mobile 390px), pengamanan sesi/OTP, penguncian RLS Supabase, dan verifikasi produksi.

---

## 1. Ringkasan Informasi Proyek

| Komponen | Detail |
| :--- | :--- |
| **Aplikasi** | Hingo — Marketplace Konsinyasi & Escrow Gaming Gear Preloved |
| **URL Produksi** | `https://hinggo.vercel.app` (Deployment terbaru: `dpl_231ehMJVc8a6PJZbjkxtVR7AdNBJ`) |
| **Stack** | Next.js 16.4.3 (App Router, Turbopack), TypeScript, React 19, Tailwind CSS v4, Supabase PostgreSQL |
| **Referensi Figma** | File Key `xKNQ51VDVCSdk8qF8bUelM` |
| **Branch Aktif** | `master` (Commit terbaru: `47cea33`) |

---

## 2. Kronologi Pekerjaan per Tahap (Bagian A – D)

### Bagian A — Stabilkan Sistem (Step 0 – Step 3)
1. **Step 0 (`5968beb` — `chore: cadangan sebelum stabilisasi`):** Mengamankan kondisi awal repositori dan membuat branch kerja `fix/stabilize`, serta memastikan `.env*` tidak ter-track Git.
2. **Step 1 (Audit & Diagnosis):** Mengaudit variabel environment, koneksi Supabase, alur auth/session, serta penyebab hilangnya keranjang saat *refresh*.
3. **Step 2 (`4595380` — `fix: perbaiki koneksi supabase dan env`):** Memisahkan client browser (`anon/publishable key`) vs server dan menambahkan `.env.example`.
4. **Step 3 (`337011c` — `fix: persistensi keranjang dan wishlist`):** Menyatukan state keranjang & wishlist agar persisten antar-*refresh*.

### Bagian B — Menyamakan Tampilan dengan Figma (Step 4 – Step 11)
5. **Step 4 (`5963200` — `style: token, header, footer, kartu produk`):** Menyelaraskan design token, [`Navbar.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Navbar.tsx), [`Footer.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Footer.tsx), [`MobileBottomNav.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/MobileBottomNav.tsx), dan [`ProductCard.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/ui/ProductCard.tsx).
6. **Step 5 (`0ce9a02` — `style: halaman beranda sesuai figma`):** Membangun halaman Beranda (`/`) berdasarkan frame Figma `1:2` & `48:2963` dengan data produk langsung dari database.
7. **Step 6 (`e827d4b` — `feat: katalog dengan filter, pencarian, dan urutan`):** Halaman `/catalog` dengan filter kategori, kondisi, rentang harga, sorting, query URL persisten, dan drawer mobile.
8. **Step 7 (`9e6f168` — `style: detail produk sesuai figma`):** Halaman `/product/[slug]` lengkap dengan galeri, badge kurator, deskripsi minus, dan tombol aksi.
9. **Step 8 (`279f52c` — `style: keranjang sesuai figma`):** Halaman `/cart` dengan pengelompokan *"Dikelola Hingo"*, seleksi item, kalkulasi ongkir/proteksi/biaya layanan, dan empty state.
10. **Step 9 (`1f4bfcd` — `style: checkout dan status pesanan`):** Halaman `/checkout`, `/checkout/payment/[orderId]`, `/orders`, dan `/orders/[id]` lengkap dengan simulasi pembayaran & stepper escrow 48 jam.
11. **Step 10 (`8d84761` — `style: auth, verifikasi, chat`):** Halaman `/auth/login`, `/auth/verify-otp`, `/auth/verify-identity`, `/chat/product`, dan `/chat/support`.
12. **Step 11 (`d3df51f` — `style: alur titip jual`):** Halaman `/seller/consignments`, `/seller/consignments/new` (auto-save draft per email), `/seller/consignments/[code]`, `/ship`, dan `/revise`.

### Bagian C — Pembersihan & Deploy Awal (Step 12 – Step 13)
13. **Step 12 (`0ac283a` — `chore: rapikan form dan aksesibilitas`):** Penambahan `id`, `name`, dan `label` unik di seluruh form, `alt` teks gambar, serta halaman `/privacy` & `/terms`.
14. **Step 13 (`2ae4ec6`, `bb7c667`):** Merge ke `master` dan perbaikan kesesuaian skema produk untuk fallback checkout di Vercel.

### Bagian D — Perbaikan Keamanan, Penyatuan Data, Figma Mobile & Verifikasi Akhir (Step 14 – Step 21)
15. **Step 14 (Audit Keamanan & Kebersihan Data):** Audit read-only atas celah cookie unsigned lama (`hingo_user_email`), OTP, fallback secret, penyimpanan ganda SQLite vs Supabase, data uji `Pengguna 5432`, dan tabel Supabase yang masih terbuka ke `anon key`.
16. **Step 15 (`6951d63` — `fix(auth): sesi bertanda tangan dan otorisasi per pengguna`):**
    - Mengganti sesi menjadi cookie `hingo_session` (`HttpOnly`, `Secure` di produksi, `SameSite=Lax`, berlaku 30 hari) bertanda tangan **HMAC-SHA256** menggunakan `SESSION_SECRET`.
    - Menghapus pembacaan cookie mentah `hingo_user_email` / `hingo_user_id`.
    - Memproteksi rute `/admin` & `/api/admin` khusus `role === "ADMIN"` lewat [`src/middleware.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/middleware.ts) serta cek kepemilikan data per pengguna di `/api/orders`, `/api/consignments`, `/api/payouts`, `/api/chat`.
17. **Step 16 (`e62fcd4` — `fix(auth): otp aman dan mode demo eksplisit`):**
    - Membuat [`src/lib/otp.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/otp.ts) untuk hashing OTP HMAC-SHA256, masa kedaluwarsa 5 menit, lockout 15 menit setelah 5 kali salah, dan jeda kirim ulang 60 detik.
    - Menambahkan mode eksplisit `DEMO_MODE` / `DEMO_OTP_CODE` dan banner mode demo di [`src/app/auth/verify-otp/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/verify-otp/page.tsx), serta menghilangkan kebocoran kode OTP dari respons `/api/auth/send-otp`.
18. **Step 17 (`5d4fc3e` — `fix: hapus fallback secret dan wajibkan env`):**
    - Membuat [`src/lib/env.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/env.ts) dengan helper `requireEnv()` (*fail-fast* tanpa nilai cadangan) dan membersihkan fallback secret di auth, OTP, Supabase, dan dokumentasi.
19. **Step 18 (`e04b4a9` — `chore: satu sumber data dan bersihkan data uji`):**
    - Memindahkan [`src/app/api/checkout/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/checkout/route.ts), [`src/app/api/orders/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/orders/route.ts), dan [`src/app/api/orders/[id]/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/orders/[id]/route.ts) agar membaca dan menulis langsung ke **Supabase** sebagai sumber kebenaran utama (*Single Source of Truth*), bukan bergantung pada SQLite lokal di Vercel.
    - Menghapus baris uji lama (`Pengguna 5432` dan keranjangnya) di Supabase setelah mendapat persetujuan.
20. **Step 19 (`4b99638` — `fix: keranjang tamu pindah ke localStorage`):**
    - Memperbarui [`src/lib/store.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/store.tsx) & [`src/app/cart/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/cart/page.tsx) agar keranjang & wishlist tamu hanya menyimpan data minimal (`productId`, `quantity`, `addedAt`, `selected`) di `localStorage` (aman SSR, maksimal 20 item, stok preloved 1 unit), dihidrasi ulang dari Supabase `/api/products`, otomatis digabung ke akun saat login, dan dibersihkan saat logout.
21. **Perbaikan Konfigurasi Editor & TypeScript (`246f0fa` — `chore: bersihkan unused imports dan selaraskan konfigurasi vscode typescript`):**
    - Memperbaiki konflik buffer file editor yang sempat menimpa file di disk, mengeluarkan `prisma` dari `exclude` di [`tsconfig.json`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/tsconfig.json), menambahkan [`.vscode/settings.json`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.vscode/settings.json), dan membersihkan unused imports serta `React.FormEvent` di `Navbar.tsx`, `catalog/page.tsx`, `orders/page.tsx`, dan `orders/[id]/page.tsx`.
22. **Step 20 (`cf9abef` — `style: selaraskan tampilan desktop dan mobile dengan figma (step 20)`):**
    - Membaca frame desktop & mobile langsung lewat **Figma MCP** (`48:2963`, `1:2`, `10:25319`, `10:25655`, `10:25867`, `10:25941`, `10:26026`, `10:26164`, `10:26343`, `10:26544`, `10:26735`, `10:26966`, `10:27286`, `14:12992`, `14:13435`).
    - Menyelaraskan tampilan mobile 390px dan desktop:
      - Header mobile Beranda menampilkan *"Gear titipan, kami urus."* di kanan; bottom search bar hanya tampil di Beranda (`/`), bukan duplikat di `/catalog`.
      - Hero mobile ringkas dengan kartu visual miring, baris 4 ikon kategori *"Mau cari apa?"*, judul *"Lagi banyak dicari"*, dan strip jaminan abu-abu *"Kondisi & kelengkapan dicek tim Hingo"*.
      - Penyesuaian padding 2 kolom [`ProductCard.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/ui/ProductCard.tsx), pill toggle Nomor HP / Email & link `/terms`/`/privacy` di [`auth/login/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/login/page.tsx), perampingan kartu mobile OTP/Checkout, penghapusan panah/ikon ganda di Keranjang & Titip Jual, serta penghapusan sub-navbar mobile duplikat di [`seller/consignments/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/seller/consignments/page.tsx).
23. **Step 21 (Verifikasi Produksi):**
    - Mengonfigurasi `DEMO_MODE`, `NEXT_PUBLIC_DEMO_MODE`, dan `DEMO_OTP_CODE` di Vercel Production dan melakukan deploy.
    - Memverifikasi 9 pengujian API/auth/checkout/penolakan di `https://hinggo.vercel.app` (seluruhnya lolos, termasuk penolakan 401 cookie palsu, 429 lockout percobaan ke-5/6, 403 akses order user lain, 307/403 non-admin ke `/admin`, serta `send-otp` tanpa kebocoran kode). *Catatan jujur: uji klik interaktif Chrome pada Step 21 #3 belum dapat dijalankan otomatis karena Chrome remote debugging (`DevToolsActivePort`) belum aktif di mesin lokal, namun halaman `/catalog`, `/cart`, `/api/products`, dan alur `localStorage` terverifikasi berjalan.*
    - Menghapus semua data uji Step 21 dan memulihkan stok `prod-coiled-cable` setelah disetujui pengguna.
24. **Step 17B (`47cea33` — `fix(db): aktifkan RLS dan kunci bucket`):**
    - Membuat migration [`supabase/migrations/20261112_lock_rls_and_storage.sql`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/supabase/migrations/20261112_lock_rls_and_storage.sql) untuk mengaktifkan RLS pada 12 tabel `public`, menghapus policy permisif lama, membatasi akses publik `products` hanya `SELECT` untuk `status = 'AVAILABLE'`, mengunci seluruh tabel sensitif (`users`, `orders`, `cart_items`, `wishlists`, `addresses`, `bank_accounts`, `kyc_documents`, `consignments`, `otp_verifications`, `chat_threads`, `chat_messages`) dari `anon`/`authenticated`, serta menandai bucket sensitif `private`.
    - Memperbarui [`src/lib/supabase.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/supabase.ts) agar client server hanya berjalan di server memakai `requireEnv("SUPABASE_SERVICE_ROLE_KEY")` dan mendokumentasikan variabel tersebut di [`.env.example`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.env.example).
    - Deploy ulang ke `https://hinggo.vercel.app` dan memverifikasi langsung: seluruh `GET` `anon key` ke tabel sensitif mengembalikan `[]`, `INSERT`/`UPDATE` ke `products` via `anon key` ditolak (`401` / 0 baris), sedangkan katalog (12 produk), detail produk, login, keranjang, dan checkout di produksi berjalan `200 OK`, lalu membersihkan seluruh data uji Step 17B setelah persetujuan.

---

## 3. Daftar File Penting yang Diubah / Ditambahkan

- **Keamanan, Env & Database:**
  - [`src/lib/env.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/env.ts) — Validasi environment variable wajib (*fail-fast*).
  - [`src/lib/auth.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/auth.ts) — Token sesi HMAC-SHA256 (`hingo_session`) & resolusi user server-side.
  - [`src/lib/otp.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/otp.ts) — Hashing OTP, expiry 5 menit, lockout 5 kali gagal, cooldown, & mode demo eksplisit.
  - [`src/lib/supabase.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/supabase.ts) — Pemisahan client browser (`anon/publishable`) dan client server (`SUPABASE_SERVICE_ROLE_KEY`).
  - [`src/middleware.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/middleware.ts) — Verifikasi sesi Edge & proteksi rute `/admin`.
  - [`supabase/migrations/20261112_lock_rls_and_storage.sql`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/supabase/migrations/20261112_lock_rls_and_storage.sql) — Migration RLS ketat & penguncian bucket.
  - [`.env.example`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.env.example) — Daftar template seluruh nama environment variable wajib & opsional (tanpa nilai rahasia).
- **API Routes (Single Source of Truth Supabase & Otorisasi):**
  - [`src/app/api/checkout/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/checkout/route.ts), [`src/app/api/orders/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/orders/route.ts), [`src/app/api/orders/[id]/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/orders/[id]/route.ts)
  - [`src/app/api/auth/send-otp/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/auth/send-otp/route.ts), [`src/app/api/auth/verify-otp/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/auth/verify-otp/route.ts), [`src/app/api/cart/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/cart/route.ts), [`src/app/api/wishlist/route.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/api/wishlist/route.ts)
- **State Client, Layout & UI (Desktop 1440px & Mobile 390px):**
  - [`src/lib/store.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/store.tsx), [`src/lib/data.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/data.ts)
  - [`src/app/layout.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/layout.tsx), [`src/components/layout/Navbar.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Navbar.tsx), [`src/components/layout/MobileBottomNav.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/MobileBottomNav.tsx), [`src/components/ui/ProductCard.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/ui/ProductCard.tsx)
  - [`src/app/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/page.tsx), [`src/app/catalog/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/catalog/page.tsx), [`src/app/cart/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/cart/page.tsx), [`src/app/checkout/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/checkout/page.tsx), [`src/app/orders/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/orders/page.tsx), [`src/app/orders/[id]/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/orders/[id]/page.tsx), [`src/app/auth/login/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/login/page.tsx), [`src/app/auth/verify-otp/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/verify-otp/page.tsx), [`src/app/seller/consignments/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/seller/consignments/page.tsx)
- **Konfigurasi Workspace:**
  - [`tsconfig.json`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/tsconfig.json), [`.vscode/settings.json`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.vscode/settings.json)

---

## 4. Kondisi Akhir Saat Ini

- **Database Supabase:**
  - **12 produk katalog asli** utuh dan berstatus `AVAILABLE` (`stock: 1`).
  - Seluruh data uji sementara dari Step 13, Step 18, Step 21, dan Step 17B sudah dibersihkan.
  - RLS aktif di seluruh 12 tabel `public` (akses publik `anon` hanya bisa `SELECT` produk aktif).
- **Environment Variables Terpasang di Vercel Production (`blueefiree/hinggo`):**
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `DEMO_MODE`, `DEMO_OTP_CODE`, `NEXT_PUBLIC_DEMO_MODE`.
- **Hal Opsional / Lanjutan di Masa Depan:**
  1. Jika ingin mengaktifkan pengiriman OTP sungguhan (non-demo), ubah `DEMO_MODE=false` setelah kredensial `SMTP_*` atau `FONNTE_TOKEN` produksi terpasang.
  2. Jika pernah meng-commit kunci lama di riwayat git awal sebelum Step 17, pertimbangkan rotasi berkala API key di dashboard Supabase & Vercel.
  3. Untuk integrasi upload file KTP/bukti transfer ke Supabase Storage di masa depan, buat bucket private (`kyc-documents`, `payment-proofs`) dan akses via *signed URL* server.

