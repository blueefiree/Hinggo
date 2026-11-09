# Master Prompt All-in-One Google Antigravity — Perbaikan Login/Auth/OTP + Penyempurnaan Tampilan Mobile (`390px`) Persis Desain Figma

Dokumen ini menggabungkan **seluruh perbaikan fungsi (Login Error Fix, Logic Sudah Login vs Belum Login, Real OTP WhatsApp/Email, Zero Dummy Data)** dengan **spesifikasi tata letak Mobile (`390px`) dari ke-10 file PDF Mobile yang baru kamu lampirkan** ke dalam **SATU BLOK PROMPT UTUH** di bawah ini.

---

## 1. SATU PROMPT GABUNGAN (Copy-Paste ke Agent Chat Google Antigravity)

````markdown
# TASK: FIX LOGIN & TWO-WAY AUTH REDIRECTS, FIX REAL WHATSAPP/EMAIL OTP DELIVERY, AND PERFECT ALL MOBILE (`390px`) RESPONSIVE LAYOUTS TO MATCH THE EXACT FIGMA MOBILE DESIGNS

Tolong kerjakan pembaruan menyeluruh pada proyek **Hingo (`Hinggo` — Next.js 16.4.3 App Router)** yang mencakup **Perbaikan Sistem Login/OTP/Auth Guard** sekaligus **Penyesuaian Presisi Tampilan Mobile (`< 768px` / `390px`)** sesuai file desain Figma Mobile:

====================================================================
BAGIAN 1: PERBAIKI ERROR LOGIN, LOGIC "SUDAH LOGIN VS BELUM LOGIN" & PENGIRIMAN OTP WA/EMAIL
====================================================================

1. **Perbaiki Error Database & Cookie Saat Login (`/api/auth/send-otp` & `/api/auth/verify-otp`)**:
   - Di Next.js 16, pastikan semua pemanggilan `cookies()` dari `next/headers` menggunakan `const cookieStore = await cookies()`.
   - Saat user login menggunakan **Nomor HP**, isi `phone: normalizedPhone` dan pastikan `email` diisi `null` (JANGAN pernah diisi string kosong `""` agar tidak memicu error `Unique constraint failed on the fields: (email)`). Begitu pula saat login menggunakan **Email**, pastikan `phone` diisi `null` (bukan `""`).
   - Bungkus setiap sinkronisasi ke cloud Supabase (`supabase.from(...)`) dengan `try/catch` yang aman sehingga penyimpanan ke Prisma SQLite (`dev.db`) dan pembuatan session tidak pernah gagal/error 500.

2. **Logic Tegas "Kalau Sudah Login Ga Usah Login Lagi, Kalau Belum Login Suruh Login" (`src/middleware.ts`, `Navbar.tsx`, `store.tsx`)**:
   - **Di `src/middleware.ts`**:
     - Cek keberadaan cookie `hingo_user_id` atau `hingo_session`.
     - **JIKA SUDAH LOGIN**: Saat user membuka `/auth/login` atau `/auth/verify-otp`, **WAJIB langsung redirect ke `/account`**. User yang sudah login tidak boleh melihat halaman login lagi.
     - **JIKA BELUM LOGIN (`Guest`)**: Saat user membuka `/account`, `/cart`, `/checkout`, `/wishlist`, `/orders`, `/seller/*`, `/chat/*`, atau `/admin`, **WAJIB langsung redirect ke `/auth/login?callbackUrl=...`**.
   - **Di `/auth/login/page.tsx` & `/auth/verify-otp/page.tsx`**:
     - Jika state `user` di `useStore()` sudah terisi (`user !== null`), langsung jalankan `router.replace('/account')`.
     - Saat verifikasi OTP di `/auth/verify-otp` sukses, panggil `window.location.href = data.redirectTo || '/account'` agar seluruh state `Navbar`, `MobileBottomNav`, dan cookie ter-reload bersih sebagai **SUDAH LOGIN**.
   - **Di `Navbar.tsx` & Seluruh Tombol Aksi (`ProductCard.tsx`, `/product/[slug]`)**:
     - Saat **Sudah Login**: Sembunyikan tombol `Masuk` dan tampilkan pill Profil User (`/account`) + tombol `Keluar (Logout)`.
     - Saat **Belum Login**: Tampilkan tombol `Masuk`. Jika pengunjung menekan tombol `Tambah keranjang`, ikon hati `Wishlist (♡)`, `Chat admin`, atau `Ajukan titip jual`, langsung arahkan ke `/auth/login?callbackUrl=...`.

