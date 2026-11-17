# Recap Pengerjaan & Stabilisasi Proyek Hinggo

Dokumen ini merangkum seluruh pekerjaan yang telah dilakukan pada proyek **Hingo / Hinggo** ([https://hinggo.vercel.app](https://hinggo.vercel.app)) mengikuti panduan [`hinggo-antigravity-prompts.md`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/hinggo-antigravity-prompts.md), mulai dari stabilisasi sistem awal hingga penyelarasan desain Figma (desktop 1440px & mobile 390px), pengamanan sesi/OTP, penguncian RLS Supabase, penutupan sisa celah keamanan (Step 22), dan verifikasi akhir di produksi.

---

## 1. Ringkasan Informasi Proyek

| Komponen | Detail |
| :--- | :--- |
| **Aplikasi** | Hingo — Marketplace Konsinyasi & Escrow Gaming Gear Preloved |
| **URL Produksi** | [https://hinggo.vercel.app](https://hinggo.vercel.app) |
| **Deployment Terbaru** | `dpl_EaFD6QRLsooxpFw4LDZcenwCYCoZ` (Ready & Aliased) |
| **Proyek Vercel** | `blueefiree/hinggo` |
| **Basis Data** | Supabase PostgreSQL (`obdczozspvkdebhtyhoh.supabase.co`) |
| **Stack** | Next.js 16.4.3 (App Router, Turbopack), TypeScript, React 19, Tailwind CSS v4 |
| **Referensi Desain** | Figma File Key `xKNQ51VDVCSdk8qF8bUelM` |
| **Branch Aktif** | `master` (Commit terbaru: `57670e6`) |

---

## 2. Kronologi Pekerjaan per Tahap (Step 0 – Step 22)

### Bagian A — Stabilkan Sistem (Step 0 – Step 3)
1. **Step 0 (`5968beb` — `chore: cadangan sebelum stabilisasi`):**
   - Mengamankan kondisi awal repositori dan membuat branch kerja `fix/stabilize`.
   - Memastikan file rahasia `.env*` tidak bocor ke Git.
2. **Step 1 (Audit & Diagnosis Sistem):**
   - Mengaudit variabel lingkungan, koneksi Supabase, alur autentikasi dan session cookie.
   - Mengidentifikasi penyebab hilangnya data keranjang saat halaman di-*refresh*.
3. **Step 2 (`4595380` — `fix: perbaiki koneksi supabase dan env`):**
   - Memisahkan client browser (`anon/publishable key`) dengan client server.
   - Menambahkan template konfigurasi [`.env.example`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.env.example).
4. **Step 3 (`337011c` — `fix: persistensi keranjang dan wishlist`):**
   - Menyatukan state keranjang dan wishlist agar tetap persisten antar-*refresh*.

---

### Bagian B — Menyamakan Tampilan dengan Figma (Step 4 – Step 11)
5. **Step 4 (`5963200` — `style: token, header, footer, kartu produk`):**
   - Menyelaraskan design token, warna, tipografi, [`Navbar.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Navbar.tsx), [`Footer.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Footer.tsx), [`MobileBottomNav.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/MobileBottomNav.tsx), dan [`ProductCard.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/ui/ProductCard.tsx).
6. **Step 5 (`0ce9a02` — `style: halaman beranda sesuai figma`):**
   - Membangun halaman Beranda (`/`) berdasarkan frame Figma `1:2` dan `48:2963` dengan data produk riil dari basis data.
7. **Step 6 (`e827d4b` — `feat: katalog dengan filter, pencarian, dan urutan`):**
   - Halaman [`/catalog`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/catalog/page.tsx) dengan filter kategori, kondisi, rentang harga, urutan, URL query params persisten, dan drawer filter mobile.
8. **Step 7 (`9e6f168` — `style: detail produk sesuai figma`):**
   - Halaman detail produk lengkap dengan galeri foto, badge kurator terverifikasi, minus fisik transparan, dan sticky action bar.
9. **Step 8 (`279f52c` — `style: keranjang sesuai figma`):**
   - Halaman [`/cart`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/cart/page.tsx) dengan pengelompokan *"Dikelola Hingo"*, checkbox item, rincian biaya proteksi/layanan/ongkir, dan empty state.
10. **Step 9 (`1f4bfcd` — `style: checkout dan status pesanan`):**
    - Halaman [`/checkout`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/checkout/page.tsx), simulasi QRIS/Virtual Account, dan pelacakan pesanan dengan stepper escrow 48 jam.
11. **Step 10 (`8d84761` — `style: auth, verifikasi, chat`):**
    - Halaman login, input OTP, verifikasi identitas (KYC), chat produk, dan bantuan.
12. **Step 11 (`d3df51f` — `style: alur titip jual`):**
    - Halaman titip jual ([`/seller/consignments`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/seller/consignments/page.tsx)), form pengajuan barang baru dengan draft auto-save per email, detail barang, revisi, dan pengiriman.

---

### Bagian C — Aksesibilitas, Pembersihan & Merge (Step 12 – Step 13)
13. **Step 12 (`0ac283a` — `chore: rapikan form dan aksesibilitas`):**
    - Penambahan atribut aksesibilitas form (`id`, `name`, `htmlFor`), alt image, serta halaman legalitas ([`/privacy`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/privacy/page.tsx) & [`/terms`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/terms/page.tsx)).
14. **Step 13 (`2ae4ec6`, `bb7c667`):**
    - Penggabungan branch kerja ke `master` dan perbaikan kesesuaian skema produk untuk fallback checkout di lingkungan serverless.

---

### Bagian D — Arsitektur Keamanan, RLS Supabase & Figma Mobile (Step 14 – Step 21)
15. **Step 14 (Audit Keamanan Menyeluruh):**
    - Identifikasi kerentanan cookie unsigned lama (`hingo_user_email`), fallback secret, penyimpanan ganda, dan tabel terbuka tanpa RLS.
16. **Step 15 (`6951d63` — `fix(auth): sesi bertanda tangan dan otorisasi per pengguna`):**
    - Autentikasi modern berbasis cookie `hingo_session` bertanda tangan **HMAC-SHA256** menggunakan `SESSION_SECRET` (HttpOnly, Secure, SameSite=Lax, masa berlaku 30 hari).
    - Proteksi Edge Middleware untuk rute `/admin` khusus `role === "ADMIN"`.
    - Otorisasi ketat per pengguna pada seluruh rute API sensitif (`/api/orders`, `/api/consignments`, `/api/payouts`, `/api/chat`).
17. **Step 16 (`e62fcd4` — `fix(auth): otp aman dan mode demo eksplisit`):**
    - Pembuatan [`src/lib/otp.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/otp.ts): hashing HMAC-SHA256, masa kedaluwarsa 5 menit, lockout 15 menit setelah 5 kali gagal, cooldown 60 detik.
    - Banner mode demo eksplisit di antarmuka verifikasi OTP; respons `/api/auth/send-otp` tidak membocorkan kode ke browser.
18. **Step 17 (`5d4fc3e` — `fix: hapus fallback secret dan wajibkan env`):**
    - Modul [`src/lib/env.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/env.ts) dengan helper `requireEnv()` (*fail-fast*).
    - Penghapusan seluruh fallback secret hardcoded di kode dan dokumentasi.
19. **Step 18 (`e04b4a9` — `chore: satu sumber data dan bersihkan data uji`):**
    - Checkout dan Orders membaca dan menulis langsung ke **Supabase** sebagai *Single Source of Truth*.
    - Pembersihan entri uji lama (`Pengguna 5432`) di basis data setelah persetujuan pengguna.
20. **Step 19 (`4b99638` — `fix: keranjang tamu pindah ke localStorage`):**
    - Keranjang dan wishlist tamu dialihkan murni ke `localStorage` (schema minimal `< 400 bytes`, aman SSR, batas 20 item, stok preloved 1 unit, rehidrasi Supabase `/api/products`, merge otomatis saat login, dan flush saat logout).
21. **Step 20 (`cf9abef` — `style: selaraskan tampilan desktop dan mobile dengan figma (step 20)`):**
    - Penyelarasan pixel-perfect terhadap frame desktop & mobile 390px Figma via Figma MCP.
    - Header Beranda mobile dengan tagline *"Gear titipan, kami urus."*, bottom search bar khusus Beranda, hero ringkas kartu miring, baris 4 ikon kategori *"Mau cari apa?"*, strip garansi Hingo, dan perampingan form OTP/Checkout.
22. **Step 21 (Verifikasi Produksi Vercel Awal):**
    - 9 skenario pengujian fungsional dan penolakan keamanan lolos langsung di produksi.
23. **Step 17B (`47cea33` — `fix(db): aktifkan RLS dan kunci bucket`):**
    - Penerapan migration [`supabase/migrations/20261112_lock_rls_and_storage.sql`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/supabase/migrations/20261112_lock_rls_and_storage.sql).
    - RLS aktif pada 12 tabel `public`, akses publik `anon` dibatasi hanya `SELECT` produk aktif (`status = 'AVAILABLE'`), tabel sensitif dikunci rapat.
    - [`src/lib/supabase.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/supabase.ts) server client dihubungkan ke `SUPABASE_SERVICE_ROLE_KEY`.

---

### Bagian E — Penutupan Celah Keamanan Akhir (Step 22)
24. **Step 22 (`57670e6` — `fix: tutup sisa celah demo otp dan git`):**
    - **Proteksi Akun Administrator:**
      - Akun admin (`admin@hingo.id` dan seed admin) **dilarang keras** masuk menggunakan kode demo (`DEMO_OTP_CODE`). Upaya login admin via kode demo langsung ditolak dengan **HTTP 403 Forbidden**.
      - Admin wajib masuk lewat jalur terpisah menggunakan OTP acak kriptografis (`crypto.randomInt`).
      - Login via kode demo tidak dapat membuat atau menaikkan role pengguna (role dikunci sebagai `USER`).
      - Nilai rahasia kode demo dibersihkan dari kode dan repositori git ([`.env.example`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.env.example#L26) menggunakan placeholder `your-demo-otp-code`).
    - **Higienitas Git & Database Lokal:**
      - File `prisma/dev.db` yang sebelumnya ter-track di-untrack dari indeks Git (`git rm --cached prisma/dev.db`).
      - Pola `*.db`, `dev.db`, `prisma/*.db`, dan `wa_auth*` ditambahkan ke [`.gitignore`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/.gitignore#L44-L55).
      - Hasil `git ls-files | Select-String -Pattern "dev\.db|\.env|wa_auth"` kini hanya menyisakan `.env.example`.
      - Dilaporkan bahwa `dev.db` sebelumnya berisi 4 entri pengguna uji/lokal yang kini telah diamankan dari pelacakan git.
    - **Proteksi WhatsApp Gateway di Lingkungan Serverless:**
      - Menambahkan kondisi `isWhatsAppGatewayEnabled()` di [`src/lib/whatsapp-gateway.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/whatsapp-gateway.ts#L29-L38):
        - Baileys dinonaktifkan di Vercel (`process.env.VERCEL`).
        - Baileys dilarang menulis ke disk (`./wa_auth_session`) di produksi.
        - Hanya aktif jika variabel `ENABLE_WHATSAPP_GATEWAY=true` disetel di mesin lokal.
    - **Generator OTP Aman:**
      - Mengganti `Math.random` di [`src/lib/otp.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/otp.ts#L88) menjadi `crypto.randomInt(100000, 1000000).toString()`.
    - **Pemeriksaan Bundle Klien (`.next/static`):**
      - Pemindaian seluruh berkas statis menghasilkan `Static bundle matches count: 0` (tidak ada token `SUPABASE_SERVICE_ROLE_KEY` atau `service_role` yang bocor ke browser).
    - **Verifikasi Produksi & Deployment:**
      - Build lokal lulus tanpa error TypeScript/ESLint.
      - Deployment produksi berhasil diperbarui ke `https://hinggo.vercel.app` (`dpl_EaFD6QRLsooxpFw4LDZcenwCYCoZ`).

---

## 3. Hasil Pengujian Nyata di Produksi (Step 22)

Pengujian dijalankan langsung melalui permintaan HTTP nyata terhadap domain produksi `https://hinggo.vercel.app`:

```
================================================================================
UJI 1: Proteksi Login Admin via Demo OTP
Target    : POST https://hinggo.vercel.app/api/auth/verify-otp
Payload   : {"target":"admin@hingo.id","otpCode":"123456"}
Status    : 403 Forbidden
Respons   : {"error":"Kode demo tidak berlaku untuk akun administrator. Harap gunakan kode OTP resmi yang dikirimkan."}
Hasil     : LOLOS (Celah eskalasi hak akses tertutup total)

--------------------------------------------------------------------------------
UJI 2: Login Akun Pembeli Demo
Target    : POST https://hinggo.vercel.app/api/auth/verify-otp
Payload   : {"target":"buyer1@gmail.com","otpCode":"123456"}
Status    : 200 OK
Respons   : {"success":true,"user":{"email":"buyer1@gmail.com","role":"USER",...}}
Hasil     : LOLOS (Alur pengujian pembeli tetap berfungsi mulus)

--------------------------------------------------------------------------------
UJI 3: Penolakan Cookie Palsu / Legacy Tanpa Tanda Tangan
Target    : GET https://hinggo.vercel.app/api/orders
Header    : Cookie: hingo_user_email=admin@hingo.id
Status    : 401 Unauthorized
Respons   : {"error":"Unauthorized. Sesi login diperlukan."}
Hasil     : LOLOS (Sesi hanya menerima hingo_session valid HMAC-SHA256)

--------------------------------------------------------------------------------
UJI 4: Penolakan Kode OTP Salah
Target    : POST https://hinggo.vercel.app/api/auth/verify-otp
Payload   : {"target":"buyer1@gmail.com","otpCode":"888888"}
Status    : 400 Bad Request
Respons   : {"error":"Kode verifikasi salah atau tidak cocok. (Percobaan 1/5)"}
Hasil     : LOLOS (Anti-bruteforce dan rate limiting aktif)

--------------------------------------------------------------------------------
UJI 5: Uji RLS Supabase Menggunakan Kunci Publik (Anon Key)
Tabel users        -> HTTP: 200 | Data terbaca: 0 baris ([])
Tabel orders       -> HTTP: 200 | Data terbaca: 0 baris ([])
Tabel consignments -> HTTP: 200 | Data terbaca: 0 baris ([])
Hasil              : LOLOS (Data privat pengguna tidak dapat diintip publik)

--------------------------------------------------------------------------------
UJI 6: Katalog Produk Publik
Target    : GET https://hinggo.vercel.app/api/products
Status    : 200 OK
Hasil     : LOLOS (Katalog memuat data produk aktif secara responsif)
================================================================================
```

---

## 4. Daftar File Utama Proyek

- **Autentikasi & Keamanan:**
  - [`src/lib/auth.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/auth.ts) — Token sesi `hingo_session` HMAC-SHA256 & verifikasi identitas.
  - [`src/lib/otp.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/otp.ts) — Generator OTP `crypto.randomInt`, proteksi admin, hashing, lockout.
  - [`src/lib/env.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/env.ts) — Fail-fast environment variable validation.
  - [`src/middleware.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/middleware.ts) — Edge middleware authorization untuk rute terproteksi & `/admin`.
  - [`src/lib/whatsapp-gateway.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/whatsapp-gateway.ts) — Serverless guard Baileys agar tidak jalan di Vercel.
- **Database & RLS:**
  - [`src/lib/supabase.ts`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/supabase.ts) — Dual client: Browser (`anon key`) & Server (`SUPABASE_SERVICE_ROLE_KEY`).
  - [`supabase/migrations/20261112_lock_rls_and_storage.sql`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/supabase/migrations/20261112_lock_rls_and_storage.sql) — Definisi RLS 12 tabel publik & penguncian bucket.
- **State & Komponen Antarmuka:**
  - [`src/lib/store.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/lib/store.tsx) — Keranjang & Wishlist tamu `localStorage` + rehidrasi Supabase.
  - [`src/components/layout/Navbar.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Navbar.tsx), [`Footer.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/Footer.tsx), [`MobileBottomNav.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/layout/MobileBottomNav.tsx)
  - [`src/components/ui/ProductCard.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/components/ui/ProductCard.tsx)
- **Halaman Aplikasi:**
  - [`src/app/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/page.tsx) — Beranda (Desktop 1440px & Mobile 390px sesuai Figma).
  - [`src/app/catalog/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/catalog/page.tsx) — Katalog & Filter.
  - [`src/app/cart/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/cart/page.tsx) & [`src/app/checkout/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/checkout/page.tsx) — Keranjang & Checkout Escrow.
  - [`src/app/auth/login/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/login/page.tsx) & [`src/app/auth/verify-otp/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/auth/verify-otp/page.tsx) — Alur masuk & verifikasi OTP.
  - [`src/app/seller/consignments/page.tsx`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/src/app/seller/consignments/page.tsx) — Dashboard Titip Jual.

---

## 5. Ringkasan Status Akhir & Rekomendasi

1. **Status Produksi:**
   - Aplikasi live dan sehat di [https://hinggo.vercel.app](https://hinggo.vercel.app).
   - Seluruh celah keamanan utama (cookie pemalsuan, kebocoran tabel Supabase tanpa RLS, eskalasi peran via demo OTP, pelacakan file SQLite di Git) telah **ditutup sepenuhnya**.
2. **Data Bersih:**
   - Seluruh tabel sensitif bersih dari kebocoran ke publik.
3. **Pembersihan Data Uji:**
   - Tersedia 1 record produk uji (`34a56500-9f16-4880-962f-e69cb3df4d06` - Sennheiser HD 660S2) yang siap dihapus dari Supabase dengan query persetujuan:
     ```sql
     DELETE FROM products WHERE id = '34a56500-9f16-4880-962f-e69cb3df4d06';
     ```
