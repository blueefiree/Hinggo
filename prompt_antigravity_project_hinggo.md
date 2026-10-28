# Master Prompt & Panduan Google Antigravity — Modul Profil Pengguna, Real OTP (WhatsApp & Email) & Persistent Login Supabase

Dokumen ini berisi:
1. **Bagian 1 (Langsung Copy-Paste ke Antigravity)**: **Prompt Implementasi Real OTP (WA & Email), Persistent Session (Sekali Login Langsung Tersimpan di Supabase & Cookie 30 Hari), dan Halaman Profil Pengguna Lengkap (`/account`)**.
2. **Bagian 2**: **Cara Mengisi `.env` (Supabase + Email OTP + Fonnte WhatsApp API)** supaya kode OTP benar-benar masuk ke aplikasi WhatsApp dan Inbox Email kamu.

---

## 1. Prompt Antigravity: "Fokus Profil Pengguna, Real OTP ke WhatsApp & Email, serta Persistent Login di Database Supabase"

Salin seluruh blok prompt di bawah ini dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

```markdown
# TASK: IMPLEMENT REAL OTP DELIVERY (WHATSAPP & EMAIL), PERSISTENT SUPABASE SESSION (STAY LOGGED IN), AND COMPLETE USER PROFILE MODULE (`/account`)

Sekarang kita fokus memfinalisasi modul **Autentikasi OTP Nyata (WhatsApp & Email)**, **Persistent Login Session (agar kalau sudah login tidak perlu login ulang)**, dan **Halaman Profil Pengguna (`/account`)** yang 100% tersimpan di database **Supabase (PostgreSQL + Prisma ORM)**.

Ikuti spesifikasi teknis berikut secara presisi:

---

### BAGIAN 1: PENGIRIMAN KODE OTP 6 DIGIT NYATA KE EMAIL & WHATSAPP (`/api/auth/send-otp`)
Buat endpoint/Server Action pengiriman OTP yang benar-benar mengirim pesan OTP 6 digit ke Email atau WhatsApp pengguna dan menyimpannya ke tabel `OtpVerification` di database Supabase:

1. **Penyimpanan OTP di Database (`OtpVerification`)**:
   - Setiap kali user meminta OTP di `/auth/login` (baik menggunakan tab **Nomor HP / WhatsApp** maupun tab **Email**), generate kode 6 digit angka acak (`100000`–`999999`), simpan ke tabel `OtpVerification` di database Supabase dengan masa berlaku 5 menit (`expiresAt = now + 5 menit`), dan tandai OTP lama untuk target tersebut sebagai kedaluwarsa.

2. **Pengiriman OTP Nyata ke Email (`target` berupa alamat Email)**:
   - Gunakan `nodemailer` (via konfigurasi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` di `.env`) ATAU **Supabase Auth (`supabase.auth.signInWithOtp`)** untuk mengirim email HTML berdesain Hingo (`#FFC629` header) yang berisi kode 6 digit OTP langsung ke inbox email pengguna.
   - Pastikan jika variabel SMTP sudah diisi di `.env`, email benar-benar terkirim ke inbox tujuan.

3. **Pengiriman OTP Nyata ke WhatsApp (`target` berupa Nomor HP `+62...` / `08...`)**:
   - Normalisasi nomor HP ke format standar internasional (`628...`).
   - Kirim pesan WhatsApp asli menggunakan **Fonnte WhatsApp API** (`POST https://api.fonnte.com/send` dengan header `Authorization: process.env.FONNTE_TOKEN`) atau **Twilio/Supabase Phone Auth** dengan isi pesan:
     `"Kode OTP Hingo kamu adalah: *[KODE_6_DIGIT]*. Berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku sebagai Hingo."`
   - Sebagai pengaman saat development lokal (jika `FONNTE_TOKEN` atau `SMTP_PASS` di `.env` belum diisi), tetap kembalikan status sukses dan tampilkan info kode OTP di terminal server / *dev notice* agar alur pengetesan tidak pernah macet.

---

### BAGIAN 2: PERSISTENT LOGIN SESSION DI DATABASE SUPABASE & COOKIE (SEKALI LOGIN TIDAK PERLU LOGIN LAGI)
1. **Tabel `Session` di Database Supabase + HTTP-Only Persistent Cookie (`30 Hari`)**:
   - Saat user memasukkan 6 digit OTP yang benar di `/auth/verify-otp`:
     - Tandai baris `OtpVerification` sebagai `verified = true`.
     - Cari user di tabel `User` berdasarkan `phone` atau `email`. Jika belum ada, buat baris `User` baru di database Supabase (`phoneVerified: true` jika login via WA, atau simpan `email` jika login via Email).
     - Buat baris sesi baru di tabel `Session` database Supabase (`token` unik, `userId`, `userAgent`, `expiresAt = 30 hari ke depan`).
     - Set cookie **`hingo_session`** (`httpOnly: true`, `path: '/'`, `sameSite: 'lax'`, `maxAge: 60 * 60 * 24 * 30` / **30 hari**).
