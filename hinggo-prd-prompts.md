# Hinggo - Panduan Prompt Antigravity (mengikuti PRD)

Dokumen ini menggantikan arah pengerjaan di `hinggo-antigravity-prompts.md` untuk fitur-fitur bisnis. Panduan lama tetap berguna untuk aturan keamanan dan tampilan.

**Sumber kebenaran:**
- **Perilaku dan aturan bisnis:** `docs/PRD.md` (salinan teks dari PRD tim).
- **Tampilan:** Figma `xKNQ51VDVCSdk8qF8bUelM`. Kalau PRD dan Figma bertentangan, PRD menang, dan layar Figma disesuaikan.

## Persiapan (kamu kerjakan sendiri, sebelum Step P0)

1. Buat folder `docs` di proyek, lalu salin file `PRD_Hingo.md` ke `docs/PRD.md`.
2. Pastikan Figma MCP masih tersambung di Antigravity.
3. Siapkan nilai untuk environment variable baru (jangan ditempel ke chat; isi di `.env.local` dan di Vercel):
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (hanya dipakai skrip seed admin; jangan simpan di Vercel kalau tidak perlu)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (untuk Gmail: aktifkan verifikasi 2 langkah, lalu buat App Password)
   - `CRON_SECRET` (string acak panjang untuk melindungi endpoint penjadwal)
4. Variabel lama yang akan dihapus setelah Step P4: `DEMO_MODE`, `NEXT_PUBLIC_DEMO_MODE`, `DEMO_OTP_CODE`.

## Cara pakai

1. Tempel **ATURAN PROYEK** sekali di awal.
2. Kerjakan step **berurutan**. Jangan loncat. Tiap step bergantung pada step sebelumnya.
3. Step yang bertanda **[PERSETUJUAN]** menulis rencana (SQL/perubahan data) dulu dan berhenti. Baca rencananya sebelum menyetujui.
4. Jangan lanjut sebelum bagian **Selesai kalau** terpenuhi.

## Urutan dan target "hari ini"

Semua 28 fitur dalam satu hari itu sangat padat. Urutan di bawah disusun supaya **setiap fase menghasilkan sesuatu yang bisa dijalankan**:

| Fase | Step | Hasil | Fitur PRD |
|---|---|---|---|
| **1 - Jalur lancar** | P0-P13 | Skenario uji 1 (consignor sampai dibayar) berjalan | 1-6, 8-12, 15-20, 22, 23 (inti), 26, 27 (riwayat) |
| **2 - Aturan waktu dan klaim** | P14-P17 | Skenario 2-6 dan 8 | 5, 7, 13, 21, 25 |
| **3 - Penyempurnaan** | P18-P23 | Email, manajemen pengguna, kebijakan, uji akhir | 14, 23 (UI), 24, 27 (tampilan), 28 |

Kalau waktu habis, berhenti di akhir fase mana pun. Fase 1 saja sudah membuktikan alur MVP.

---

## ATURAN PROYEK (tempel sekali di awal)

```
Kamu bekerja di proyek "Hinggo": website consignment komponen komputer bekas (kategori MVP: RAM, SSD, GPU).
Stack: Next.js App Router, TypeScript, Supabase (Postgres + Storage), Vercel. Bahasa antarmuka: Indonesia.

SUMBER KEBENARAN
- Perilaku dan aturan bisnis: baca docs/PRD.md. Rujuk bagian dan nomor fitur PRD di setiap pekerjaan.
  Jangan menafsirkan sendiri. Kalau PRD ambigu atau bertentangan, berhenti dan tanyakan.
- Tampilan: Figma lewat Figma MCP (fileKey xKNQ51VDVCSdk8qF8bUelM) dengan node ID yang disebut di
  step. Kalau PRD bertentangan dengan Figma, ikuti PRD dan sesuaikan tampilan.
- Komponen yang dibuang karena tidak ada di PRD: OTP, mode demo, gateway WhatsApp, chat dalam aplikasi,
  "escrow", pembayaran QRIS/VA simulasi, verifikasi nomor HP, "biaya layanan" untuk pembeli.

ATURAN TEKNIS
1. Semua akses data sensitif lewat SERVER (route handler/server action) dengan client Supabase
   service role. Browser tidak boleh membaca tabel privat. RLS aktif di semua tabel dengan akses anon
   ditolak (kecuali pembacaan katalog barang berstatus Tayang bila memang dipakai).
2. Perpindahan status barang HANYA lewat SATU fungsi atomik di database (RPC), yang membaca tabel
   `status_transitions` (data dari tabel 4.2 PRD), memeriksa peran pelaku, lalu mencatat riwayat.
   Tidak ada UPDATE status langsung di tempat lain.
3. Riwayat status dan riwayat harga APPEND-ONLY: dijaga trigger database yang menolak UPDATE dan DELETE.
4. Semua angka bisnis (fee, ambang, ongkir dummy, batas asuransi, biaya penarikan, batas waktu,
   jadwal usulan, alasan penolakan, percepatan demo) berasal dari tabel `settings`, bukan kode.
5. Uang disimpan sebagai bilangan bulat rupiah. Waktu disimpan UTC dan ditampilkan WIB.
6. Operasi yang harus atomik (checkout/penahanan, transisi status) memakai fungsi SQL (RPC), bukan
   beberapa query terpisah. Dua pembeli yang checkout barang sama: hanya satu yang berhasil.
7. Upload file: validasi tipe (jpg/png/webp, dan pdf untuk dokumen), ukuran maksimal 5 MB, nama file
   diacak. Bucket: `kyc-documents` (privat), `payment-proofs` (privat), `claim-proofs` (privat),
   `item-photos` (publik, untuk foto barang dan foto uji). File privat diakses lewat signed URL
   berumur pendek setelah server memeriksa hak akses.
8. Sesi: pertahankan cookie sesi bertanda tangan HMAC yang sudah ada (HttpOnly, Secure, SameSite=Lax).
   Setiap route memeriksa sesi dan kepemilikan data di server. Akun nonaktif tidak bisa masuk.
9. Jangan menulis, mencetak, atau meng-commit secret. Hanya sebut NAMA variabel environment.
10. WAJIB minta persetujuan (tulis rencana, lalu berhenti) sebelum: migration/skema, RLS, penghapusan
    atau penimpaan data, dan menambah dependency besar.
11. Setiap step ditutup dengan: `npm run build` lolos, test (bila ada) lolos, `git commit` dengan pesan
    jelas di branch `feat/prd-mvp`. Laporkan bukti berupa output perintah/permintaan nyata,
    bukan klaim.
12. Jangan klaim "selesai" tanpa bukti. Kalau data tidak cukup, tanya.
```

