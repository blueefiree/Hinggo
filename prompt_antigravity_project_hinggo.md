# Prompt Perbaikan Spesifik Login, Redirect Auth & Pengiriman OTP (Berdasarkan Struktur File `Hinggo` Kamu)

Berdasarkan dokumentasi `HINGGO_PROJECT_STRUCTURE.md` yang kamu kirimkan (`Next.js 16.4.3 Turbopack` + `Prisma SQLite` + `Supabase`), berikut adalah **biang kerok (root cause)** kenapa ketiga masalah tadi terjadi di proyekmu:

1. **Kenapa Login Error (`500` / gagal saat buat user ke-2)**:
   - Di `Next.js 16`, fungsi `cookies()` wajib menggunakan `await cookies()`.
   - Di `prisma/schema.prisma` & `supabase`, kolom `phone` dan `email` bertipe `UNIQUE`. Saat user login pakai Nomor HP, jika kode mengisi `email: ""` (string kosong, bukan `null`/`undefined`), maka login berikutnya langsung *error* karena duplikat string kosong `""`!
2. **Kenapa Kalau Sudah Login Masih Bisa Buka Halaman Login (dan Sebaliknya)**:
   - `src/middleware.ts` dan `src/app/auth/login/page.tsx` belum memiliki logika **Guest-Only Redirect** (melempar user yang sudah login dari `/auth/login` ke `/account`).
   - Saat selesai verifikasi OTP di `/auth/verify-otp`, aplikasi hanya memanggil `router.push('/account')` tanpa me-*reload* `StoreProvider` (`src/lib/store.tsx`), sehingga `Navbar.tsx` masih mengira user belum login dan masih menampilkan tombol `Masuk`.
3. **Kenapa OTP Tidak Langsung Terkirim ke Email & WA**:
   - Di file `.env` kamu, variabel `FONNTE_TOKEN=`, `SMTP_USER=`, dan `SMTP_PASS=` **masih kosong**!
   - Untuk **Email**: `src/lib/otp-sender.ts` hanya mencoba memakai `nodemailer` (yang kosong di `.env`), padahal kamu sudah punya **Supabase Auth (`supabase.auth.signInWithOtp`)** yang bisa langsung mengirim email OTP gratis tanpa perlu setting SMTP Gmail!
   - Untuk **WhatsApp**: Di Next.js 16 Turbopack, instance `@whiskeysockets/baileys` harus disimpan di `globalThis` agar tidak ter-putus saat *hot-reload*, atau menggunakan `FONNTE_TOKEN`.

---

## 1. Prompt Antigravity: "Perbaiki Total Error Login, Logic Sudah Login vs Belum Login, dan Pengiriman OTP WA/Email"

Salin **seluruh blok prompt di bawah ini** dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

````markdown
# TASK: FIX LOGIN ERRORS, ENFORCE STRICT "ALREADY LOGGED IN VS NOT LOGGED IN" LOGIC ACROSS ALL PAGES & NAVBAR, AND FIX REAL WHATSAPP & EMAIL OTP DELIVERY IN NEXT.JS 16

Berdasarkan struktur proyek saat ini (`Next.js 16.4.3`, `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/store.tsx`, `src/lib/otp-sender.ts`, `src/lib/whatsapp-gateway.ts`, `src/app/api/auth/*`, `src/app/auth/login/page.tsx`, `src/app/auth/verify-otp/page.tsx`, dan `src/components/layout/Navbar.tsx`), tolong perbaiki 4 masalah kritis berikut secara tuntas:

====================================================================
PERBAIKAN 1: HILANGKAN SEMUA ERROR SAAT LOGIN & VERIFIKASI OTP (`/api/auth/send-otp` & `/api/auth/verify-otp`)
====================================================================

1. **Perbaiki `await cookies()` untuk Next.js 16**:
   - Di `src/lib/auth.ts`, `src/app/api/auth/verify-otp/route.ts`, `src/app/api/auth/session/route.ts`, dan semua API route lainnya, pastikan pemanggilan `cookies()` dari `next/headers` selalu menggunakan `const cookieStore = await cookies()`.
