# Master Prompt & Perbaikan Total Google Antigravity — Proyek Hingo (Strict Auth, Zero Dummy, Real-Time Cart/Wishlist & Chat dari 0)

Dokumen ini berisi **Prompt Perbaikan Spesifik (Langsung Copy-Paste di Bagian 1)** untuk mengatasi masalah:
1. Aplikasi yang tadinya langsung *auto-login* sebagai user dummy (`Naya`) → diubah menjadi **wajib berstatus Belum Login (Guest)** saat pertama kali dibuka.
2. Data transaksi, barang titipan, keranjang, wishlist, dan chat yang masih berisi *dummy* → **dibersihkan total menjadi 0 (kosong)** untuk setiap akun pengguna.
3. **Wishlist & Keranjang** yang wajib **ter-update secara *real-time* (termasuk angka *badge* di Navbar)** setiap kali diklik.
4. **Chat Admin & CS** yang **mulai benar-benar dari 0 (kosong)**, **responsif di layar Mobile & Desktop**, dan langsung membalas secara kontekstual sesuai produk/pesanan yang ditanyakan.

---

## 1. Prompt Antigravity: "Hapus Semua Auto-Login & Dummy User Data, Aktifkan Real-Time Wishlist/Cart & Chat Mulai dari 0"

Salin seluruh blok prompt di bawah ini dan tempelkan langsung ke **Agent Chat di Google Antigravity IDE**:

```markdown
# TASK: FIX AUTH STATE (NO AUTO-LOGIN), WIPE ALL DUMMY USER DATA (START FROM 0), IMPLEMENT REAL-TIME WISHLIST & CART SYNC, AND MAKE CHAT START FROM 0 & FULLY RESPONSIVE

Saat ini aplikasi masih memiliki beberapa masalah kritis yang harus segera diperbaiki:
1. Aplikasi masih otomatis login (auto-login / fallback ke user dummy "Naya Putri") saat pertama kali dibuka dan masih menampilkan data dummy pada barang titipan, pesanan, keranjang, dan riwayat chat.
2. Wishlist dan Keranjang belum ter-sinkronisasi secara real-time di seluruh halaman dan badge Navbar.
3. Halaman Chat masih menampilkan percakapan dummy bawaan dan belum sepenuhnya responsif saat dimulai dari 0.

Lakukan refactoring menyeluruh dengan aturan ketat berikut:

---

### ATURAN 1: STRICT GUEST MODE SAAT AWAL BUKA APP (JANGAN PERNAH AUTO-LOGIN!)
1. **Hapus Semua Fallback Auto-Login**:
   - Cari di seluruh codebase (termasuk helper `getCurrentUser()`, middleware, context, atau API routes) kode yang melakukan fallback seperti `prisma.user.findFirst()` atau hardcode user `"Naya Putri"` ketika cookie/session kosong. **Hapus total fallback tersebut!**
   - Jika tidak ada cookie session login yang valid (`hingo_session`), `getCurrentUser()` **WAJIB mengembalikan `null`**.
2. **Tampilan Saat Belum Login (`user === null`)**:
   - Di Top Navbar, tampilkan tombol kuning **`Masuk`** (mengarah ke `/auth/login`), bukan nama user.
   - Angka badge **Wishlist** dan **Keranjang** di Navbar disembunyikan (atau `0`).
   - Pengunjung yang belum login (`Guest`) hanya boleh melihat halaman publik: `/` (Home), `/catalog` (Katalog & Pencarian), `/product/[slug]` (Detail Produk), `/promo`, dan `/how-it-works`.
   - Jika pengunjung yang belum login mengklik:
     - Tombol **Wishlist (`♡`)** atau **`Tambah keranjang`**
     - Menu **`Titip jual`**, **`Keranjang`**, **`Chat`**, **`Transaksi`**, atau **`Akun`**
     maka sistem **WAJIB langsung mengarahkan (redirect) ke `/auth/login?callbackUrl=...`**!
3. **Alur Login & Logout Nyata**:
   - User baru benar-benar berstatus login **HANYA setelah** menyelesaikan input Nomor HP / Email di `/auth/login` dan memverifikasi kode OTP di `/auth/verify-otp`.
   - Sediakan tombol **`Keluar (Logout)`** yang jelas di dropdown profil Navbar dan halaman `/account` yang menghapus cookie `hingo_session` di server, mengosongkan state client, dan mengembalikan aplikasi ke mode **Belum Login (`Guest`)**.

---

### ATURAN 2: HAPUS SEMUA DATA DUMMY USER (MULAI DARI 0 DI DATABASE!)
1. **Bersihkan `prisma/seed.ts` dan Database Saat Ini**:
   - Di `prisma/seed.ts`, **HANYA boleh mengisi tabel `Product` (daftar barang katalog toko yang tersedia untuk dibeli)**.
   - **JANGAN** men-seed data dummy ke tabel `Wishlist`, `CartItem`, `Order`, `OrderTimeline`, `ConsignmentItem`, `ConsignmentTimeline`, `ChatThread`, atau `ChatMessage`!
   - Jalankan perintah reset (`npx prisma migrate reset --force` atau hapus semua baris di tabel `CartItem`, `Wishlist`, `Order`, `ConsignmentItem`, `ChatThread`, `ChatMessage`) lalu jalankan ulang seed khusus katalog `Product` saja.
2. **Hapus Semua Array Dummy di Komponen Frontend**:
   - Pastikan di halaman `/seller/consignments` (Barang titipan saya), `/orders` (Transaksi), `/cart` (Keranjang), `/wishlist`, `/chat/product`, dan `/chat/support` **TIDAK ADA SATU PUN array dummy/statis**.
   - Ketika user baru login pertama kali:
     - **Wishlist (`/wishlist`)**: Kosong (`0 barang`), tampilkan *Empty State* rapi dengan tombol `"Jelajahi Katalog"`.
     - **Keranjang (`/cart`)**: Kosong (`0 barang`), tampilkan *Empty State* rapi dengan tombol `"Mulai Belanja"`.
     - **Barang Titipan Saya (`/seller/consignments`)**: Semua KPI bernilai `0` (`Total barang: 0`, `Perlu tindakan: 0`, `Dipasarkan: 0`, `Selesai: 0`), saldo `Rp0`, dan daftar barang kosong sampai user benar-benar mengisi form di `/seller/consignments/new`.
     - **Transaksi (`/orders`)**: Kosong (`0 pesanan`) sampai user benar-benar melakukan checkout dari `/cart`.
     - **Chat (`/chat/product` & `/chat/support`)**: Kosong (`0 percakapan` & `0 pesan`) sampai user memulai chat baru.

---

### ATURAN 3: WISHLIST & KERANJANG REAL-TIME (REAKTIF + PERSISTEN DI DATABASE)
1. **Global Store / Context + Database API Sinkron**:
   - Buat `CartWishlistProvider` (React Context / Zustand / SWR) yang mengambil data awal `wishlistIds` dan `cartItems` milik user yang sedang login dari API database (`/api/wishlist` dan `/api/cart`).
2. **Fungsi Wishlist Real-Time (`POST /api/wishlist/toggle`)**:
   - Di setiap `ProductCard` (pada `/`, `/catalog`, `/promo`, `/wishlist`) dan halaman `/product/[slug]`, tombol ikon hati (`♡`):
     - Mengecek apakah `product.id` ada di `wishlistIds` database user. Jika ya, tampilkan ikon hati terisi penuh (warna merah/kuning aktif).
     - Saat diklik: langsung perbarui UI detik itu juga (*optimistic update*), jalankan `POST /api/wishlist/toggle` untuk menambah/menghapus baris di tabel `Wishlist` database, langsung perbarui angka badge **Wishlist** di Top Navbar, dan perbarui daftar di halaman `/wishlist` tanpa perlu refresh manual!
3. **Fungsi Keranjang Real-Time (`POST /api/cart`, `PATCH /api/cart`, `DELETE /api/cart`)**:
   - Saat user mengklik **`"Tambah keranjang"`** di halaman `/product/[slug]` atau kartu produk:
     - Simpan/update baris di tabel `CartItem` database (`userId`, `productId`, `quantity: 1`).
     - Langsung perbarui angka badge **Keranjang** di Top Navbar secara real-time dan tampilkan notifikasi toast `"Berhasil ditambahkan ke keranjang"`.
     - Jika produk sudah ada di keranjang (karena stok barang preloved = 1), tampilkan status `"Sudah di keranjang — Lihat Keranjang"`.
   - Di halaman `/cart`:
     - Centang pilih barang, hapus barang (`Hapus`), atau hapus semua yang dipilih langsung memutasi tabel `CartItem` di database, langsung menghitung ulang **Ringkasan Pembayaran** (`Harga barang`, `Ongkir`, `Perlindungan pengiriman Rp5.000`, `Biaya layanan Rp2.500`, `Total pembayaran`), dan langsung mengurangi angka badge di Navbar.
   - Saat user menyelesaikan **`Checkout` (`/checkout`)**:
     - Barang yang di-checkout otomatis dihapus dari `CartItem` database, angka badge Keranjang di Navbar langsung kembali ke `0`, stok produk di tabel `Product` berubah menjadi `0` (`SOLD`), dan pesanan baru langsung tercatat di tabel `Order`.

---

### ATURAN 4: CHAT MULAI DARI 0, RESPONSIF DI MOBILE/DESKTOP, DAN INTERAKTIF REAL-TIME
1. **Mulai Benar-Benar dari 0 (Tanpa Chat Bawaan)**:
   - Saat user membuka `/chat/product` atau `/chat/support` pertama kali dan belum pernah mengirim pesan, tabel `ChatThread` dan `ChatMessage` untuk user tersebut masih kosong (`0 pesan`).
   - Jika user masuk lewat tombol **`"Chat admin"`** dari halaman detail produk (misal `/product/keychron-k2-v2` → mengarah ke `/chat/product?productId=...`):
     - Tampilkan header ruang chat `Admin Hingo` beserta kartu konteks produk yang sedang ditanyakan (`Keychron K2 V2 · Rp850.000`), namun area riwayat pesan **dimulai dari 0 (kosong)** dengan chip pertanyaan cepat (*quick-reply chips*):
       - `"Halo Kak, apakah barang ini masih tersedia?"`
       - `"Apakah semua tombol dan fungsinya normal?"`
       - `"Kelengkapan box dan kabelnya masih lengkap?"`
       - `"Bisa dikirim hari ini kalau saya checkout sekarang?"`
2. **Balasan Otomatis Kontekstual & Real-Time dari Database**:
   - Begitu user mengetik pesan sendiri atau mengklik salah satu *quick-reply chip* lalu menekan **`Kirim`**:
     - Simpan pesan user ke tabel `ChatMessage` di database (`senderRole: "USER"`) dan langsung tampilkan gelembung pesan user di layar beserta jam kirim & tanda centang (`✓✓`).
     - Tampilkan indikator animasi **`"Admin Hingo sedang mengetik..."`** (atau `"CS Mira sedang mengetik..."` di `/chat/support`) selama 1,5 detik.
     - Jalankan logika **Smart Auto-Reply Server** yang membaca detail produk asli (`product.name`, `product.condition`, `product.defectNotes`, `product.completeness`, `product.price`, `product.location`) atau detail pesanan (`order.orderCode`, `order.orderStatus`, `order.trackingNumber`) dari database, lalu simpan balasan relevan dari `Admin Hingo` / `CS Mira` ke tabel `ChatMessage` di database dan tampilkan langsung di layar!
     - Semua percakapan yang sudah dimulai otomatis tersimpan di tabel `ChatThread` & `ChatMessage` sehingga tetap ada saat halaman di-refresh, dan bisa juga dibalas manual lewat `/admin`.
3. **Layout Chat 100% Responsif (Desktop 1440px & Mobile 390px)**:
   - **Desktop (`>= 1024px`)**: Layout 3 kolom proporsional (Kolom Kiri: Daftar Thread & Pencarian Percakapan; Kolom Tengah: Area Pesan *scrollable* dengan *sticky header* & *sticky input bar* di bawah; Kolom Kanan: Kartu Konteks Produk/Transaksi terkait dengan tombol `"Lihat barang"` & `"Tambah keranjang"`).
   - **Mobile (`< 768px`)**:
     - Gunakan sistem *Single-Pane Switchable View*: saat di daftar percakapan tampilkan list thread; saat thread dipilih (atau masuk dengan `?productId=...`), tampilkan ruang chat *full-screen* dengan tombol panah **`← Kembali`** di kiri atas header, kartu ringkas produk yang menempel di bawah header, area bubble chat yang nyaman di-*scroll*, serta *input bar* pesan yang *sticky* tepat di atas/menggantikan *bottom navigation bar* agar tidak pernah terpotong layar HP.

---

### LANGKAH VERIFIKASI WAJIB SEBELUM SELESAI:
1. Reset database dan jalankan ulang seed yang **hanya** mengisi katalog `Product`.
2. Buka aplikasi di browser baru (tanpa cookie): pastikan di pojok kanan atas tampil tombol **`Masuk`** (bukan nama `"Naya"`), serta halaman `/cart`, `/wishlist`, `/orders`, `/seller/consignments`, dan `/chat/product` meminta login terlebih dahulu.
3. Login dengan akun baru melalui `/auth/login` → `/auth/verify-otp`:
   - Pastikan **Wishlist = 0**, **Keranjang = 0**, **Barang Titipan = 0**, **Transaksi = 0**, dan **Chat = 0**.
   - Klik ikon hati (`♡`) dan `"Tambah keranjang"` pada produk katalog: pastikan badge Navbar dan halaman `/wishlist` serta `/cart` langsung ter-update seketika.
   - Klik `"Chat admin"` dari halaman produk: pastikan chat mulai dari 0, responsif saat diketik, dan membalas otomatis sesuai data produk di database.
```