---

# FASE 1 - JALUR LANCAR

## Step P0 - Cadangan, branch, dan audit selisih (hanya membaca)

```
STEP P0: Persiapan dan audit. Di step ini JANGAN mengubah kode kecuali git.

1. `git status`. Commit semua perubahan yang ada ("chore: cadangan sebelum pengerjaan PRD"), lalu buat
   dan pindah ke branch `feat/prd-mvp`.
2. Pastikan file docs/PRD.md ada. Kalau tidak ada, berhenti dan beri tahu saya.
3. Baca docs/PRD.md sampai habis. Tulis ringkasan pemahaman: daftar 20 status, 4 peran, aturan
   waktu (tabel 4.3), dan 28 fitur dalam 8 baris saja.
4. Audit kode saat ini terhadap PRD. Buat tabel: fitur PRD (1-28) | sudah ada / sebagian / belum |
   file terkait | catatan. Daftar juga semua kode yang harus DIBUANG (OTP, demo mode, gateway
   WhatsApp, chat in-app, pembayaran QRIS/VA simulasi, escrow, verifikasi HP, biaya layanan pembeli).
5. Daftar tabel Supabase dan model yang ada sekarang beserta jumlah baris, dan tandai mana yang akan
   diganti skema baru. Jangan mengubah apa pun.
6. Laporkan hal yang ambigu di PRD yang menurutmu menghambat pengerjaan. Lalu berhenti.
```

Selesai kalau: ada tabel audit dan daftar kode yang dibuang. Baca sebelum lanjut.

## Step P1 - Skema database [PERSETUJUAN]

```
STEP P1: Skema database untuk 16 kelompok data di bagian 8.1 PRD. [PERSETUJUAN]
Tulis RENCANA migration (SQL lengkap) dalam satu file `supabase/migrations/<tanggal>_prd_schema.sql`,
TAMPILKAN, lalu berhenti dan tunggu persetujuan saya. Jangan menjalankan sebelum disetujui.

Isi rencana:
1. Enum/tabel untuk 20 status barang (nama persis seperti tabel 4.1 PRD) dan tabel `status_transitions`
   (from_status, to_status, actor_role, trigger) yang diisi seed dari tabel 4.2 PRD, baris demi baris.
   actor_role: CONSIGNOR, BUYER, ADMIN, SYSTEM.
2. Tabel: users (nama, email unik, password_hash, whatsapp, role USER/ADMIN, is_active, rekening
   consignor, alamat pembeli), items (semua kolom di "Barang" bagian 8.1, termasuk harga awal tayang,
   harga minimum, harga tayang saat ini, first_listed_at, listing_ends_at, extension_used,
   view_count, status), identity_documents, test_reports, carts/cart_items, orders (hold_expires_at),
   order_items/sales (harga jual, fee, jumlah consignor, tanggal diterima, warranty_ends_at),
   claims, consignor_payouts, terms_acceptances, item_returns, price_proposals, status_history,
   price_history, settings, notification_log.
3. status_history dan price_history: trigger yang MENOLAK UPDATE dan DELETE.
4. Fungsi SQL (RPC) `transition_item_status(item_id, to_status, actor_id, actor_role, note)` yang:
   mengunci baris barang, memeriksa pasangan (status sekarang -> to_status, actor_role) ada di
   `status_transitions`, memperbarui status, menulis status_history, dan mengembalikan error jelas bila
   tidak valid. Status akhir (Ditolak saat screening, Dikembalikan ke consignor, Consignor sudah
   dibayar) tidak boleh berubah lagi.
5. Fungsi SQL `checkout_hold_items(buyer_id, item_ids[], ...)` yang secara atomik memindahkan barang
   Tayang -> Ditahan menunggu pembayaran dan membuat order; kalau SATU barang sudah tidak Tayang,
   seluruh transaksi dibatalkan dan mengembalikan daftar barang yang gagal.
6. `settings`: seed nilai awal dari PRD (fee 10.000 dan 5%, ambang 200.000, ongkir dummy, batas asuransi
   500.000, biaya penarikan 25.000, penahanan 24 jam, jadwal usulan hari 21/36/50 dan hari 30 (10%),
   batas respons 3 hari, masa penitipan 60 hari, perpanjangan 30 hari, batas keputusan akhir masa 3x24
   jam, batas isi resi 2x24 jam, batas bayar ongkir kembali 1x24 jam, garansi 7 hari, faktor percepatan
   demo = 1, nomor WhatsApp admin, alamat gudang Hingo, daftar alasan penolakan baku).
7. RLS: aktifkan di SEMUA tabel baru, tanpa policy untuk anon dan authenticated (akses hanya lewat
   service role di server). Bucket Storage: kyc-documents, payment-proofs, claim-proofs privat;
   item-photos publik.
8. Daftar tabel/model lama yang akan di-DROP, dan rencana pemindahan data yang masih dibutuhkan.
   Hapus Prisma dan ketergantungan SQLite dari kode setelah migrasi (rencanakan, jangan lakukan dulu).
Setelah saya setujui: terapkan, lalu uji dengan query nyata (tabel ada, trigger menolak UPDATE
status_history, transition_item_status menolak pasangan tidak valid). Commit: "feat(db): skema prd".
```

Selesai kalau: migration diterapkan, trigger append-only terbukti menolak UPDATE, dan fungsi transisi menolak pasangan tidak valid.

## Step P2 - Mesin status dan perhitungan fee (dengan test)