3. **Pengiriman OTP Langsung ke Email & WhatsApp (`src/lib/otp-sender.ts` & `src/lib/whatsapp-gateway.ts`)**:
   - **Email OTP**: Panggil `await supabase.auth.signInWithOtp({ email: target, options: { shouldCreateUser: true } })` agar Supabase langsung mengirim email asli tanpa tergantung `SMTP_PASS`, ditambah pengiriman via `nodemailer` (atau *Ethereal preview link* jika `SMTP_USER` di `.env` kosong).
   - **WhatsApp OTP**: Simpan instance socket `@whiskeysockets/baileys` di `globalThis.__hingoWaGateway` agar tidak ter-reset oleh Turbopack, dukung pengiriman via `FONNTE_TOKEN` (`https://api.fonnte.com/send`), dan tampilkan **Notifikasi Banner OTP Instan (Klik untuk Auto-Fill 6 Digit)** di atas layar `/auth/verify-otp` apabila gateway WA belum di-scan QR-nya atau `FONNTE_TOKEN` di `.env` masih kosong, sehingga verifikasi OTP bisa langsung tuntas 100% tanpa pernah macet!

====================================================================
BAGIAN 2: SEMPURNAKAN TAMPILAN MOBILE (`390px` / `< 768px`) PERSIS DESAIN FIGMA MOBILE
====================================================================

Sesuaikan komponen Layout dan ke-10 halaman berikut pada layar Mobile (`< 768px`) agar 100% identik dengan spesifikasi PDF Figma Mobile:

1. **Mobile Top Header (`src/components/layout/Navbar.tsx` pada `< 768px`)**:
   - Pada layar mobile, bar atas hanya menampilkan:
     - **Kiri**: Logo kotak kuning `[H]` (`#FFC629`) + teks tebal `Hingo`.
     - **Kanan (Halaman Pembeli/Umum)**: Hanya **2 ikon bersih** yaitu ikon **Chat** (`/chat/product`) dan ikon **Keranjang** (`/cart` dengan badge angka). Sembunyikan link teks desktop (`Kategori`, `Promo`, `Titip jual`) di bar atas mobile.
     - **Kanan (Halaman Ruang Penjual `/seller/*`)**: Ikon **Chat** dan ikon **Profil User** (`/account`), diikuti tepat di bawahnya oleh **Sub-Header Ruang Penjual** berlatar krem `#FFFBEB` yang berisi 2 tab horizontal: `Barang titipan saya` (`/seller/consignments`) dan `Ajukan titip jual` (`/seller/consignments/new`).

2. **Mobile Bottom Navigation Bar (`src/components/layout/MobileBottomNav.tsx` pada `< 768px`)**:
   - Sesuai desain `Katalog dan pencarian · Mobile.pdf`, Bottom Bar Mobile **WAJIB terdiri dari tepat 4 menu** (bukan 5):
     1. **`Beranda`** (ikon rumah → `/`)
     2. **`Jelajah`** (ikon kaca pembesar → `/catalog`, warna kuning/amber aktif saat di katalog)
     3. **`Transaksi`** (ikon struk pesanan → `/orders`)
     4. **`Akun`** (ikon profil → `/account` jika sudah login, atau `/auth/login` jika belum login)
   - **Sembunyikan `MobileBottomNav`** pada halaman form/fokus penuh (`Masuk atau daftar`, `Verifikasi nomor HP`, `Detail produk`, `Keranjang`, `Checkout`, `Chat admin produk`, dan `Chat admin dan CS`) agar tidak menutupi tombol aksi bawah atau input pesan chat!

3. **Halaman `Masuk atau daftar` Mobile (`/auth/login`)**:
   - Pada layar `< 768px`, **sembunyikan total kolom kiri desktop** (`hidden lg:flex` untuk panel `"PRELOVED, RELOVED. Gear bagus tak harus baru."` dan foto keyboard).
   - Tampilkan langsung satu kolom bersih: Judul `Masuk atau daftar`, subteks `Mulai dengan nomor HP, email, atau akun Google.`, pill toggle (`Nomor HP` aktif kuning `#FFFBEB` ber-border `#F59E0B` | `Email`), input `Nomor HP` (`+62 812 3456 7890`), tombol kuning lebar penuh `Kirim OTP ke nomor HP`, garis pemisah `atau gunakan email`, input `Alamat email` (`nama@email.com`) + tombol outline lebar penuh `Kirim OTP ke email`, tombol `G Lanjutkan dengan Google`, kartu krem `Baru di Hingo? Tidak perlu daftar terpisah.`, serta footer ringkas `© 2026 Hingo` di kiri dan `Privasi · Bantuan` di kanan.

