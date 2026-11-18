# Recap Pengerjaan PRD Hinggo (feat/prd-mvp)

Dokumen ini mencatat kronologi, audit, perubahan, dan verifikasi implementasi PRD Hingo sesuai panduan `hinggo-prd-prompts.md`.

---

## Ringkasan Proyek & Branch
- **Branch Kerja:** `feat/prd-mvp` (bercabang dari `master` pada commit `950e5a7`)
- **Sumber Kebenaran:**
  - Perilaku dan aturan bisnis: `docs/PRD.md`
  - Tampilan: Figma File Key `xKNQ51VDVCSdk8qF8bUelM`
- **Database:** Supabase PostgreSQL (`obdczozspvkdebhtyhoh.supabase.co`)

---

## Step P0: Persiapan dan Audit Selisih

### 1. Ringkasan Pemahaman PRD
- **20 Status Barang:**
  1. Diajukan
  2. Ditolak saat screening (Akhir)
  3. Disetujui, menunggu kiriman
  4. Dalam perjalanan ke Hingo
  5. Diterima, sedang diuji
  6. Ditolak setelah pengecekan
  7. Menunggu ongkir kembali
  8. Dikembalikan ke consignor (Akhir)
  9. Tayang
  10. Ditahan menunggu pembayaran
  11. Dibayar, dikemas
  12. Dikirim ke pembeli
  13. Diterima pembeli
  14. Klaim diproses
  15. Klaim: cacat tersembunyi (Akhir transaksi)
  16. Klaim: kesalahan Hingo (Akhir transaksi)
  17. Siap dibayar ke consignor
  18. Consignor sudah dibayar (Akhir)
  19. Masa penitipan habis
  20. Klaim: kesalahan pengiriman (Akhir transaksi)

- **4 Peran:**
  - Consignor (pemilik barang titipan)
  - Pembeli (pembeli barang di website)
  - Admin (tim internal Hingo)
  - Sistem otomatis (penjadwal & modul notifikasi)

- **Aturan Berbasis Waktu (Tabel 4.3 PRD):**
  - Penahanan pesanan: 24 jam sejak checkout (kembali Tayang bila belum dibayar).
  - Usulan penurunan harga (>= Rp200.000): Hari ke-21, 36, 50 (turun 5% dari harga awal per tahap; tidak di bawah harga minimum).
  - Usulan penurunan harga (< Rp200.000): Hari ke-30 (turun 10% dari harga awal; tidak di bawah harga minimum).
  - Batas respons usulan: 3 hari sejak usulan dibuat (tanpa respon = ditolak, harga tetap).
  - Masa penitipan: 60 hari sejak pertama tayang -> status Masa penitipan habis.
  - Perpanjangan: Maksimal 1x selama 30 hari dengan harga baru yang disepakati admin.
  - Batas keputusan akhir masa: 3x24 jam setelah status Masa penitipan habis (tanpa respon = dianggap ambil kembali, masuk Menunggu ongkir kembali).
  - Batas isi resi: 2x24 jam setelah pengajuan disetujui (tanpa respon = Ditolak saat screening).
  - Batas bayar ongkir kembali: 1x24 jam setelah Menunggu ongkir kembali (tanpa pembayaran = barang disimpan, label Tidak tersedia).
  - Garansi: 7 hari sejak barang diterima pembeli.