```
STEP P2: Pustaka mesin status dan fee. Rujuk PRD bagian 4 dan 6.1.

1. Buat `src/lib/items/state.ts`: pembungkus untuk RPC transition_item_status (tipe status, tipe pelaku,
   error terstruktur). Tidak ada UPDATE status di tempat lain; cari dan hapus kalau ada.
2. Buat `src/lib/pricing.ts`: `calcFee(hargaJual, settings)` dan `calcConsignorAmount(...)` sesuai 6.1:
   sampai 200.000 fee 10.000; di atas 200.000 fee 5% dibulatkan ke rupiah terdekat. Fungsi
   `changeItemPrice(itemId, newPrice, reason, actor)` yang menulis price_history (alasan: harga awal,
   penurunan yang disetujui consignor, perubahan oleh admin atas permintaan consignor, perpanjangan).
3. Tambahkan test (vitest) yang harus lolos:
   - fee: 150.000 -> fee 10.000, diterima 140.000; 200.000 -> 10.000, 190.000; 500.000 -> 25.000, 475.000;
     1.500.000 -> 75.000, 1.425.000.
   - transisi: SEMUA baris tabel 4.2 PRD valid untuk pelaku yang benar; sampel pasangan tidak valid
     (mis. Tayang -> Consignor sudah dibayar) ditolak; pelaku salah (consignor memindahkan ke Tayang)
     ditolak; status akhir tidak bisa diubah.
4. Jalankan `npm test` dan `npm run build`. Commit: "feat: mesin status dan fee".
```

Selesai kalau: test fee dan transisi lolos semuanya (laporkan jumlah test).

## Step P3 - Pengaturan (fitur 23, bagian logika)

```
STEP P3: Lapisan pengaturan. Rujuk PRD fitur 23 dan bagian 6.

1. Buat `src/lib/settings.ts` yang membaca tabel settings (cache singkat di server), dengan tipe kuat.
   Semua kode lain mengambil angka bisnis dari sini. Cari dan hapus angka bisnis yang tertulis tetap
   di kode (fee, ongkir, 24 jam, 60 hari, dst.).
2. Buat helper waktu `src/lib/time.ts` dengan fungsi yang menghitung durasi dengan "faktor percepatan
   demo" (settings.schedule_speed_factor). Faktor 1 = waktu normal; 1440 = satu hari dihitung satu menit.
   Semua aturan berbasis waktu nanti memakai helper ini.
3. Route admin untuk mengubah pengaturan (UI-nya menyusul di Step P19); perubahan hanya berlaku pada
   perhitungan berikutnya.
4. Test: mengubah fee di settings mengubah hasil calcFee; faktor 1440 menjadikan 24 jam sama dengan
   1 menit. `npm test`, `npm run build`, commit: "feat: pengaturan dan helper waktu".
```

## Step P4 - Akun email + kata sandi (fitur 1 dan 8) dan pembersihan OTP

```
STEP P4: Ganti login jadi email + kata sandi. Rujuk PRD fitur 1, 8, bagian 3 dan 8.2.
Tampilan: Figma Masuk/daftar desktop 10:25941, mobile 10:26026 (sesuaikan: tidak ada OTP).

1. Halaman daftar: nama, email, kata sandi, nomor WhatsApp (WAJIB, hanya disimpan, tidak diverifikasi),
   tanpa verifikasi email. Halaman masuk: email + kata sandi. Satu akun bisa jadi consignor dan pembeli.
2. Kata sandi di-hash dengan argon2 atau bcrypt (pilih dan jelaskan). Batas percobaan login salah
   (mis. 5 kali, kunci 15 menit) tanpa membocorkan apakah email terdaftar.
3. Pertahankan cookie sesi HMAC (src/lib/auth.ts). Sesi memeriksa is_active: akun nonaktif ditolak.
4. Profil: consignor menyimpan rekening pembayaran (bank, nomor, nama pemilik); pembeli menyimpan alamat.
5. Akun admin dibuat oleh skrip `scripts/seed-admin.ts` yang membaca ADMIN_EMAIL dan ADMIN_PASSWORD
   dari environment lokal. Pendaftaran publik TIDAK PERNAH bisa membuat admin.
6. HAPUS: semua kode OTP (src/lib/otp.ts, send-otp, verify-otp, halaman verify-otp dan verify-identity
   lama), mode demo (DEMO_MODE, NEXT_PUBLIC_DEMO_MODE, DEMO_OTP_CODE), gateway WhatsApp, dan dependency
   yang tidak terpakai lagi. Perbarui .env.example.
7. Uji dengan permintaan nyata dan laporkan: daftar -> masuk -> sesi valid; kata sandi salah ditolak;
   percobaan ke-6 terkunci; cookie palsu 401; akun nonaktif tidak bisa masuk; register tidak bisa
   mengirim role=ADMIN.
8. `npm run build`, commit: "feat(auth): login email dan kata sandi, hapus otp".
```

Selesai kalau: semua uji di poin 7 lolos. Setelah ini, hapus `DEMO_MODE`, `NEXT_PUBLIC_DEMO_MODE`, dan `DEMO_OTP_CODE` di Vercel.

## Step P5 - Kategori RAM/SSD/GPU dan data contoh

```
STEP P5: Kategori dan data contoh. Rujuk PRD bagian 2 dan 17 (checklist per kategori).
Tampilan: ikon kategori di Beranda (Figma 1:2, 48:2963) diganti menjadi RAM, SSD, GPU.

1. Kategori hanya RAM, SSD, GPU di seluruh aplikasi (filter katalog, menu, footer, formulir).
   Hapus keyboard, mouse, headset, monitor, aksesoris. Ganti ilustrasi/ikon kategori dengan ikon
   sederhana RAM, SSD, GPU.
2. Definisikan spesifikasi per kategori di satu berkas konfigurasi (mis. `src/lib/categories.ts`):
   RAM (kapasitas, tipe DDR, kecepatan, jumlah keping), SSD (kapasitas, antarmuka SATA/NVMe,
   faktor bentuk), GPU (chipset, VRAM, jumlah kipas, konektor daya).
3. Definisikan checklist uji per kategori di berkas yang sama (usulan awal, tampilkan di laporan agar saya
   bisa mengubahnya):
   - RAM: terdeteksi dengan kapasitas benar di BIOS/OS; kecepatan sesuai spesifikasi; MemTest minimal 1
     pass tanpa error; kontak dan chip tidak rusak.
   - SSD: terdeteksi; persentase kesehatan/SMART tercatat; uji baca-tulis tercatat; tidak ada bad
     sector; fisik dan konektor baik.
   - GPU: terdeteksi dengan VRAM benar; uji stres minimal 15 menit tanpa artefak/crash; suhu
     maksimum tercatat; kipas berfungsi; port output dan konektor daya baik; PCB/kapasitor tidak rusak.
4. Skrip seed `scripts/seed-demo.ts` yang membuat: 2 akun consignor demo, 2 akun pembeli demo, dan
   sekitar 12 barang RAM/SSD/GPU di berbagai status, dibuat MELALUI fungsi transisi status (bukan
   insert status langsung) agar riwayat valid. Tandai semua data demo dengan email berakhiran
   @hinggo-demo.local supaya mudah dihapus.
5. Tampilkan hasil: jumlah barang per status. `npm run build`, commit: "feat: kategori ram ssd gpu dan seed".
```