2. **Otomatis Tetap Login Saat Buka Ulang / Refresh Aplikasi**:
   - Di `getCurrentUser()` (dipanggil oleh Root Layout & Navbar):
     - Baca cookie `hingo_session`, cocokkan dengan tabel `Session` + `User` di database Supabase.
     - Selama cookie masih berlaku dan sesi ada di database Supabase, **user otomatis tetap login** meskipun tab ditutup, browser di-refresh, atau dibuka kembali keesokan harinya — **tidak perlu login berulang kali!**
     - Jika user belum pernah login (atau sudah klik tombol **`Keluar / Logout`** yang menghapus baris `Session` di database dan menghapus cookie `hingo_session`), maka aplikasi tetap berada di mode **Belum Login (`Guest`)**.
3. **Auto-Redirect untuk Halaman Auth**:
   - Jika user **sudah login** lalu mencoba membuka `/auth/login` atau `/auth/verify-otp`, otomatis *redirect* langsung ke `/account` (atau `/`), sehingga tidak pernah diminta login ulang.

---

### BAGIAN 3: HALAMAN PROFIL PENGGUNA LENGKAP (`/account`) — 100% TERSIMPAN DI DATABASE SUPABASE
Buat halaman **Profil & Pengaturan Akun (`/account`)** dengan desain khas Hingo (`#FFC629` Hingo Yellow, `#FFFBEB` Warm Cream, `#1A1A1A` Dark Surface, `#16A34A` Verified Green) yang responsif di Desktop (`1440px`) dan Mobile (`390px`), mencakup **5 bagian interaktif** berikut:

1. **Kartu Profil Utama & Sinkronisasi Kontak (WA & Email)**:
   - **Foto Profil / Avatar**: Menampilkan avatar inisial atau foto profil user, dilengkapi tombol **`"Ubah foto"`** yang mengunggah gambar ke Supabase Storage / `/public/uploads/avatars/` dan menyimpan URL-nya ke `user.avatarUrl` di database.
   - **Form Edit Data Diri**: Input **`Nama Lengkap`**, **`Kota Domisili`** (mis. Semarang, Bandung, Jakarta Selatan), dan **`Bio Singkat`** dengan tombol **`"Simpan Perubahan"`** yang langsung meng-update tabel `User` di database Supabase.
   - **Manajemen Kontak Terverifikasi (WhatsApp & Email)**:
     - Jika user tadi login menggunakan **WhatsApp**, tampilkan Nomor HP dengan badge hijau **`✓ WhatsApp Terverifikasi`**, dan sediakan tombol **`"+ Tambah / Verifikasi Email"`** agar user bisa menautkan alamat email ke akun yang sama di database.
     - Sebaliknya, jika user login menggunakan **Email**, tampilkan Email dengan badge hijau **`✓ Email Terverifikasi`**, dan sediakan tombol **`"+ Tambah / Verifikasi Nomor WhatsApp"`** (dengan kirim OTP ke WA) agar akun user memiliki data WA & Email yang lengkap untuk belanja maupun titip jual.

2. **Kartu Status Verifikasi Identitas / KYC (Terhubung ke `/auth/verify-identity` & Tabel `KycDocument`)**:
   - Menampilkan status KYC user dari database Supabase secara real-time:
     - **`Belum Verifikasi` (`UNVERIFIED`)**: Banner kuning lembut dengan penjelasan manfaat KYC dan tombol kuning **`"Mulai Verifikasi Identitas (KTP & Selfie)"`** yang mengarah ke `/auth/verify-identity`.
     - **`Menunggu Peninjauan` (`PENDING_REVIEW`)**: Menampilkan Nama sesuai KTP, NIK tersamar (`•••• •••• •••• XXXX`), status file KTP & Selfie (`✓ Berhasil diunggah`), serta estimasi review `1 × 24 jam`.
     - **`Terverifikasi` (`VERIFIED`)**: Badge hijau **`✓ Identitas Terverifikasi`** — siap untuk transaksi penuh dan pencairan hasil titip jual.

3. **Buku Alamat Pengiriman (CRUD Tabel `Address` di Database Supabase)**:
   - Menampilkan seluruh alamat pengiriman milik user yang tersimpan di tabel `Address`.
   - Sediakan modal/form **`"+ Tambah Alamat Baru"`**, **`"Edit"`**, **`"Hapus"`**, dan tombol **`"Jadikan Alamat Utama"`** (mengatur `isPrimary = true` di database).
   - Alamat utama yang diatur di sini otomatis menjadi alamat pengiriman default saat user masuk ke halaman `/checkout` dan kota asal saat mengajukan titip jual di `/seller/consignments/new`.