- **28 Fitur dalam 8 Baris:**
  1. Consignor: (1) Akun profil & rekening, (2) Formulir pengajuan RAM/SSD/GPU, (3) Unggah privat KTP & bukti milik, (4) Persetujuan syarat sebelum kirim.
  2. Consignor: (5) Dasbor barang, riwayat harga, usulan & pembayaran, (6) Input resi batas 2x24 jam, (7) Respon usulan, perpanjang/ambil kembali, tarik Rp25k.
  3. Pembeli: (8) Akun email+password, (9) Katalog barang Tayang (filter RAM/SSD/GPU, cari, urut), (10) Halaman produk, laporan uji, YouTube embed, label stok.
  4. Pembeli: (11) Keranjang & checkout atomik hold 24 jam + auto-asuransi >500k, (12) Bayar transfer manual, unggah bukti & riwayat, (13) Klaim garansi 7 hari.
  5. Kebijakan & Admin: (14) Halaman garansi & retur, (15) Dasbor metrik barang/fee/tugas, (16) Screening lolos/tolak alasan baku, (17) Terima & checklist uji lolos/gagal.
  6. Admin: (18) Tetapkan harga tayang & price_history, (19) Transisi status via RPC tabel 4.2, (20) Verifikasi bayar, resi, tanggal terima (mulai garansi 7 hari).
  7. Admin & Sistem: (21) Putusan klaim 4 hasil, (22) Antrean bayar consignor (Siap dibayar -> dibayar), (23) Pengaturan tabel settings, (24) Manajemen pengguna & nonaktifkan paksa.
  8. Sistem: (25) Penjadwal cron berkala (hold, usulan, masa 60d, resi, garansi), (26) Perhitungan fee (10k / 5%), (27) Append-only history & view_count, (28) Email notifikasi SMTP.

---

### 2. Audit Kode Saat Ini terhadap 28 Fitur PRD