## Step P6 - Consignor: pengajuan, KTP, persetujuan syarat, resi (fitur 2, 3, 4, 6)

```
STEP P6: Alur consignor bagian pengajuan. Rujuk PRD fitur 2, 3, 4, 6 dan bagian 6.4.
Tampilan: Figma Pengajuan titip jual desktop 14:12784, mobile 14:12992 (sesuaikan isi ke PRD).

1. Formulir pengajuan: jenis (RAM/SSD/GPU), merek, model, kondisi, lama pemakaian, kelengkapan, foto
   (beberapa), harga yang diinginkan, harga minimum, spesifikasi sesuai kategori, pernyataan bahwa barang
   milik sendiri.
2. Unggah KTP dan bukti kepemilikan (nota/tangkapan layar, dus asli, atau foto serial number dengan
   kertas nama dan tanggal) ke bucket privat. Pengajuan TIDAK bisa dikirim tanpa keduanya. File hanya
   bisa dibuka admin dan pemiliknya (signed URL setelah pemeriksaan di server).
3. Status barang menjadi Diajukan lewat fungsi transisi. Tampilkan konfirmasi di dasbor.
4. Setelah admin menyetujui (Step P7), consignor melihat syarat penitipan (fee, ongkir, pembayaran
   setelah garansi, jadwal usulan penurunan harga, aturan akhir masa), panduan packing, dan alamat
   gudang Hingo. Consignor menyetujui syarat -> catat di terms_acceptances dengan waktu.
5. Isi resi hanya bisa dilakukan SETELAH syarat disetujui. Mengisi resi memindahkan status ke
   Dalam perjalanan ke Hingo. Tampilkan batas 2x24 jam dengan hitung mundur.
6. Uji: pengajuan tanpa KTP ditolak; consignor lain tidak bisa membuka KTP (403); resi sebelum setuju
   syarat ditolak. `npm run build`, commit: "feat: pengajuan consignor dan syarat".
```

## Step P7 - Dasbor admin dan antrean screening (fitur 15, 16)

```
STEP P7: Dasbor admin dan screening. Rujuk PRD fitur 15, 16 dan bagian 6.5.
Tampilan: tidak ada frame Figma untuk admin; gunakan token, komponen, dan gaya yang sama dengan situs.

1. Layout /admin hanya untuk role ADMIN (middleware + pemeriksaan di setiap route).
2. Dasbor: jumlah barang per status, total fee, dan daftar tugas yang menunggu tindakan (pengajuan
   baru, bukti transfer masuk, klaim baru, barang siap dibayar ke consignor, dll). Total fee dihitung dari
   penjualan yang sudah melewati masa garansi tanpa klaim (Siap dibayar ke consignor dan Consignor
   sudah dibayar), dan tampilkan juga "fee tertunda" untuk penjualan yang belum lewat garansi.
3. Antrean screening: lihat data, foto, KTP, dan bukti kepemilikan (signed URL). Aksi: Setujui
   (Diajukan -> Disetujui, menunggu kiriman) atau Tolak (Diajukan -> Ditolak saat screening) dengan alasan
   baku dari settings (wajib). Admin juga memberi referensi harga pasar bekas (kolom catatan) kepada
   consignor saat screening.
4. Uji: non-admin ke /admin ditolak; tolak tanpa alasan ditolak; transisi tercatat di status_history.
   `npm run build`, commit: "feat(admin): dasbor dan screening".
```

## Step P8 - Dasbor consignor (fitur 5, bagian dasar)

```
STEP P8: Dasbor consignor. Rujuk PRD fitur 5.
Tampilan: Figma Barang titipan saya desktop 14:13159, mobile 14:13435; Detail barang titipan desktop
14:13670, mobile 14:13929 (sesuaikan isi ke PRD).

1. Daftar semua barang milik consignor dengan status (nama status persis seperti PRD), riwayat harga,
   dan rincian pembayaran (harga jual, fee, jumlah diterima) bila sudah terjual.
2. Usulan penurunan harga yang menunggu jawaban ditampilkan sebagai bagian terpisah (data dan tombol
   jawabannya ditambahkan di Step P15; siapkan tempatnya).
3. Consignor hanya melihat barangnya sendiri; barang consignor lain ditolak (403/404).
4. Uji akses: consignor A tidak bisa membuka barang consignor B lewat URL maupun API.
   `npm run build`, commit: "feat: dasbor consignor".
```

## Step P9 - Penerimaan, laporan uji, harga, dan tayang (fitur 17, 18, 19)

```
STEP P9: Penerimaan dan pengujian barang. Rujuk PRD fitur 17, 18, 19, 4.2, dan 6.4.

1. Admin menandai paket tiba dan dibuka (Dalam perjalanan ke Hingo -> Diterima, sedang diuji).
2. Form laporan uji: checklist sesuai kategori (dari berkas konfigurasi Step P5), unggah foto uji
   (bucket item-photos), tautan video YouTube (validasi format; sarankan unlisted), kelengkapan,
   tanggal uji, hasil Lolos atau Gagal.
3. Barang TIDAK bisa Tayang tanpa laporan uji berstatus Lolos (validasi di server dan di fungsi transisi).
4. Penetapan harga (fitur 18): admin memasukkan harga tayang yang disepakati dengan consignor dan
   bisa mengubahnya atas permintaan consignor; setiap perubahan tercatat di price_history dengan alasan.
   Harga tayang awal juga disimpan sebagai "harga awal" (dasar perhitungan usulan penurunan).
   Saat pertama Tayang: set first_listed_at dan listing_ends_at (60 hari dari settings).
5. Cabang gagal: Gagal uji / tidak sesuai / rusak -> Ditolak setelah pengecekan dengan alasan baku.
   Hasil lebih buruk dari klaim consignor: barang tetap Diterima, sedang diuji; admin mencatat keputusan
   consignor (harga disesuaikan -> Tayang dengan harga baru; ambil kembali -> Menunggu ongkir kembali)
   lewat catatan wajib.
6. Ditolak setelah pengecekan -> Menunggu ongkir kembali (alasan dicatat).
7. Uji: mencoba Tayang tanpa laporan lolos ditolak; transisi tidak valid ditolak dengan pesan jelas.
   `npm run build`, `npm test`, commit: "feat(admin): penerimaan, laporan uji, harga".
```