2. **Perbaiki Unique Constraint Error (`phone` & `email` Null Handling)**:
   - Saat user login menggunakan **Nomor HP (WhatsApp)**, simpan `phone: normalizedPhone` dan pastikan `email` diisi `null` (JANGAN pernah diisi string kosong `""` karena akan menyebabkan error `Unique constraint failed on the fields: (email)` untuk user kedua!).
   - Sebaliknya, saat user login menggunakan **Email**, simpan `email: normalizedEmail` dan pastikan `phone` diisi `null` (bukan `""`).
3. **Fault-Tolerant Dual-Database Sync (Prisma SQLite + Supabase)**:
   - Di `/api/auth/send-otp` dan `/api/auth/verify-otp`, bungkus setiap operasi ke Supabase (`supabase.from(...)`) di dalam `try { ... } catch (err) { console.warn(...) }` yang aman sehingga meskipun tabel di cloud Supabase belum disinkronkan atau terkena RLS, penyimpanan ke database Prisma lokal (`prisma/dev.db`) tetap sukses 100% dan login TIDAK PERNAH gagal/error 500!
4. **Logout API Route (`POST /api/auth/logout`)**:
   - Pastikan ada endpoint `POST /api/auth/logout/route.ts` yang menghapus sesi dari database (`prisma.session.deleteMany`), menghapus cookie `hingo_user_id` dan `hingo_session` (`cookieStore.delete('hingo_user_id')`, `cookieStore.delete('hingo_session')`), serta memanggil `supabase.auth.signOut()`.

====================================================================
PERBAIKAN 2: LOGIC TEGAS "KALAU SUDAH LOGIN GA USAH LOGIN LAGI, KALAU BELUM LOGIN SURUH LOGIN" (`src/middleware.ts`, `Navbar.tsx`, `store.tsx`, `auth/login`)
====================================================================

1. **Update `src/middleware.ts` (Two-Way Auth Guard)**:
   - Baca cookie `hingo_user_id` dan `hingo_session` dari `request.cookies`.
   - `const isAuthenticated = Boolean(request.cookies.get('hingo_user_id')?.value || request.cookies.get('hingo_session')?.value);`
   - **ATURAN A — JIKA SUDAH LOGIN (`isAuthenticated === true`)**:
     - Jika user membuka halaman `/auth/login` atau `/auth/verify-otp`, **WAJIB langsung redirect ke `/account`** (`NextResponse.redirect(new URL('/account', request.url))`). User yang sudah login TIDAK BOLEH melihat halaman login lagi!
   - **ATURAN B — JIKA BELUM LOGIN (`isAuthenticated === false`)**:
     - Jika user membuka halaman privat: `/account`, `/cart`, `/checkout`, `/wishlist`, `/orders`, `/seller`, `/chat`, atau `/admin` (beserta sub-rutenya), **WAJIB langsung redirect ke `/auth/login?callbackUrl=` + encodeURIComponent(pathname)**.

2. **Update `src/app/auth/login/page.tsx` & `src/app/auth/verify-otp/page.tsx`**:
   - Tambahkan pengecekan di sisi Client (`useEffect`) menggunakan `user` dari `useStore()` / `/api/auth/session`: jika `user` sudah ada (`user !== null`), langsung jalankan `router.replace('/account')` agar halaman login tidak pernah tampil bagi user yang sudah login.
   - Pada `/auth/verify-otp/page.tsx`, saat `POST /api/auth/verify-otp` berhasil (`res.ok`):
     - Panggil fungsi `await refreshSession()` di `store.tsx`.
     - Gunakan **`window.location.href = data.redirectTo || '/account'`** (hard navigation reload) supaya seluruh Server Components, `Navbar.tsx`, `MobileBottomNav.tsx`, dan Cookie Middleware langsung ter-update 100% ke status **SUDAH LOGIN** tanpa nyangkut di state lama!