| No | Fitur PRD | Status Saat Ini | File Terkait | Catatan Audit |
|---|---|---|---|---|
| 1 | Akun consignor | Sebagian | `src/app/auth/login/page.tsx`, `src/app/api/user/bank-accounts/route.ts` | Masih login OTP/WA; perlu diganti email + password hash; rekening bank sudah ada tapi belum diikat ke profil terpadu PRD |
| 2 | Formulir pengajuan | Sebagian | `src/app/seller/consignments/new/page.tsx`, `src/app/api/consignments/route.ts` | Form lama kategori periferal; perlu diubah ke RAM, SSD, GPU dengan field spek khusus dan harga minimum |
| 3 | Unggah KTP & bukti kepemilikan | Sebagian | `src/app/auth/verify-identity/page.tsx`, `src/app/api/auth/kyc/route.ts` | KYC lama di tingkat user dengan selfie; PRD mewajibkan KTP + bukti kepemilikan (nota/dus/SN) terikat per barang dan privat |
| 4 | Persetujuan syarat penitipan | Belum | `src/app/seller/consignments/[code]/page.tsx` | Belum ada tabel `terms_acceptances`, belum ada pencatatan persetujuan resmi bertanggal sebelum isi resi |
| 5 | Dasbor consignor | Sebagian | `src/app/seller/consignments/page.tsx` | Menggunakan status alur lama; belum menampilkan usulan penurunan harga, rincian fee PRD, dan status PRD |
| 6 | Isi resi pengiriman | Sebagian | `src/app/seller/consignments/[code]/ship/page.tsx` | Sudah ada input resi, belum ada validasi batas 2x24 jam dan syarat terms acceptance |
| 7 | Keputusan consignor | Belum | Belum ada | Belum ada alur persetujuan penurunan harga, opsi perpanjang/ambil kembali, dan penarikan Rp25.000 |
| 8 | Akun pembeli | Sebagian | `src/app/auth/login/page.tsx` | Masih login OTP; harus email + kata sandi (argon2/bcrypt) |
| 9 | Katalog produk | Sebagian | `src/app/catalog/page.tsx`, `src/app/api/products/route.ts` | Kategori periferal lama; filter status masih `AVAILABLE`; perlu ganti ke RAM/SSD/GPU dan status `Tayang` |
| 10 | Halaman produk | Sebagian | `src/app/product/[slug]/page.tsx` | Belum ada checklist hasil uji, YouTube embed, label "Tidak tersedia" untuk status non-Tayang, dan view_count |
| 11 | Keranjang & checkout | Sebagian | `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/app/api/checkout/route.ts` | Masih ada biaya layanan pembeli Rp2.500 (dilarang PRD); belum atomik hold 24 jam; belum auto-asuransi >500k |
| 12 | Pembayaran & riwayat pesanan | Sebagian | `src/app/orders/page.tsx`, `src/app/checkout/payment/[orderId]/page.tsx` | Menggunakan simulasi VA/QRIS otomatis; harus upload bukti transfer manual dan verifikasi admin |
| 13 | Klaim garansi | Sebagian | `src/app/orders/[id]/dispute/page.tsx` | Disebut "dispute"; belum mengadopsi 4 jenis hasil klaim PRD dan batas 7 hari sejak tanggal terima |
| 14 | Halaman kebijakan | Sebagian | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | Masih mengacu pada aturan escrow 48 jam lama; harus diselaraskan dengan Garansi & Retur PRD 6.3 |
| 15 | Dasbor admin | Sebagian | `src/app/admin/page.tsx` | Metrik lama; belum mengelompokkan 20 status PRD, fee tertunda vs realisasi, dan antrean tugas |
| 16 | Antrean screening | Sebagian | `src/app/admin/page.tsx` | Approve/reject sederhana; belum ada pilihan alasan penolakan baku dari settings dan referensi harga pasar |
| 17 | Penerimaan & laporan uji | Belum | `src/app/admin/page.tsx` | Belum ada form checklist uji RAM/SSD/GPU, upload foto uji, embed YouTube, validasi lolos/gagal |
| 18 | Penetapan harga | Belum | Belum ada | Admin belum bisa memasukkan harga tayang final dengan pencatatan append-only `price_history` |
| 19 | Ubah status barang | Belum | Update langsung di API | Belum ada fungsi RPC `transition_item_status` berbasis tabel `status_transitions` |
| 20 | Pencatatan penjualan & kirim | Sebagian | `src/app/admin/page.tsx` | Verifikasi transfer manual belum ada; input resi ada; input tanggal terima (mulai garansi 7 hari) belum ada |
| 21 | Proses klaim | Sebagian | `src/app/admin/page.tsx` | Belum ada penentuan hasil: cacat tersembunyi, kesalahan Hingo, kesalahan pengiriman, atau tidak valid |
| 22 | Antrean bayar consignor | Sebagian | `src/app/seller/payouts/page.tsx` | Belum terhubung ke status `Siap dibayar ke consignor` dan pencatatan bukti transfer payout |
| 23 | Pengaturan | Belum | Angka hardcoded | Belum ada tabel `settings` (fee 10k/5%, ambang 200k, ongkir dummy, penahanan 24h, percepatan demo, dll.) |
| 24 | Manajemen pengguna | Belum | Belum ada | Belum ada daftar pengguna, toggle aktif/nonaktif, proteksi barang/pesanan aktif, dan nonaktifkan paksa |
| 25 | Penjadwal otomatis | Belum | Belum ada | Belum ada cron endpoint `POST /api/cron/tick` dan integrasi pg_cron Supabase |
| 26 | Perhitungan fee | Belum | Rumus lama di kode | Formula lama (8% + 19.000); wajib diganti ke formula 6.1 (<= 200k = 10k, > 200k = 5%) |
| 27 | Riwayat status & harga | Belum | Timeline biasa | Belum ada trigger database append-only penolak UPDATE/DELETE untuk status_history & price_history |
| 28 | Notifikasi email SMTP | Belum | Belum ada | Belum ada integrasi Nodemailer SMTP untuk 17+ peristiwa notifikasi dan `notification_log` |

---

### 3. Daftar Kode yang Harus Dibuang
1. **Sistem OTP & Verifikasi HP:**
   - `src/lib/otp.ts`
   - `src/lib/otp-sender.ts`
   - `src/app/api/auth/send-otp/route.ts`
   - `src/app/api/auth/verify-otp/route.ts`
   - `src/app/auth/verify-otp/page.tsx`
   - `src/app/auth/verify-identity/page.tsx`