## Step P10 - Katalog dan halaman produk (fitur 9, 10, 27 sebagian)

```
STEP P10: Katalog dan halaman produk. Rujuk PRD fitur 9, 10, 14 (tautan kebijakan), 27 (jumlah dilihat).
Tampilan: Katalog desktop 10:25047 / mobile 10:25319; Detail produk desktop 10:25521 / mobile 10:25655.

1. Katalog menampilkan HANYA barang berstatus Tayang. Pencarian teks, filter kategori (RAM/SSD/GPU),
   rentang harga, kondisi, urutan harga atau terbaru. Hapus filter "asal pengiriman" bila tidak ada di PRD.
2. Halaman produk: foto, spesifikasi, harga, laporan uji (checklist dan hasil), video YouTube yang bisa
   diputar (embed youtube-nocookie), tanggal uji, kelengkapan, ketentuan garansi, dan tautan ke halaman
   kebijakan. Hapus "Dikelola tim Hingo/Chat admin" in-app: tombol "Chat admin" menjadi tautan wa.me ke
   nomor WhatsApp admin dari settings. Identitas consignor TIDAK pernah tampil.
3. Barang yang tidak berstatus Tayang tetap bisa dibuka lewat URL tetapi menampilkan label
   "Tidak tersedia" tanpa tombol beli.
4. Jumlah pembeli yang melihat barang (view_count) bertambah setiap halaman produk dibuka oleh
   pengunjung selain admin dan pemilik barang.
5. Uji: barang non-Tayang tidak muncul di katalog dan API; label Tidak tersedia benar; view_count naik.
   `npm run build`, commit: "feat: katalog dan produk sesuai prd".
```

## Step P11 - Keranjang dan checkout (fitur 11)

```
STEP P11: Keranjang dan checkout. Rujuk PRD fitur 11, 6.2, dan catatan 4.4/5.5.
Tampilan: Keranjang desktop 10:25747 / mobile 10:25867; Checkout desktop 10:26798 / mobile 10:26966
(sesuaikan: tidak ada "biaya layanan" pembeli, tidak ada escrow, tidak ada QRIS/VA).

1. Keranjang: boleh dipakai tamu (localStorage, seperti sebelumnya) dan digabung ke akun saat masuk.
   Barang di keranjang TIDAK ditahan. Barang yang sudah terjual/ditahan orang lain otomatis keluar dari
   keranjang dengan pemberitahuan di keranjang.
2. Checkout butuh akun. Isi: alamat, ongkir dummy (nilai tetap dari settings), asuransi dummy otomatis
   untuk barang di atas Rp500.000 (ambang dari settings), ringkasan pesanan.
3. Tombol checkout memanggil RPC checkout_hold_items: atomik, memindahkan barang Tayang -> Ditahan
   menunggu pembayaran, membuat order dengan hold_expires_at = sekarang + batas penahanan (settings).
   Satu pesanan boleh berisi barang dari beberapa consignor; status dan klaim per barang.
4. Kalau ada barang yang gagal ditahan, tampilkan daftar barang itu dan jangan membuat pesanan
   sebagian.
5. Uji dengan permintaan nyata: dua pembeli checkout barang yang sama bersamaan, hanya satu berhasil;
   asuransi muncul hanya di atas Rp500.000. `npm run build`, commit: "feat: keranjang dan checkout".
```

## Step P12 - Pembayaran manual dan pesanan (fitur 12, 20)

```
STEP P12: Pembayaran transfer manual dan pencatatan pengiriman. Rujuk PRD fitur 12, 20, 4.2.
Tampilan: Status pesanan desktop 10:27088 / mobile 10:27286 (hapus stepper escrow; pakai status PRD).

1. Pembeli: halaman pesanan menampilkan rekening tujuan (dari settings), nominal, dan batas waktu
   penahanan. Unggah bukti transfer ke bucket privat payment-proofs. Lihat status dan riwayat pesanan.
2. Admin: antrean bukti transfer; verifikasi (Ditahan menunggu pembayaran -> Dibayar, dikemas); isi resi
   (-> Dikirim ke pembeli); isi tanggal terima (-> Diterima pembeli). Tanggal terima memulai garansi:
   simpan warranty_ends_at = tanggal terima + 7 hari (settings).
3. Penjualan per barang dicatat saat pembayaran terverifikasi: harga jual, fee (calcFee), jumlah untuk
   consignor, tanggal diterima.
4. Pembeli hanya melihat pesanannya sendiri; bukti transfer hanya bisa dibuka admin dan pemiliknya.
5. Uji: pembeli lain tidak bisa membuka pesanan/bukti; transisi tidak berurutan ditolak.
   `npm run build`, commit: "feat: pembayaran manual dan pencatatan pengiriman".
```

## Step P13 - Pembayaran ke consignor dan uji jalur lancar (fitur 22, 26)

```
STEP P13: Pembayaran ke consignor dan skenario uji 1. Rujuk PRD fitur 22, 26, bagian 6.1, dan 9.2.

1. Fungsi (nanti dipicu penjadwal di Step P14, sementara bisa dipicu manual oleh admin lewat tombol
   uji khusus mode non-produksi atau skrip): barang Diterima pembeli -> Siap dibayar ke consignor
   bila garansi lewat tanpa klaim dan dana sudah tercatat masuk.
2. Antrean pembayaran consignor (admin): hanya barang berstatus Siap dibayar ke consignor. Admin mencatat
   bukti transfer ke consignor -> status Consignor sudah dibayar dan data consignor_payouts tersimpan.
   Jumlah sesuai 6.1.
3. Dasbor consignor menampilkan rincian pembayaran (harga jual, fee, jumlah diterima).
4. Tulis skrip uji `scripts/scenario-1.ts` yang menjalankan SELURUH jalur lancar lewat fungsi/API nyata:
   pengajuan -> screening setuju -> syarat -> resi -> terima -> uji lolos -> tayang -> checkout -> bukti
   transfer -> verifikasi -> kirim -> terima -> garansi lewat (pakai faktor percepatan) -> siap dibayar
   -> dibayar. Laporkan setiap transisi dan angka akhir fee dan jumlah consignor.
5. Hapus data uji skrip (tampilkan SQL dan tunggu persetujuan bila menyentuh data produksi).
   `npm run build`, `npm test`, commit: "feat: pembayaran consignor dan skenario 1".
```