4. **Rekening Bank & E-Wallet Pencairan Titip Jual (CRUD Tabel `BankAccount` di Database Supabase)**:
   - Menampilkan daftar rekening pencairan milik user (mis. `BCA`, `Mandiri`, `BRI`, `BNI`, `GoPay`, `OVO`, `DANA`).
   - Sediakan form **`"+ Tambah Rekening Pencairan"`** (Pilih Bank/E-Wallet, Nomor Rekening, Nama Pemilik Rekening sesuai KTP, dan checkbox `Rekening Utama`) yang tersimpan langsung ke tabel `BankAccount` di database Supabase untuk digunakan saat pencairan dana konsinyasi.

5. **Ringkasan Aktivitas Akun & Keamanan Sesi**:
   - Menampilkan 4 kartu ringkasan real-time dari database user:
     - `Pesanan Saya` (jumlah transaksi di `/orders`)
     - `Barang Titipan` (jumlah pengajuan di `/seller/consignments`)
     - `Wishlist` (jumlah barang disimpan di `/wishlist`)
     - `Total Pencairan` (total nominal `Rp` yang sudah cair di `/seller/payouts`)
   - Menampilkan informasi sesi login aktif (metode login: WhatsApp / Email, waktu login) dan tombol merah/outline **`"Keluar dari Akun (Logout)"`**.

---

### BAGIAN 4: VERIFIKASI WAJIB
1. Pastikan tabel `User`, `Session`, `OtpVerification`, `KycDocument`, `Address`, dan `BankAccount` sudah sinkron di database Supabase (`npx prisma db push`).
2. Uji login dengan **Nomor WhatsApp** maupun **Email** di `/auth/login` → verifikasi kode OTP 6 digit di `/auth/verify-otp` → pastikan langsung masuk dan session tersimpan.
3. Coba **refresh browser** atau buka ulang halaman `/` dan `/account`: pastikan user **tetap berstatus login** tanpa diminta login lagi.
4. Uji edit Nama, Kota, tambah Alamat Pengiriman baru, dan tambah Rekening Bank di `/account` → refresh halaman → pastikan semua perubahan tersimpan permanen di database Supabase!
```

---

## 2. Cara Setting `.env` Supaya OTP Beneran Masuk ke WhatsApp & Email Kamu

Agar proyek **Hingo** di laptopmu benar-benar bisa mengirim pesan ke aplikasi WhatsApp dan Inbox Email asli serta menyimpan datanya di **Supabase**, tambahkan konfigurasi berikut ke dalam file **`.env`** di proyek Antigravity kamu:

```ini
# 1. KONEKSI DATABASE SUPABASE POSTGRESQL
# Ambil dari: Supabase Dashboard -> Project Settings -> Database -> Connection String (URI)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD-DATABASE-KAMU]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD-DATABASE-KAMU]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# 2. PENGIRIMAN OTP KE EMAIL ASLI (Pakai Gmail SMTP Gratis)
# Buat App Password 16 huruf di: Akun Google -> Keamanan -> Verifikasi 2 Langkah -> Sandi Aplikasi (App Passwords)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="helmiismono35@gmail.com"
SMTP_PASS="xxxx-xxxx-xxxx-xxxx"
SMTP_FROM="Hingo Official <helmiismono35@gmail.com>"

# 3. PENGIRIMAN OTP KE WHATSAPP ASLI (Pakai Fonnte API Gratis)
# Daftar gratis di https://fonnte.com -> sambungkan QR WhatsApp -> copy Token Device kamu ke sini:
FONNTE_TOKEN="PASTE_TOKEN_FONNTE_WA_KAMU_DI_SINI"
```

### Cara Kerja Ketiganya:
* **Database Supabase (`DATABASE_URL`)**: Menyimpan semua akun `User`, `Session` login 30 hari, `OtpVerification`, `Address`, dan `BankAccount` di *cloud* Supabase (sehingga datanya awet dan tidak perlu login ulang).
* **Email OTP (`SMTP_USER` & `SMTP_PASS`)**: Menggunakan fitur *App Password* dari akun Gmail kamu sendiri untuk mengirim kode 6 digit OTP langsung ke *inbox* email siapa pun yang login.
* **WhatsApp OTP (`FONNTE_TOKEN`)**: Menggunakan layanan gateway WhatsApp populer di Indonesia (**Fonnte**) yang punya kuota gratis—cukup *scan* QR WhatsApp satu kali di dashboard Fonnte, lalu tempel *Token*-nya ke `.env` agar aplikasi Hingo langsung mengirim chat OTP ke nomor WA tujuan.