2. **Mode Demo:**
   - Variabel `DEMO_MODE`, `NEXT_PUBLIC_DEMO_MODE`, `DEMO_OTP_CODE`
3. **Gateway WhatsApp Baileys:**
   - `src/lib/whatsapp-gateway.ts`
   - `src/app/api/whatsapp/qr/route.ts`
   - Dependencies: `@whiskeysockets/baileys`, `qrcode`, `pino`
4. **Chat Dalam Aplikasi (In-App Chat):**
   - `src/app/api/chat/route.ts`
   - `src/app/chat/product/page.tsx`
   - `src/app/chat/support/page.tsx`
5. **Simulasi Pembayaran QRIS / VA:**
   - `src/app/checkout/payment/[orderId]/page.tsx` (diganti alur transfer bank manual & upload bukti)
6. **Konsep Escrow Lama & Biaya Layanan Pembeli:**
   - Stepper escrow 48 jam di orders
   - Biaya layanan pembeli Rp2.500 di cart/checkout
7. **Prisma & SQLite dev.db:**
   - `prisma/schema.prisma`
   - `prisma/seed.ts`
   - `prisma/dev.db`
   - `src/lib/prisma.ts`
   - Dependencies: `@prisma/client`, `prisma`

---

### 4. Audit Tabel Supabase & Model Prisma Saat Ini

#### Tabel Supabase Publik (12 Tabel):
| Nama Tabel | Jumlah Baris Saat Ini | Status Rencana Penggantian |
|---|---|---|
| `users` | 10 baris | Diganti skema baru (tambah `password_hash`, `whatsapp`, rekening, alamat, `is_active`) |
| `otp_verifications` | 0 baris | Dihapus (diganti login email & kata sandi) |
| `kyc_documents` | 0 baris | Diganti `identity_documents` (KTP & bukti kepemilikan terikat per barang) |
| `addresses` | 0 baris | Diintegrasikan ke pengguna / pesanan |
| `bank_accounts` | 0 baris | Diintegrasikan ke pengguna (rekening consignor) |
| `products` | 13 baris | Diganti tabel `items` (RAM, SSD, GPU, 20 status, price_history, first_listed_at, dll.) |
| `wishlists` | 1 baris | Dihapus (di luar lingkup MVP PRD) |
| `cart_items` | 6 baris | Diganti tabel `carts` & `cart_items` baru |
| `consignments` | 4 baris | Dilebur ke tabel `items` tunggal |
| `orders` | 2 baris | Diganti tabel `orders` baru (penahanan 24 jam, bukti transfer manual, ongkir dummy) |
| `chat_threads` | 0 baris | Dihapus |
| `chat_messages` | 0 baris | Dihapus |

#### Model Prisma (`prisma/schema.prisma`):
- `User`, `Session`, `OtpVerification`, `KycDocument`, `Address`, `BankAccount`, `Product`, `Wishlist`, `CartItem`, `Order`, `OrderTimeline`, `DisputeReport`, `ConsignmentItem`, `ConsignmentTimeline`, `Payout`, `ChatThread`, `ChatMessage`.
- **Rencana:** Dihapus total setelah Step P1, koneksi langsung menggunakan client Supabase service role.

---

### 5. Hal Ambigu di PRD & Asumsi yang Ditetapkan
1. **Ongkir Retur Klaim Garansi:**
   - *Asumsi:* Untuk klaim "kesalahan Hingo", pembeli direfund dan ongkir kembali ditanggung Hingo. Untuk "cacat tersembunyi", ongkir kembali dari pembeli ditanggung consignor. Dicatat sebagai catatan admin tanpa menambah enum status baru.
2. **Hitungan 60 Hari Pasca Uji Ulang (Kesalahan Hingo):**
   - *Asumsi:* Masa penitipan 60 hari melanjutkan sisa waktu sebelumnya (tidak di-reset ke 60 hari penuh).