Selesai kalau: skenario 1 berjalan penuh dengan angka fee dan jumlah consignor benar. **Fase 1 selesai di sini.** Deploy dan cek manual dulu sebelum lanjut.

---

# FASE 2 - ATURAN WAKTU DAN KLAIM

## Step P14 - Penjadwal otomatis (fitur 25)

```
STEP P14: Penjadwal otomatis. Rujuk PRD fitur 25, tabel 4.3, dan skenario uji 9.2 nomor 2, 3, 5, 6.

1. Buat endpoint `POST /api/cron/tick` yang hanya menerima permintaan dengan header rahasia
   (CRON_SECRET, perbandingan waktu-konstan). Endpoint idempotent: aman dipanggil berulang atau dobel.
   Semua pengecekan waktu memakai helper waktu dengan faktor percepatan demo (Step P3).
2. Aturan yang diterapkan tiap tick (setiap aturan lewat fungsi transisi dengan pelaku SYSTEM, dan setiap
   kejadian yang perlu email dicatat sebagai "antrean notifikasi" untuk Step P18):
   a. Penahanan lewat batas: Ditahan menunggu pembayaran -> Tayang, dan pesanan dibatalkan. Pengingat
      sekitar jam ke-12 bila bukti belum masuk.
   b. Pengajuan Disetujui, menunggu kiriman yang resinya tidak diisi dalam 2x24 jam -> Ditolak saat
      screening (kedaluwarsa); consignor bisa mengajukan ulang.
   c. Usulan penurunan harga: barang >= Rp200.000 pada hari ke-21, 36, dan 50 sejak pertama tayang,
      dibuat usulan penurunan sebesar 5% dari harga awal per tahap; barang < Rp200.000 pada hari ke-30,
      satu usulan 10%. Usulan tidak boleh di bawah harga minimum (kalau hasil di bawah minimum, pakai
      harga minimum; kalau sama dengan harga sekarang, tidak ada usulan). Satu usulan per (barang, tahap),
      dijaga constraint unik. Catat harga usulan, tanggal, batas respons.
   d. Batas respons usulan 3 hari dengan satu pengingat; tanpa jawaban dianggap ditolak dan harga tetap.
   e. Hari ke-60: Tayang -> Masa penitipan habis. Pengingat 7 hari sebelum hari ke-60. Batas keputusan 3x24
      jam; tanpa respons -> Menunggu ongkir kembali (dianggap ambil kembali).
   f. Diterima pembeli -> Siap dibayar ke consignor bila garansi 7 hari lewat tanpa klaim dan dana masuk.
   g. Batas bayar ongkir kembali 1x24 jam: bila lewat, tidak ada perubahan status; barang tetap disimpan,
      halaman produk menampilkan Tidak tersedia, dan dikirim balik setelah consignor membayar.
3. Beri tanda pada log (misalnya tabel `scheduler_runs` atau kolom di log) supaya admin bisa melihat
   tick terakhir.
4. Tulis test dengan jam yang bisa disuntik (mock waktu): tiap aturan a-g diuji, termasuk idempotensi
   (menjalankan tick dua kali tidak membuat usulan ganda).
5. Berikan SQL `supabase/cron.sql` untuk saya jalankan di SQL editor Supabase: aktifkan pg_cron dan pg_net,
   jadwalkan pemanggilan POST ke https://hinggo.vercel.app/api/cron/tick tiap 5 menit dengan header
   X-Cron-Secret. Pakai PLACEHOLDER untuk secret (jangan tulis nilai asli di file; jangan commit nilai asli).
6. `npm run build`, `npm test`, commit: "feat: penjadwal otomatis".
```

Selesai kalau: semua test aturan waktu lolos dan kamu menjalankan `cron.sql` di Supabase (isi secret sendiri). Cek bahwa tick berjalan (lihat riwayat eksekusi cron di Supabase).

## Step P15 - Usulan penurunan harga dan keputusan consignor (fitur 5 dan 7)

```
STEP P15: Keputusan consignor. Rujuk PRD fitur 5, 7, bagian 4.2, 4.3, dan 6.5.

1. Dasbor consignor: bagian "Usulan penurunan harga" dengan harga usulan, jumlah pembeli yang melihat
   barang, dan batas respons. Tombol Setujui/Tolak. Setuju -> harga berubah (price_history, alasan
   "penurunan yang disetujui consignor"). Tolak -> harga tetap. Jawaban dicatat (setuju/tolak/tanpa
   jawaban) di price_proposals. Consignor yang ingin harga lain menghubungi admin (tautan wa.me), dan
   admin mengubah harga atas permintaan itu.
2. Setelah masa habis (status Masa penitipan habis): consignor memilih Perpanjang atau Ambil kembali.
   Perpanjang hanya SATU kali, 30 hari (settings): Masa penitipan habis -> Tayang, listing_ends_at diperpanjang;
   harga baru disepakati dengan admin dan dimasukkan admin (alasan "perpanjangan"). Ambil kembali ->
   Menunggu ongkir kembali.
3. Penarikan sebelum masa habis: consignor mengajukan tarik barang dengan biaya Rp25.000 (settings);
   admin memproses -> Menunggu ongkir kembali.
4. Uji: usulan tidak bisa menjawab melewati batas; perpanjang kedua ditolak; consignor lain tidak bisa
   menjawab usulan barang ini. `npm run build`, commit: "feat: keputusan consignor".
```

## Step P16 - Pengembalian barang (bagian 4.4, 6.2)