3. **Update `src/components/layout/Navbar.tsx` & `MobileBottomNav.tsx`**:
   - **Saat BELUM LOGIN (`user === null`)**:
     - Tampilkan tombol kuning **`Masuk`** yang mengarah ke `/auth/login`.
     - Jika user mengklik ikon Keranjang, Wishlist, Chat, atau menu `Titip jual` di Navbar saat belum login, arahkan langsung ke `/auth/login?callbackUrl=...`.
   - **Saat SUDAH LOGIN (`user !== null`)**:
     - **Sembunyikan total tombol `Masuk`!** Jangan pernah menampilkan tombol `Masuk` jika user sudah login.
     - Sebagai gantinya, tampilkan tombol pill **Profil Pengguna** (menampilkan avatar + nama user atau nomor/email user) yang jika diklik membuka `/account` (atau dropdown berisi link ke `/account` Profil Saya, `/orders` Pesanan Saya, `/seller/consignments` Barang Titipan Saya, dan tombol merah **`Keluar / Logout`**).

4. **Proteksi Aksi di Halaman Publik (`ProductCard.tsx` & `/product/[slug]/page.tsx`)**:
   - Jika pengunjung yang **belum login (`!user`)** menekan tombol **`Tambah keranjang`**, **`Beli Sekarang`**, ikon hati **`Wishlist (♡)`**, atau **`Chat admin`**, jangan jalankan API yang gagal—langsung arahkan pengunjung ke `/auth/login?callbackUrl=...` dengan pesan toast `"Silakan masuk terlebih dahulu untuk melanjutkan"`.

====================================================================
PERBAIKAN 3: PASTIKAN OTP LANGSUNG TERKIRIM KE EMAIL & WHATSAPP (TANPA DELAY / MACET)
====================================================================

1. **Pengiriman OTP ke Email (`src/lib/otp-sender.ts` & `/api/auth/send-otp`)**:
   - Saat ini `.env` memiliki `SMTP_USER=` kosong sehingga `nodemailer` gagal mengirim email.
   - Perbaiki agar pengiriman Email OTP mendukung **3 jalur otomatis**:
     a) **Jalur 1 — Supabase Auth Built-in Email (`supabase.auth.signInWithOtp`)**: Panggil `await supabase.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } })` menggunakan client Supabase (`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` yang sudah aktif) sehingga Supabase langsung mengirim email autentikasi asli ke inbox user tanpa butuh `SMTP_PASS`! Di `/auth/verify-otp`, jika user memverifikasi email, cek baik ke tabel `OtpVerification` lokal maupun `supabase.auth.verifyOtp({ email: target, token: otpCode, type: 'email' })`.
     b) **Jalur 2 — Nodemailer SMTP / Ethereal Real Email Preview**: Jika `process.env.SMTP_USER` dan `process.env.SMTP_PASS` diisi di `.env` (atau diinput lewat modal pengaturan SMTP/WA di halaman login), kirim langsung via Gmail SMTP. Jika belum diisi, buat akun SMTP instan otomatis menggunakan `nodemailer.createTestAccount()` dan kembalikan `emailPreviewUrl: nodemailer.getTestMessageUrl(info)` di response `/api/auth/send-otp` supaya user bisa mengklik link **"Buka Inbox Email OTP"** langsung dari layar jika SMTP Gmail belum diisi!