4. **Halaman `Katalog dan pencarian` Mobile (`/catalog`)**:
   - Pada layar `< 768px`, tampilkan **kotak pencarian di bawah header**: label `Cari barang preloved` dengan input `Peripheral komputer`.
   - Kartu banner krem `#FFFBEB`: `KURASI HINGO / PRELOVED PILIHAN — Upgrade gear, bukan anggaran.` (sembunyikan kartu putih `"Ditangani tim kami"` milik desktop pada layar mobile).
   - Pill kategori membungkus rapi (`flex-wrap`): `Semua gear` (aktif kuning), `Keyboard`, `Mouse`, `Headset`, `Monitor`, `Aksesoris`.
   - Sembunyikan sidebar filter kiri desktop; gantikan dengan bar pill filter & urutkan horizontal: **`Filter · 3`** (pill kuning yang membuka modal/bottom-sheet filter), **`Terbaru ↓`**, **`Lokasi ↓`**, **`Harga ↓`**, diikuti baris chip filter aktif yang bisa dihapus (`Kondisi: Baik+ ×`, `≤ Rp2 juta ×`, `Jakarta Selatan ×`).
   - **Grid Produk 2 Kolom (`grid-cols-2 gap-3`)**: Setiap kartu menampilkan foto persegi, badge hijau `✓ Dicek tim` di kiri atas foto, tombol bulat ikon hati (`♡`) di kanan atas foto, brand huruf kapital kecil, judul barang, kondisi (`Sangat baik · 1 barang`), harga tebal, dan `✓ Hingo · Jakarta Selatan`.

5. **Halaman `Detail produk` Mobile (`/product/[slug]`)**:
   - Urutan vertikal 1 kolom: Breadcrumb `Jelajah / Keyboard / ...` → 1 Foto utama persegi besar + 3 thumbnail foto berjajar di bawahnya + teks `Foto barang titipan · 3 foto · Geser untuk melihat detail` → Pill `Sangat baik` & `Stok 1 barang` → Judul produk, subjudul, harga besar, dan info hemat → Info pengiriman (`Dikirim dari Jakarta Selatan` / `Ke Tebet, Jakarta Selatan Rp18.000`) → Kartu krem `Dicek dan dikirim tim kami` → Kartu **`Dikelola tim Hingo` (`Admin Hingo`)** dengan tombol outline lebar penuh `Chat admin` → Kartu **`Tentang barang ini`** (tabel Kondisi, Pemakaian, Switch, Kelengkapan, dan deskripsi fisik) → **Kartu Aksi Pembelian Mobile**: menampilkan baris `Harga barang` di kiri & nominal `Rp...` tebal di kanan, diikuti 2 tombol berdampingan di bawahnya: tombol outline **`Chat`** (`w-1/3`) dan tombol kuning **`Tambah keranjang`** (`w-2/3`) → Banner krem `Gunakan pembayaran resmi`.

6. **Halaman `Keranjang` (`/cart`) & `Checkout` (`/checkout`) Mobile**:
   - **Keranjang Mobile**: Bar `Pilih semua` + `Hapus` → Kartu barang dengan thumbnail di kiri, judul & harga di kanan, serta baris bawah berisi stepper `[- 1 +]` di kiri dan `Hapus barang` di kanan → Peringatan krem stok 1 barang → Kartu `Dicek dan dikirim tim kami` → Tombol `← Lanjut jelajahi barang` → Kartu `Ringkasan pembayaran` di bagian bawah dengan tombol kuning lebar penuh `Lanjut checkout (1)`.
   - **Checkout Mobile**: Stepper `KERANJANG → CHECKOUT → PEMBAYARAN` → Kartu `Alamat pengiriman` (`Rumah · Utama` + link `Ubah`) → Kartu `Barang pesanan` + input `Catatan untuk tim (opsional)` → Kartu `Pengiriman` (pilihan radio card `JNE REG` vs `J&T Reguler` + checkbox `Perlindungan pengiriman Rp5.000`) → Kartu `Metode pembayaran` (radio card `BCA Virtual Account` vs `QRIS` + box peringatan krem `Bayar hanya melalui Hingo`) → Kartu `Ringkasan pembayaran` dengan tombol kuning lebar penuh `Bayar Rp...` → Kartu `Dicek dan dikirim tim kami` → Kartu `Alur pesanan` (1, 2, 3) + link `Butuh bantuan? Chat CS`.

7. **Halaman `Detail transaksi dan status pesanan` Mobile (`/orders/[id]`)**:
   - Susun 1 kolom vertikal dengan urutan persis sesuai desain mobile:
     1. Header `TRANSAKSI / DETAIL PESANAN` & judul `Barang tiba. Cek dulu, ya.`
     2. Kartu krem `Dana masih ditahan Hingo`
     3. Kartu **`Periksa sebelum konfirmasi`** dengan tombol kuning lebar penuh **`Barang sesuai, konfirmasi terima`** di atas tombol outline lebar penuh **`Ada kendala? Laporkan masalah`**
     4. Kartu **`Perjalanan transaksi`** (timeline vertikal 4 tahap)
     5. Kartu **`Detail barang`** dengan tombol lebar penuh `Chat admin Hingo`
     6. Kartu **`Pengiriman & alamat`** dengan tombol `Lacak pengiriman`
     7. Kartu **`Status pembayaran`** (`Dana terlindungi`)
     8. Kartu **`Ringkasan pembayaran`**
     9. Kartu krem `Barang bermasalah? Kami bantu.` + tombol `Chat CS Hingo` + link `Lihat bukti pembayaran`.