```
STEP P16: Pengembalian barang ke consignor. Rujuk PRD 4.2, 4.4, 6.2, dan skenario 9.2 nomor 8.

1. Saat barang masuk Menunggu ongkir kembali, buat catatan item_returns dengan alasan (ditolak, ditarik,
   tidak diperpanjang, atau cacat tersembunyi), nominal ongkir kembali (dummy dari settings), dan biaya
   penarikan Rp25.000 bila ditarik sebelum masa habis.
2. Consignor melihat nominal dan rekening Hingo di dasbor, lalu mengunggah bukti transfer (bucket privat).
   Admin memverifikasi bukti; setelah SEMUA biaya lunas, admin mengisi resi pengiriman balik ->
   Dikembalikan ke consignor.
3. Kalau tidak dibayar dalam 1x24 jam: barang tetap disimpan dan halaman produk menampilkan Tidak
   tersedia (sudah dipicu penjadwal). Barang dikirim balik setelah dibayar.
4. Catatan kejadian "ekspedisi mengembalikan barang ke Hingo" ditambahkan admin sebagai catatan pada
   barang tanpa mengubah status akhir.
5. Uji dua jalur: barang ditarik dengan biaya 25.000 + ongkir dibayar lebih dulu; barang ditolak dengan
   ongkir tidak dibayar 1x24 jam lalu dibayar kemudian. `npm run build`, commit: "feat: pengembalian barang".
```

## Step P17 - Klaim garansi (fitur 13, 21)

```
STEP P17: Klaim garansi. Rujuk PRD fitur 13, 21, bagian 6.3, 4.2, dan skenario 9.2 nomor 4.

1. Pembeli: formulir klaim (alasan, bukti foto, tautan video) hanya dalam 7 hari sejak tanggal terima;
   setelah itu formulir menolak. Barang Diterima pembeli -> Klaim diproses. Garansi tidak untuk
   kerusakan akibat salah pasang atau pemakaian (tampilkan ketentuannya).
2. Admin: periksa klaim dan tentukan hasil: cacat tersembunyi (-> Klaim: cacat tersembunyi; consignor tidak
   dibayar; barang kembali ke consignor lewat Menunggu ongkir kembali dengan alasan cacat tersembunyi),
   kesalahan Hingo (-> Klaim: kesalahan Hingo; refund dicatat; barang disimpan, diuji ulang dengan laporan
   uji BARU berstatus Lolos, lalu Tayang lagi), kesalahan pengiriman (-> Klaim: kesalahan pengiriman;
   rincian di luar MVP, cukup catatan), atau tidak valid (-> Diterima pembeli, masa garansi tetap berjalan).
3. Selama Klaim diproses, penjadwal TIDAK boleh memindahkan barang ke Siap dibayar ke consignor.
4. Asumsi yang dipakai untuk celah PRD (tulis di dokumen catatan keputusan): ongkir kembali barang
   dari pembeli ditanggung Hingo untuk kesalahan Hingo dan consignor untuk cacat tersembunyi, dicatat
   sebagai catatan admin tanpa status baru; hitungan masa penitipan 60 hari terus berjalan setelah
   barang kembali Tayang (tidak diulang).
5. Uji: klaim hari ke-8 ditolak; klaim valid cacat tersembunyi dan kesalahan Hingo menghasilkan status
   dan efek yang benar; pembeli lain tidak bisa melihat klaim. `npm run build`, commit: "feat: klaim garansi".
```

---

# FASE 3 - PENYEMPURNAAN

## Step P18 - Notifikasi email (fitur 28)

```
STEP P18: Notifikasi email SMTP. Rujuk PRD fitur 28, bagian 7 (7.1 sampai 7.4), dan 9.1 nomor 28.

1. Modul `src/lib/mail.ts` dengan Nodemailer membaca SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
   MAIL_FROM lewat requireEnv. Template berbahasa Indonesia, tetap per peristiwa, tertulis di kode
   (tidak bisa diubah admin).
2. Kirim email untuk SEMUA peristiwa di tabel 7.2 (consignor), 7.3 (pembeli), dan 7.4 (admin: pengajuan
   baru, bukti transfer masuk, klaim baru, barang Siap dibayar ke consignor). Gunakan antrean notifikasi
   dari Step P14 dan titik-titik transisi status di Step P6-P17. Pengingat usulan, pengingat masa
   penitipan (7 hari sebelum hari ke-60), dan pengingat penahanan jam ke-12 juga dikirim.
3. Catat setiap pengiriman di notification_log (penerima, peristiwa, waktu, hasil terkirim/gagal).
   Kegagalan dicatat dan TIDAK dicoba ulang otomatis. Admin bisa melihat log kegagalan di dasbor.
4. Penanda di dasbor (consignor, pembeli, admin) ditampilkan dari status dan daftar tugas; dasbor tetap
   sumber kebenaran.
5. Uji: kirim satu email nyata ke alamat saya untuk 3 peristiwa berbeda; matikan SMTP sementara dan
   pastikan kegagalan tercatat tanpa melempar error ke pengguna. `npm run build`, commit:
   "feat: notifikasi email".
```

## Step P19 - Manajemen pengguna dan UI pengaturan (fitur 23, 24)

```
STEP P19: Manajemen pengguna dan halaman pengaturan. Rujuk PRD fitur 23, 24, dan 9.1 nomor 23, 24.

1. Halaman pengaturan admin: ubah fee, ambang, ongkir dummy, biaya penarikan, alasan penolakan, nomor
   WhatsApp admin, dan percepatan jadwal untuk demo. Perubahan berlaku pada perhitungan berikutnya.
2. Manajemen pengguna: daftar consignor dan pembeli, nonaktifkan/aktifkan akun. Akun nonaktif tidak
   bisa masuk, data dan riwayatnya tetap. Sistem MENOLAK penonaktifan bila akun masih punya barang aktif
   atau pesanan berjalan. Admin bisa "nonaktifkan paksa" dengan catatan wajib: barang akun itu
   disembunyikan dari katalog dan pesanan yang belum dibayar dibatalkan (lewat fungsi transisi).
3. Uji: penonaktifan ditolak saat ada barang aktif; paksa dengan catatan berhasil dan efeknya benar.
   `npm run build`, commit: "feat(admin): pengguna dan pengaturan".
```

## Step P20 - Kebijakan, riwayat, dan retensi data (fitur 14, 27)