3. **Ambang Penurunan Harga Rp200.000:**
   - *Asumsi:* Barang tepat Rp200.000 masuk skema penurunan 3 tahap (hari 21, 36, 50 sebesar 5%).
4. **Penjepitan Harga Usulan ke Harga Minimum:**
   - *Asumsi:* Bila diskon 5% atau 10% menghasilkan angka lebih rendah dari harga minimum yang ditentukan consignor, harga usulan dijepit (*clamped*) tepat di harga minimum. Jika harga saat ini sudah mencapai harga minimum, usulan tidak dibuat.
5. **Total Fee di Dasbor Admin:**
   - *Asumsi:* Total fee yang terealisasi dihitung dari barang yang telah melewati masa garansi 7 hari tanpa klaim (`Siap dibayar ke consignor` dan `Consignor sudah dibayar`). Dasbor juga menampilkan kolom terpisah "fee tertunda" untuk pesanan yang masih dalam masa garansi 7 hari.
6. **Pembulatan Nilai Fee 5%:**
   - *Asumsi:* Fee 5% dibulatkan ke bilangan bulat rupiah terdekat (`ROUND`).
7. **Penyimpanan Nomor WhatsApp:**
   - *Asumsi:* Nomor WhatsApp wajib diisi saat pendaftaran untuk kontak darurat manual oleh admin (via link wa.me), tetapi tidak melalui proses verifikasi gateway otomatis di MVP.
8. **Penyatuan Entitas Barang (`items`):**
   - *Asumsi:* Di PRD tidak ada pemisahan antara "consignment submission" dan "product catalog". Semua tahap dari pengajuan, screening, uji, tayang, hingga payout menggunakan satu tabel `items` dengan 20 status atomik.


---

## Step P1: Skema Database [PERSETUJUAN]