8. **Halaman `Chat admin produk` (`/chat/product`) & `Chat admin dan CS` (`/chat/support`) Mobile**:
   - Pada layar `< 768px`, tampilkan **Full-Screen Single-Pane Chat** (sembunyikan sidebar daftar percakapan kiri dan sidebar kanan milik desktop):
   - **`Chat admin produk` Mobile**:
     - Sub-header: Tombol panah `←` (kembali) + judul `Admin Hingo` (`Tim Hingo · Aktif 5 menit lalu`) + ikon centang hijau + ikon `•••`.
     - Kartu produk ringkas horizontal tepat di bawah header: foto kecil + nama barang + harga & kondisi.
     - Banner krem `Jaga transaksi tetap di Hingo`.
     - Area bubble chat: pesan user di kanan berlatar kuning-krem `#FFFBEB`/`#FEF3C7` lengkap dengan jam & `✓✓`; pesan balasan admin di kiri berlatar abu muda `#F6F6F4`.
     - Baris *quick-reply chips* (`Terima kasih, Kak`, `Boleh foto detailnya?`) di atas input pesan.
     - Bagian bawah: ikon klip lampiran (`📎`) + input bulat `Tulis pesan…` + tombol kuning `Kirim`, serta tepat di paling bawah terdapat tombol outline lebar penuh **`Lihat barang · Rp...`** yang mengarah kembali ke halaman detail produk.
   - **`Chat admin dan CS` Mobile**:
     - Banner header krem `CS Hingo · Resmi` (`Mira · Tim bantuan · Online`) dengan ikon headset.
     - Baris status: `Tiket CS-0842` di kiri dan pill kuning `Percakapan aktif` di kanan.
     - Kartu krem `Pembayaran ditangani Hingo` (info transaksi terkait).
     - Area bubble chat + 2 tombol pill aksi di bawah chat (`Lihat transaksi` outline + `Laporkan masalah` kuning lembut) + teks peringatan keamanan OTP + bar input pesan (`📎` + `Tulis pesan…` + tombol kuning `Kirim`).

9. **Halaman `Barang titipan saya` (`/seller/consignments`) & `Detail barang titipan` (`/seller/consignments/[code]`) Mobile**:
   - **`Barang titipan saya` Mobile**:
     - Sub-navbar penjual (`Barang titipan saya` | `Ajukan titip jual`).
     - Tombol kuning lebar penuh **`+ Ajukan titip jual`** berada tepat di bawah teks sapaan.
     - **4 Kartu KPI disusun menumpuk 1 kolom ke bawah (`grid-cols-1 gap-3` pada mobile, `md:grid-cols-4` pada desktop)**.
     - Kartu krem peringatan barang yang butuh tindakan → Input pencarian → Pill filter status 2 baris → Daftar kartu barang titipan vertikal → diikuti di bagian bawah oleh kartu **`Ringkasan hasil titip jual`**, kartu krem **`Dua pengiriman, beda tujuan`**, kartu **`Admin Hingo siap membantu`** (`Chat admin Hingo`), dan footer ringkas mobile.
   - **`Detail barang titipan` Mobile**:
     - Urutan vertikal 1 kolom: Header status → Kartu krem info inspeksi → Kartu **`4 tahap pengajuan`** → Kartu foto barang & 3 foto dokumentasi inspeksi → Kartu **`Tinjau harga & kondisi`** (usulan harga, biaya, hasil bersih, tombol `Setujui harga & kondisi`, `Minta rincian biaya & hasil bersih`, `Tanya hasil pemeriksaan`) → Kartu **`Hasil pengajuan`** (`Disetujui`, `Ditolak`, `Dibatalkan penjual`) → Kartu **`Laporan inspeksi Hingo`** → Kartu **`Pengiriman pemilik → Hingo`** → Kartu **`Perjalanan titipan`** (9 tahap vertikal) → Kartu **`Rencana pemasaran`** (`Instagram`, `Facebook`, `TikTok`) → Kartu **`Pengiriman Hingo → pembeli`** → Kartu **`Penjualan & pencairan`** → Kartu krem **`Ingin revisi atau tidak lanjut?`** (`Ajukan pembatalan`).
````