```
STEP P20: Halaman kebijakan, tampilan riwayat, dan retensi KTP. Rujuk PRD fitur 14, 27, bagian 8.

1. Halaman Garansi dan Retur (isi dari PRD 6.3), bisa dibuka dari menu/footer dan dari halaman produk.
   Perbarui /privacy dan /terms agar tidak bertentangan dengan PRD.
2. Tampilan riwayat di admin dan dasbor consignor: riwayat status, riwayat harga, usulan penurunan,
   dengan waktu dan pelaku. Tidak ada tombol ubah/hapus riwayat.
3. Retensi: tambahkan aturan di penjadwal: KTP dan bukti kepemilikan dihapus (file dan baris) 90 hari
   setelah barang berstatus akhir (Ditolak saat screening, Dikembalikan ke consignor, Consignor sudah
   dibayar), KECUALI ada klaim/sengketa terkait barang itu. Tulis test dengan jam suntikan.
4. `npm run build`, `npm test`, commit: "feat: kebijakan, riwayat, retensi".
```

## Step P21 - Tinjauan keamanan ulang (read-only lalu perbaikan)

```
STEP P21: Tinjauan keamanan setelah banyak tabel dan upload baru.

1. RLS: daftar semua tabel di schema public dan statusnya; anon harus ditolak di semua tabel sensitif.
   Uji dengan permintaan nyata memakai anon key dari environment (JANGAN mencetak key).
2. Storage: kyc-documents, payment-proofs, claim-proofs HARUS privat; coba akses URL publik dan harus gagal.
3. Akses antarpengguna dengan permintaan nyata: consignor A ke barang/KTP consignor B; pembeli ke KTP
   consignor; pembeli A ke pesanan/klaim pembeli B; non-admin ke /admin dan /api/admin. Semua harus
   ditolak.
4. Cookie palsu/lama ditolak. Akun nonaktif tidak bisa masuk.
5. Bundle klien: setelah `npm run build`, pindai .next\static untuk "service_role" dan
   "SUPABASE_SERVICE_ROLE_KEY"; hasilnya harus kosong (di PowerShell pakai Get-ChildItem -Recurse |
   Select-String).
6. `git ls-files` tidak boleh memuat .env, file .db, atau kunci. Kode yang menulis ke disk lokal di
   Vercel tidak boleh ada.
7. Laporkan temuan berurutan dari risiko tertinggi. Perbaikan yang butuh skema/RLS/hapus data
   menunggu persetujuan saya. Commit perbaikan: "fix: temuan keamanan prd".
```

## Step P22 - Uji delapan skenario (bagian 9.2) dan matriks 28 fitur

```
STEP P22: Verifikasi akhir terhadap kriteria selesai PRD bagian 9.

1. Naikkan faktor percepatan demo (settings) agar skenario berbasis waktu cepat. Jalankan tiap skenario
   di bagian 9.2 PRD dari awal sampai akhir lewat skrip yang memanggil API/fungsi nyata di lingkungan
   uji (atau produksi dengan data berpenanda @hinggo-demo.local):
   1 jalur lancar, 2 penolakan, 3 penahanan (termasuk dua pembeli bersamaan), 4 klaim (dua hasil),
   5 penurunan harga (setuju dan tolak/tanpa jawaban), 6 akhir masa (perpanjang, ambil kembali,
   tanpa respons), 7 akses, 8 pengembalian.
2. Susun matriks: fitur 1-28 | kriteria selesai (kutip bagian 9.1) | bukti (perintah/permintaan dan hasil)
   | status lulus/gagal. Jangan menandai lulus tanpa bukti.
3. Daftar semua data demo yang dibuat dan SQL penghapusannya; tunggu persetujuan sebelum menghapus
   di produksi.
4. Kembalikan faktor percepatan ke 1 setelah selesai.
5. Simpan matriks ke docs/VERIFIKASI.md dan commit: "docs: verifikasi kriteria selesai".
```

## Step P23 - Penyelarasan visual dengan Figma

```
STEP P23: Bandingkan tampilan dengan Figma untuk layar yang ada frame-nya, dan perbaiki selisih.
Gunakan Figma MCP dan screenshot browser di lebar 1440 dan 390.

Layar (desktop / mobile): Beranda 1:2 / 48:2963; Katalog 10:25047 / 10:25319; Detail produk
10:25521 / 10:25655; Keranjang 10:25747 / 10:25867; Masuk/daftar 10:25941 / 10:26026;
Checkout 10:26798 / 10:26966; Status pesanan 10:27088 / 10:27286; Pengajuan titip jual 14:12784 /
14:12992; Barang titipan saya 14:13159 / 14:13435; Detail barang titipan 14:13670 / 14:13929.

Untuk tiap layar buat tabel: selisih utama | keparahan. Elemen Figma yang bertentangan dengan PRD
(verifikasi HP, verifikasi identitas lama, chat in-app, biaya layanan, escrow) JANGAN dikembalikan;
catat saja sebagai "sengaja berbeda, mengikuti PRD". Setelah tabel, berhenti dan tunggu saya memilih
selisih yang diperbaiki.
```

---

## Catatan

- **Pemetaan fitur ke step:** 1 -> P4; 2, 3, 4, 6 -> P6; 5 -> P8, P15; 7 -> P15; 8 -> P4; 9, 10 -> P10; 11 -> P11; 12 -> P12; 13 -> P17; 14 -> P10, P20; 15, 16 -> P7; 17, 18, 19 -> P9; 20 -> P12; 21 -> P17; 22 -> P13; 23 -> P3, P19; 24 -> P19; 25 -> P14; 26 -> P2, P13; 27 -> P1, P10, P20; 28 -> P18.
- **Asumsi yang dipakai karena PRD tidak menjelaskan** (konfirmasi ke tim bila mau): (1) ongkir kembali setelah klaim valid: Hingo untuk kesalahan Hingo, consignor untuk cacat tersembunyi, dicatat manual; (2) hitungan 60 hari tidak diulang saat barang kembali Tayang; (3) barang tepat Rp200.000 masuk jadwal usulan 3 tahap; (4) usulan di bawah harga minimum dijepit ke harga minimum; (5) total fee di dasbor = penjualan yang lewat garansi tanpa klaim; (6) fee 5% dibulatkan ke rupiah terdekat; (7) checklist uji per kategori di Step P5 adalah usulan awal.
- Kalau Antigravity melapor "berhasil" tanpa bukti permintaan atau output nyata, minta ulang dengan bukti.
- Jangan tempel secret ke chat. SMTP, CRON_SECRET, dan password admin hanya di `.env.local` dan Vercel.