---

## 2. Ringkasan Perubahan Perilaku Aplikasi (Sebelum vs Sesudah Prompt Ini)

| Fitur / Alur | Kondisi Sebelumnya (Masih Campur Dummy) | Kondisi Sesudah Prompt Ini Dijalankan |
| :--- | :--- | :--- |
| **Saat Awal Buka Aplikasi** | Langsung *auto-login* sebagai `Naya Putri` | Benar-benar **Belum Login (`Guest`)**; tombol kuning `Masuk` tampil di Navbar, dan semua fitur transaksi terkunci sampai user login. |
| **Isi Data Akun Saat Baru Login** | Sudah terisi 9 barang titipan, pesanan, dan chat dummy | **Mulai murni dari 0 (Kosong)**; hanya katalog produk toko yang tampil untuk dibeli. |
| **Wishlist (`♡`) & Keranjang** | Statis / badge tidak sinkron saat diklik | **Ter-update *real-time* di database & Navbar** setiap kali user klik hati (`♡`), tambah keranjang, hapus item, atau selesai checkout. |
| **Chat Admin Produk & CS** | Sudah berisi teks percakapan dummy dari awal | **Mulai dari 0 (ruang chat bersih)** saat pertama dibuka, layout **responsif di HP & Desktop**, dan otomatis membalas secara kontekstual sesuai data produk/pesanan di database. |