### Rencana Migration SQL Lengkap
- File rencana migrasi telah disusun di [`supabase/migrations/20261118_prd_schema.sql`](file:///c:/Users/helmi/OneDrive/Dokumen/Hinggo/supabase/migrations/20261118_prd_schema.sql) mencakup 16 kelompok data PRD 8.1.
- **Tabel Pengaturan (`settings`):** Berisi 21 nilai awal bisnis (fee 10k/5%, ambang 200k, ongkir dummy 18k, asuransi 500k, penarikan 25k, hold 24h, jadwal usulan, masa 60d, perpanjang 30d, batas resi 2x24h, batas bayar ongkir kembali 1x24h, garansi 7d, demo speed factor = 1, nomor WA admin, alamat gudang, dan alasan penolakan baku).
- **Tabel Transisi Status (`status_transitions`):** 30 baris relasi atomik persis dari Tabel 4.2 PRD dengan 4 peran (`CONSIGNOR`, `BUYER`, `ADMIN`, `SYSTEM`).
- **Tabel Inti:**
  1. `users` (tambah password_hash, whatsapp wajib, rekening consignor, alamat pembeli, is_active)
  2. `items` (RAM, SSD, GPU, 20 status atomik, first_listed_at, listing_ends_at, extension_used, view_count, dll.)
  3. `identity_documents` (KTP & bukti milik terikat per barang, bucket kyc-documents privat)
  4. `test_reports` (checklist per kategori, foto uji, YouTube video, hasil PASSED/FAILED)
  5. `terms_acceptances` (persetujuan 5 klausul syarat penitipan sebelum kirim resi)
  6. `carts` & `cart_items` (keranjang belanja)
  7. `orders` (hold_expires_at, alamat pengiriman, bukti transfer manual)
  8. `order_items` (harga jual, fee kalkulasi, jumlah diterima consignor, warranty_ends_at)
  9. `claims` (alasan, foto bukti, link video, 4 hasil putusan)
  10. `consignor_payouts` (pencatatan transfer dana & bukti transfer payout)
  11. `item_returns` (alasan pengembalian, ongkir kembali, biaya tarik 25k, resi balik)
  12. `price_proposals` (jadwal tahap 21/30/36/50, batas 3 hari, status respon)
  13. `status_history` & `price_history` (audit log dijaga trigger append-only)
  14. `notification_log` (log pengiriman email SMTP)
- **Fungsi RPC Database Atomik:**
  - `transition_item_status(item_id, to_status, actor_id, actor_role, note)`: Mengunci baris item (`FOR UPDATE`), menolak perubahan status akhir, memvalidasi pasangan transisi & peran di `status_transitions`, memvalidasi laporan lolos uji sebelum `Tayang`, mencatat ke `status_history`.
  - `checkout_hold_items(...)`: Mengunci item (`FOR UPDATE`), memvalidasi seluruh item berstatus `Tayang` (batal atomik jika salah satu tidak tersedia), membuat order 24 jam, mentransisikan status ke `Ditahan menunggu pembayaran`, dan menghitung fee PRD 6.1.
- **Keamanan RLS & Storage:**
  - RLS aktif pada seluruh tabel dengan default DENY untuk publik anon/authenticated (akses backend lewat service role).
  - Satu-satunya pembacaan publik: `items` hanya untuk baris berstatus `Tayang`.
  - Bucket Storage: `kyc-documents`, `payment-proofs`, `claim-proofs` privat; `item-photos` publik.
- **Rencana Pembersihan Tabel Lama:**
  - Tabel lama yang akan di-drop bertahap: `chat_messages`, `chat_threads`, `wishlists`, `otp_verifications`, `kyc_documents`, `bank_accounts`, `addresses`, `consignments`, `products`, `orders`, `cart_items`.
  - Penghapusan Prisma & SQLite setelah migrasi Supabase selesai dan diverifikasi.


### Hasil Eksekusi & Uji Verifikasi Nyata Database (Step P1)
- **Status Migrasi:** Sukses diterapkan ke Supabase PostgreSQL (`obdczozspvkdebhtyhoh.supabase.co`).
- **Verifikasi Tabel:** Seluruh 18 tabel PRD terverifikasi ada dan aktif:
  - `settings`: 21 baris terisi (fee, ambang batas, ongkir dummy, dll.)
  - `status_transitions`: 29 baris aturan transisi PRD 4.2
  - `users`: 11 pengguna (kolom password_hash, whatsapp, rekening, alamat aktif)
  - `items`: 0 baris
  - `identity_documents`: 0 baris
  - `terms_acceptances`: 0 baris
  - `test_reports`: 0 baris
  - `carts` & `cart_items`: 0 baris
  - `orders` & `order_items`: 0 baris
  - `claims`: 0 baris
  - `consignor_payouts`: 0 baris
  - `item_returns`: 0 baris
  - `price_proposals`: 0 baris
  - `status_history` & `price_history`: 0 baris
  - `notification_log`: 0 baris
- **Uji Trigger Append-Only:**
  - Baris riwayat status berhasil dibuat.
  - Upaya UPDATE pada `status_history` **DITOLAK** oleh database trigger:
    `Operasi UPDATE tidak diizinkan pada tabel ini: audit log bersifat append-only.`
- **Uji RPC `transition_item_status`:**
  - Uji transisi loncat tidak sah (`Diajukan` -> `Tayang`) oleh ADMIN: **DITOLAK** (`Transisi tidak valid: tidak ada aturan perpindahan dari "Diajukan" ke "Tayang" oleh peran "ADMIN".`).
  - Uji peran salah (CONSIGNOR menyetujui screening): **DITOLAK** (`Transisi tidak valid: tidak ada aturan perpindahan dari "Diajukan" ke "Disetujui, menunggu kiriman" oleh peran "CONSIGNOR".`).
  - Uji transisi sah (ADMIN memindahkan `Diajukan` -> `Disetujui, menunggu kiriman`): **BERHASIL** mencatat status baru dan `history_id`.
- **Build Status:** `npm run build` lulus 100% (43 rute terkompilasi tanpa error).