2. **Pengiriman OTP ke WhatsApp (`src/lib/whatsapp-gateway.ts` & `/api/auth/send-otp`)**:
   - Di Next.js 16 Turbopack, simpan instance socket Baileys dan status QR di **`globalThis.__hingoWaGateway`** (bukan variabel modul biasa) agar koneksi WhatsApp Web tidak pernah terputus saat ganti halaman atau hot-reload.
   - Dukung pengiriman via **Fonnte REST API (`https://api.fonnte.com/send`)**: sediakan input kecil di dalam modal **"Pengaturan Gateway WA"** pada halaman `/auth/login` dimana user bisa langsung menempelkan **Fonnte API Token** (disimpan ke file `.env.local` / database) ATAU langsung **Scan QR Code WhatsApp Web (Baileys)** di modal tersebut.
   - **Fitur Pengiriman Instan**:
     - Jika Baileys sudah `CONNECTED` atau `FONNTE_TOKEN` sudah terisi: saat klik `"Kirim OTP ke nomor HP"`, langsung kirim pesan WhatsApp:
       `"*[HINGO]* Kode OTP login kamu adalah: *[6_DIGIT_OTP]*\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun."`
     - **Jaminan Anti-Macet (Instant OTP Push Notification Banner)**: Apabila pada saat tombol `"Kirim OTP ke nomor HP"` atau `"Kirim OTP ke email"` ditekan ternyata QR WhatsApp belum di-scan dan `FONNTE_TOKEN` / `SMTP_PASS` di `.env` masih kosong, `/api/auth/send-otp` **WAJIB tetap berhasil (`200 OK`)** dan mengembalikan `devOtpCode: otpCode` ke halaman `/auth/verify-otp`. Di bagian atas halaman `/auth/verify-otp`, tampilkan **Notifikasi Pop-up / Banner Pesan Masuk Simulasi WhatsApp/Email** yang menampilkan kode 6 digit OTP tersebut dengan tombol **"Klik untuk Isi Otomatis (Auto-Fill OTP)"** serta tombol **"Hubungkan QR WhatsApp Asli"** — sehingga proses login **100% langsung jalan dalam 1 detik tanpa pernah error**, sembari user bisa menautkan QR WhatsApp kapan saja!

====================================================================
PERBAIKAN 4: VERIFIKASI END-TO-END
====================================================================
1. Uji alur saat **Belum Login**:
   - Buka `/` dan `/catalog`: pastikan di Navbar kanan atas hanya ada tombol kuning **`Masuk`**.
   - Buka `/account`, `/cart`, `/wishlist`, atau `/seller/consignments`: pastikan otomatis di-redirect ke `/auth/login`.
2. Uji alur **Login & OTP**:
   - Di `/auth/login`, masukkan Nomor HP (`0812...`) atau Email → klik **Kirim OTP**.
   - Pastikan tidak ada error 500, langsung masuk ke `/auth/verify-otp`, kode OTP langsung muncul/terkirim, dan saat klik **`Verifikasi & lanjutkan`**, halaman langsung berpindah ke **`/account` (Profil Pengguna)**.
3. Uji alur saat **Sudah Login**:
   - Pastikan di Navbar tombol `Masuk` **sudah hilang** dan berganti menjadi nama/profil user.
   - Coba ketik manual URL `http://localhost:3000/auth/login` di browser: pastikan otomatis dilempar kembali ke `/account` (karena sudah login, tidak boleh masuk ke halaman login lagi!).
   - Klik tombol **`Keluar (Logout)`** di `/account` atau Navbar: pastikan session terhapus, kembali ke mode belum login, dan tombol `Masuk` muncul kembali.
````

---

## 2. Cara Supaya WA & Email OTP Langsung Terkirim ke HP/Email Asli Kamu (Opsional di `.env.local`)

Di dokumentasi proyekmu tadi (Bagian 6), baris `FONNTE_TOKEN=`, `SMTP_USER=`, dan `SMTP_PASS=` masih kosong. Setelah kamu menjalankan prompt di atas:
1. **Tanpa isi `.env` pun login sudah 100% langsung jalan** (tidak akan error lagi, dan kode OTP langsung muncul di notifikasi atas layar + bisa di-*auto-fill* atau *scan* QR langsung dari halaman login).
2. Kalau kamu ingin pesan WhatsApp dikirim lewat server cloud **Fonnte** dan email dikirim lewat **Gmail** kamu sendiri, cukup isi 3 baris kosong di file `.env` / `.env.local` proyekmu:
   - `FONNTE_TOKEN=token_dari_web_fonnte_com`
   - `SMTP_USER=emailkamu@gmail.com`
   - `SMTP_PASS=16_huruf_app_password_google`