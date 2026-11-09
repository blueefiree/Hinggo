# Hingo — Platform Titip Jual Gaming Gear Preloved Terverifikasi

Platform marketplace titip jual (*managed consignment*) dan rekening bersama (*escrow rekber*) khusus perlengkapan gaming (keyboard mekanikal, mouse, headset, monitor, dan aksesoris) dengan kurasi fisik ketat oleh tim Hingo.

> 📖 **Dokumentasi Lengkap Berkas & Arsitektur:** Silakan baca berkas [HINGGO_PROJECT_STRUCTURE.md](./HINGGO_PROJECT_STRUCTURE.md) untuk rincian direktori, daftar endpoint API, dan relasi database.

---

## 🚀 Fitur Unggulan

- **Strict Guest-First Authentication:** Pengunjung bebas menjelajahi katalog tanpa login. Halaman pribadi otomatis diproteksi via Middleware.
- **Real OTP Delivery (WhatsApp & Email):** Pengiriman kode OTP 6-digit asli via Baileys WhatsApp Web QR terintegrasi & Nodemailer SMTP.
- **Dual-Layer Database:** Supabase PostgreSQL cloud sync (`obdczozspvkdebhtyhoh.supabase.co`) dan Prisma ORM (SQLite lokal fallback).
- **Persistent Session 30 Hari:** Sesi login aman berbasis HTTP-only cookie selama 30 hari.
- **Konsinyasi & Escrow Rekber:** Sistem penahanan dana transaksi hingga pembeli mengonfirmasi paket sesuai dalam masa uji 48 jam.
- **Katalog Zero-Dummy:** Mulai murni dari 0 data di database Supabase.

---

## 🛠️ Panduan Memulai

1. **Instal Dependensi:**
   ```bash
   npm install
   ```

2. **Setup Skema Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

4. **Kompilasi Build Produksi:**
   ```bash
   npm run build
   ```
