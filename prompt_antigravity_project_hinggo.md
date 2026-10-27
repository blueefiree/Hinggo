# Master Prompt & Blueprint Google Antigravity — Proyek Hingo (Via Figma MCP & Full-Stack)

Dokumen ini berisi **Panduan Koneksi Figma MCP ke Google Antigravity**, **Prompt Khusus Figma MCP (Tinggal Paste Link Figma)**, serta **Master Blueprint Full-Stack** berdasarkan **27 artboard (14 halaman Desktop 1440px + 13 halaman Mobile 390px)** dari desain Figma **Hingo** (`Hinggo.zip`).

---

## 1. Cara Menghubungkan Figma ke Google Antigravity via MCP

Temanmu benar! Di **Google Antigravity IDE**, kamu bisa menghubungkan **Figma MCP (Model Context Protocol)** supaya agen Antigravity bisa langsung membaca *layer*, *auto-layout*, *padding*, warna, dan teks langsung dari link Figma kamu tanpa perlu mengetik ulang detail UI satu per satu.

Ada **2 cara setup Figma MCP di Antigravity** (pilih salah satu):

### Opsi A: Pakai `figma-developer-mcp` (Gratis & Bisa dari Figma Web)
Cara ini paling praktis karena hanya butuh *Personal Access Token* dari akun Figma kamu:
1. Buka Figma → klik foto profilmu → **Settings** → tab **Security / Account** → gulir ke **Personal access tokens** → klik **Generate new token** (beri nama `Antigravity` dengan izin *File content: Read-only*), lalu *copy* tokennya (`figd_...`).
2. Buka **Google Antigravity IDE** → klik **Settings** (ikon gerigi di kiri bawah) → pilih **Customizations** → di bagian **Installed MCP Servers**, klik **Open MCP Config** untuk membuka file `mcp_config.json`.
3. Tempelkan konfigurasi berikut ke dalam `mcp_config.json` (ganti `FIGMA_TOKEN_KAMU` dengan token `figd_...` tadi):

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=FIGMA_TOKEN_KAMU",
        "--stdio"
      ]
    }
  }
}
```

4. Simpan file `mcp_config.json`, lalu klik tombol **Refresh** di daftar *Installed MCP Servers* Antigravity.

### Opsi B: Pakai Built-in Figma Desktop MCP (Jika Pakai Aplikasi Figma Desktop + Akun Dev/Education)
1. Buka file **Hingo** di aplikasi **Figma Desktop**, tekan `Ctrl + K` (*Quick Actions*) atau buka menu **Figma > Preferences > Enable Dev Mode MCP Server** (server lokal aktif di `http://127.0.0.1:3845/sse`).
2. Di **Google Antigravity IDE**, buka **Settings > Customizations > MCP Store**, cari **Figma**, lalu klik **Add**.

---

## 2. Prompt Khusus "Figma MCP" untuk Google Antigravity (Langsung Pakai!)

Karena **Figma MCP hanya mengirimkan data tampilan UI** (belum memiliki logika *database*, autentikasi, *checkout*, dan *state* konsinyasi), gunakan **Prompt Khusus Figma MCP** di bawah ini setelah MCP kamu aktif. Agen Antigravity akan otomatis memanggil *tool* MCP Figma untuk menarik desain dari URL Figma-mu sekaligus membangun *backend* & *database*-nya:

```markdown
Gunakan tool **Figma MCP** yang terhubung di workspace ini untuk membaca dan menginspeksi desain dari file Figma proyek **"Hingo"** berikut:
- Link Utama (File Key `xKNQ51VDVCSdk8qF8bUelM`): https://www.figma.com/design/xKNQ51VDVCSdk8qF8bUelM/Hinggo?node-id=0-1&t=AxQW24sP35qZBtMv-1
- Link Node Spesifik (`14:13159`): https://www.figma.com/design/xKNQ51VDVCSdk8qF8bUelM/Hinggo?node-id=14-13159&t=DbCuXNbhaU1aUttM-1

### TUGASmu SEBAGAI AGENT ANTIGRAVITY:
1. **Tarik Data Desain via Figma MCP**:
   - Panggil tool Figma MCP (`get_figma_data` / `get_node` / `get_variable_defs`) pada file key `xKNQ51VDVCSdk8qF8bUelM` (mulai dari node `0:1` dan `14:13159`) untuk mengekstrak seluruh 27 frame (14 layar Desktop `1440px` dan 13 layar Mobile `390px`), struktur Auto-Layout, tipografi, serta design tokens (`#FFC629` Hingo Yellow, `#FFFBEB` Warm Cream, `#1A1A1A` Dark Surface, `#16A34A` Verified Green, `#F6F6F4` Neutral Surface).
2. **Bangun Aplikasi Full-Stack (Next.js 15 + TypeScript + Tailwind CSS + Supabase PostgreSQL + Prisma ORM)**:
   - Terjemahkan setiap frame Figma yang ditarik dari MCP menjadi halaman Next.js (App Router) yang **pixel-accurate** dan **responsif** (menggabungkan frame Desktop `1440px` dan Mobile `390px` ke dalam satu route yang responsif lengkap dengan Mobile Bottom Navigation Bar).
   - Hubungkan seluruh halaman ke database PostgreSQL (Supabase) melalui **Prisma ORM** lengkap dengan `prisma/seed.ts` sesuai data asli di dalam frame Figma:
     - **Auth & KYC** (`/auth/login`, `/auth/verify-otp`, `/auth/verify-identity`): Login OTP WhatsApp/Email (`+62 812 3456 7890`), verifikasi 6 digit OTP (`4821`), dan stepper 3 tahap unggah KTP (`ktp_naya.jpg`) & selfie (`selfie_naya.jpg`) untuk akun **Naya Putri**.
     - **Belanja & Katalog** (`/`, `/catalog`, `/product/[slug]`, `/cart`): Home dengan hero kuning `#FFC629`, katalog dengan filter interaktif (Kategori, Kondisi *Sangat baik/Baik*, Harga `≤ Rp2.000.000`, Asal *Jakarta Selatan*), detail produk `Keychron K2 V2` (`Rp850.000`), dan keranjang stok tunggal (*stok preloved = 1*).
     - **Checkout & Transaksi Escrow** (`/checkout`, `/orders/[id]`): Pemilihan kurir (`JNE REG Rp18.000` vs `J&T Reguler Rp22.000`), proteksi pengiriman (`Rp5.000`), biaya layanan (`Rp2.500`), metode bayar (`BCA Virtual Account` / `QRIS`), dan halaman pelacakan pesanan `GRL-20261022-0842` (`Rp875.500` ditahan Hingo) dengan tombol konfirmasi terima barang & lapor masalah.
     - **Ruang Penjual / Konsinyasi** (`/seller/consignments/new`, `/seller/consignments`, `/seller/consignments/[code]`): Form 5 bagian pengajuan titip jual (`Keychron V1`), dashboard 4 KPI dengan **9 kartu status barang titipan** (`HG-261018-031` Logitech MX Master 3S s/d `HG-261012-039` AOC 24G2), ringkasan pencairan (`Rp1.450.000` belum dibayarkan & `Rp450.000` sudah diterima), serta halaman detail laporan inspeksi fisik `HG-261018-031`.
     - **Chat Admin & CS** (`/chat/product`, `/chat/support`): Ruang chat 3 kolom dengan `Admin Hingo` (diskusi `Keychron K2 V2` + quick-reply chips) dan `CS Mira` (`Tiket CS-0842` terkait transaksi `GRL-20261022-0842`).
3. **Verifikasi Otomatis**:
   - Jalankan migrasi Prisma & seed database, nyalakan server development, dan buka browser preview di Antigravity untuk memvalidasi tampilan Desktop (`1440px`) dan Mobile (`390px`) terhadap node Figma asli.
```

---

## 3. Ringkasan Arsitektur & Tech Stack Rekomendasi

Berdasarkan alur bisnis **Hingo** (*platform konsinyasi & jual-beli peripheral komputer preloved yang dikelola tim Hingo*) serta integrasi **GitHub + Supabase** di akunmu, berikut dua pilihan arsitektur terbaik yang sudah disiapkan di dokumen ini:

| Komponen | Stack Utama (Rekomendasi Modern) | Stack Alternatif (Lokal / Kampus) | 
| ----- | ----- | ----- | 
| **Framework** | **Next.js 15 (App Router) + TypeScript** | **Laravel 11 + Blade / Livewire** | 
| **UI & Styling** | **Tailwind CSS + shadcn/ui + Lucide Icons** | **Tailwind CSS + Alpine.js** | 
| **Database** | **Supabase (PostgreSQL)** | **MySQL 8.0 (via Laragon / XAMPP)** | 
| **ORM & Validasi** | **Prisma ORM + Zod** | **Eloquent ORM + Laravel Form Request** | 
| **Auth & Storage** | **Supabase Auth (OTP WA/Email + Google OAuth) & Storage** | **Laravel Breeze/Socialite + Local/S3 Storage** | 
| **Realtime Chat** | **Supabase Realtime Channels** | **Laravel Reverb / Pusher** | 

---

## 4. Master Prompt Lengkap (Jika Tanpa Figma MCP / Pakai Ekstraksi Penuh)

Jika sewaktu-waktu terkena limit API Figma atau ingin memberikan spesifikasi tertulis paling detail ke **Agent Chat di Google Antigravity IDE**, salin seluruh blok di bawah ini:

```markdown
# ROLE & OBJECTIVE
Act as a Principal Full-Stack Engineer and UI/UX Architect inside Google Antigravity. Build a complete, production-ready, pixel-accurate full-stack web application called **"Hingo"** ("Titip jual gear, kami yang urus") — a managed consignment marketplace for preloved computer peripherals (Keyboards, Mice, Headsets, Monitors, and Accessories) where the Hingo team handles online screening, physical inspection, storage, social media marketing (Instagram, Facebook, TikTok), escrow payment, and shipping.

Implement both **Desktop (1440px container layout)** and **Mobile (390px responsive layout with mobile bottom navigation bar)** views across all 14 core screens from the Hingo Figma specification.

---

# 1. TECH STACK & ARCHITECTURE
- **Framework**: Next.js 15 (App Router, Server Components + Server Actions) with TypeScript.
- **Styling**: Tailwind CSS + `shadcn/ui` primitives + `lucide-react` icons.
- **Database & Backend**: PostgreSQL (hosted on Supabase) managed via **Prisma ORM**.
- **Authentication**: Passwordless OTP login (Phone/WhatsApp & Email OTP simulation + Google OAuth) with automatic account creation on first OTP verification and a 3-step KYC Identity Verification flow.
- **State & Validation**: React Hook Form + Zod schema validation + URL search params for catalog filters.

---

# 2. DESIGN SYSTEM & EXACT FIGMA TOKENS
Configure `tailwind.config.ts` and `globals.css` with these exact tokens extracted from the Hingo Figma design:
- **Brand Primary (Hingo Yellow)**: `#FFC629` (Hover: `#FFC420`, Border/Accent: `#F59E0B`)
- **Warm Cream Surface (Hero & Info Cards)**: `#FFFBEB` / `#FFF9E4` with soft amber border `#FDE68A`
- **Primary Dark / CTA / Footer Surface**: `#1A1A1A` (Text on dark: `#FFFFFF`, Muted text on dark: `#A3A3A3`)
- **Backgrounds**: Page background `#FFFFFF`, Neutral Input/Pill surface `#F6F6F4`, Card border `#E5E5E5`
- **Typography**: `Plus Jakarta Sans` or `Inter`
  - Hero Headline: `52px` bold (Desktop) / `30px` bold (Mobile), tight tracking
  - Page Title: `30px`–`32px` bold (`#1A1A1A`)
  - Section Title: `20px`–`22px` bold (`#1A1A1A`)
  - Card Title: `15px`–`16px` semibold
  - Body & Metadata: `13px`–`14px` regular (`#555555` and `#8A8A8A`)
- **Semantic Badges**:
  - Verified / Inspected (`Dicek tim`, `Dikelola Hingo`, `Pencairan sudah diterima`): Text `#16A34A`, Background `#DCFCE7` / `#F0FDF4`
  - Action Required / Warning (`Tinjau hasil inspeksi`, `Siap dikirim ke Hingo`, `Perlu revisi`, `Pengembalian dibahas`): Text `#92400E` / `#1A1A1A`, Background `#FEF3C7` / `#FFFBEB`, Border `#F59E0B`
  - Neutral Status (`Menunggu review`, `Dalam kiriman ke Hingo`, `Sedang dipasarkan`): Background `#F6F6F4`, Border `#E5E5E5`, Text `#1A1A1A`
- **Border Radius**: `rounded-2xl` (`16px`) for product & consignment cards, `rounded-3xl` (`24px`) for hero banners, `rounded-full` for filter pills and status badges, `rounded-xl` (`12px`) for buttons and inputs.

---

# 3. PRISMA DATABASE SCHEMA (`prisma/schema.prisma`)
Create a comprehensive Prisma schema and seed script (`prisma/seed.ts`) covering these models:

1. **`User`**:
   - `id`, `name` (default seed: `"Naya Putri"`), `phone` (`"+62 812 3456 7890"`), `email` (`"naya.putri@example.com"`), `city` (`"Bandung"`), `role` (`USER`, `ADMIN`, `CS`), `phoneVerified` (`Boolean`), `kycStatus` (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`), `createdAt`.
2. **`KycDocument`**:
   - `id`, `userId`, `fullNameKtp` (`"Naya Putri"`), `maskedNik` (`"•••• •••• •••• 0842"`), `ktpFileName` (`"ktp_naya.jpg"`), `ktpFileSize` (`"1,8 MB"`), `selfieFileName` (`"selfie_naya.jpg"`), `selfieFileSize` (`"2,1 MB"`), `uploadedAt`, `status` (`PENDING_REVIEW`, `APPROVED`, `NEEDS_REVISION`).
3. **`Address`**:
   - `id`, `userId`, `label` (`"Rumah"`), `isPrimary` (`true`), `recipientName` (`"Naya Putri"`), `phone` (`"0812 3456 7890"`), `fullAddress` (`"Jl. Melati No. 18, RT 003/RW 005, Tebet, Jakarta Selatan, DKI Jakarta 12810"`), `city` (`"Jakarta Selatan"`).
4. **`Product`** (Catalog items managed by Hingo):
   - `id`, `code` (e.g., `"K2-0842"`), `slug`, `brand` (`KEYCHRON`, `LOGITECH`, `HYPERX`, `LG`, `AKKO`, `RAZER`, `STEELSERIES`, `SAMSUNG`, `SONY`, `DELL`), `name`, `category` (`KEYBOARD`, `MOUSE`, `HEADSET`, `MONITOR`, `ACCESSORIES`), `subtitle` (`"Wireless mechanical keyboard · Brown switch"`), `condition` (`SANGAT_BAIK`, `BAIK`), `usageDuration` (`"8 bulan"`), `switchOrVariant` (`"Gateron Brown"`), `completeness` (`"Box, kabel, keycap puller"`), `description`, `defectNotes` (`"Ada gores halus di sisi bawah, tidak terlihat saat dipakai."`), `price` (`850000`), `originalNewPrice` (`1499000`), `rating` (`4.9`), `soldCount` (`2100`), `stock` (`1`), `location` (`"Jakarta Selatan"`), `isVerifiedByTeam` (`true`), `images` (JSON array), `createdAt`.
5. **`ConsignmentItem`** (Seller consignment submissions & lifecycle):
   - `id`, `code` (e.g., `"HG-261018-031"` through `"HG-261012-039"`), `sellerId`, `category`, `brandModel`, `variantSpec`, `usageDuration`, `additionalSpecs`, `currentCondition`, `defectDetails`, `completeness`, `photos` (JSON: front, bottom/defect, accessories), `expectedPrice`, `proposedPriceAfterInspection`, `consignmentFee`, `estimatedNetPayout`, `actualNetPayout`, `originCity`, `handoverMethod` (`SHIP_AFTER_ONLINE_CHECK`, `DROP_OFF_BY_ADMIN_INSTRUCTION`), `inboundCourier` (`"JNE REG"`), `inboundTrackingNumber` (`"HGO261020031"`), `stage` (`ONLINE_CHECK`, `REVISION_NEEDED`, `ONLINE_CHECK_PASSED`, `SHIPPING_TO_HINGO`, `INSPECTION_COMPLETED`, `PRICE_AGREED_MARKETING`, `SOLD_SHIPPING_TO_BUYER`, `PAYOUT_COMPLETED`, `RETURN_DISCUSSED`), `actionActor` (`SELLER`, `HINGO`, `SELLER_AND_HINGO`, `COMPLETED`), `badgeLabel`, `statusSummary`, `inspectionReport` (JSON: functionNormal, hasCosmeticDefect, specs, functionTest, conditionAndDefect, completenessReceived, inspectedAt), `updatedAt`.
6. **`ConsignmentTimeline`**:
   - `id`, `consignmentId`, `stepOrder`, `title`, `timestampText`, `description`, `state` (`COMPLETED`, `CURRENT`, `UPCOMING`).
7. **`Order`** (Buyer transactions & escrow):
   - `id`, `orderCode` (`"GRL-20261022-0842"`), `buyerId`, `productId`, `addressId`, `itemPrice` (`850000`), `shippingCourier` (`"JNE REG"`), `shippingCost` (`18000`), `shippingProtection` (`5000`), `serviceFee` (`2500`), `totalAmount` (`875500`), `paymentMethod` (`BCA_VA`, `QRIS`), `buyerNote` (`"Mohon bubble wrap tambahan, ya."`), `trackingNumber` (`"JNE2201040842"`), `escrowStatus` (`HELD_BY_HINGO`, `RELEASED_TO_SELLER`, `DISPUTED`), `orderStatus` (`AWAITING_PAYMENT`, `PACKING`, `SHIPPED`, `DELIVERED_CHECKING`, `COMPLETED`, `ISSUE_REPORTED`), `inspectionDeadline` (`"26 Okt 2026, 14.00 WIB"`), `createdAt`.
8. **`ChatThread` & `ChatMessage`**:
   - `ChatThread`: `id`, `type` (`PRODUCT_ADMIN`, `CS_SUPPORT`, `SYSTEM_INFO`), `title` (`"Admin Hingo"`, `"CS Hingo · Resmi"`), `agentName` (`"Mira · Tim bantuan · Online"`), `ticketCode` (`"CS-0842"`), `relatedProductId`, `relatedOrderId`, `updatedAt`.
   - `ChatMessage`: `id`, `threadId`, `senderRole` (`USER`, `ADMIN`, `CS`), `content`, `timeLabel` (`"14.05"`), `isRead` (`true`).

---

# 4. GLOBAL LAYOUT & NAVIGATION COMPONENTS
1. **Top Navigation Bar (Desktop & Mobile)**:
   - Left: Yellow square logo badge `[H]` (`#FFC629`, bold black `H`) + brand text `Hingo`.
   - Center Search Bar: Rounded pill input (`#F6F6F4`) with search icon (`"Cari keyboard, mouse, headset, monitor…"` on Home or `"Cari barang preloved impianmu…"` on inner pages).
   - Right Navigation Links: `Kategori` (links to `/catalog`), `Promo`, `Titip jual` (links to `/seller/consignments`), icon buttons for **Chat** (`/chat/product`), **Wishlist**, and **Cart** (`/cart`), plus yellow CTA button `Masuk` (`/auth/login`) when logged out or user pill `Naya` when logged in.
2. **Sub-Header Bar**:
   - Buyer pages: Left text `"Titip jual gear. Kami cek, simpan, dan pasarkan."` | Right text `"Konsinyasi dikelola tim kami · Pusat bantuan"`.
   - Seller pages (`/seller/*`): Navigation tabs `Barang titipan saya` (`/seller/consignments`), `Ajukan titip jual` (`/seller/consignments/new`), and right label `Ruang penjual · Naya Putri`.
3. **Mobile Bottom Navigation Bar (Visible on `<768px` viewports)**:
   - Fixed bottom bar with 4 tabs: `Beranda` (`/`), `Jelajah` (`/catalog`), `Transaksi` (`/orders/GRL-20261022-0842`), `Akun` (`/seller/consignments`).
4. **Global Footer (`#1A1A1A`)**:
   - Left column: `[H] Hingo` logo + description `"Layanan konsinyasi peripheral komputer. Kami cek, simpan, pasarkan lewat media sosial, dan kirim barang titipan ke pembeli."`
   - 3 Link Columns (yellow headers `#FFC629`):
     - `Belanja`: Keyboard, Mouse, Headset, Monitor, Aksesoris
     - `Bantuan`: Pusat Bantuan, Chat CS, Cara titip jual, Pengembalian
     - `Hingo`: Tentang Kami, Titip jual di Hingo, Kebijakan Privasi, Syarat & Ketentuan

---

# 5. DETAILED 14-SCREEN SPECIFICATIONS (DESKTOP 1440px & MOBILE 390px)

### SCREEN 1: Home (`/`)
- **Hero Banner (`#FFC629` rounded-3xl container)**:
  - Left column: White pill badge `✓ Konsinyasi dikelola tim kami`, H1 `"Titip jual gear, kami yang urus."`, body `"Titipkan peripheral ke Hingo. Kami cek, simpan, pasarkan lewat Instagram, Facebook, dan TikTok, lalu kirim ke pembeli."`, buttons `Belanja sekarang` (`#1A1A1A` → `/catalog`) and `Cara titip jual` (`#FFFFFF` → `/seller/consignments/new`).
  - Right column: 3 white bento cards featuring clean vector illustrations of a Mechanical Keyboard (top wide card), Wireless Mouse (bottom-left card), and Gaming Headset (bottom-right card) with `#1A1A1A` and `#FFC629` accents.
- **4 Trust Pillars Bar**: Single rounded card strip with 4 items (`Dikelola tim kami`, `Pengecekan barang`, `Chat admin`, `Pengiriman terlacak`).
- **Kategori Populer**: 4 cards on `#FFFBEB` background (`Keyboard · 1.240 produk`, `Mouse · 860 produk`, `Headset · 540 produk`, `Monitor · 320 produk`).
- **Produk Terlaris**: 4-column grid of verified items (`Keychron K8 Pro Wireless Mechanical` Rp1.499.000, `Logitech MX Master 3S Wireless` Rp1.599.000, `HyperX Cloud III Gaming Headset` Rp1.349.000, `LG UltraGear 27" 165Hz IPS` Rp3.299.000). Each card has top-left badge `✓ Dicek tim`, top-right heart button, brand name, title, star rating + sold count, bold price, and bottom badge `✓ Dikelola Hingo · Jakarta`.
- **How Consignment Works Section (`#FFFBEB` container)**: Title `"Titip jual, kami urus sampai terjual"` + 4 numbered white cards (`1. Ajukan titip jual`, `2. Kami cek & simpan`, `3. Kami pasarkan`, `4. Terjual & dikirim`).
- **Rekomendasi Untukmu**: 4-column grid (`Akko 3068B Plus Hot-swap` Rp899.000, `Razer DeathAdder V3` Rp1.099.000, `SteelSeries Arctis Nova 1` Rp1.199.000, `Samsung Odyssey G5 32" 144Hz` Rp3.899.000).

### SCREEN 2: Masuk atau Daftar (`/auth/login`)
- **Desktop 2-Column Split / Mobile Single Column**:
  - Left editorial panel (Desktop): Pill `PRELOVED, RELOVED.`, H1 `"Gear bagus tak harus baru."`, description, mechanical keyboard photo card, and cream trust card `"Satu akun, banyak kesempatan — Belanja atau titip jual. Kami pasarkan gear-mu lewat Instagram, Facebook, dan TikTok."`
  - Right auth form: Title `"Masuk atau daftar"`, subtitle `"Mulai dengan nomor HP, email, atau akun Google."`, pill toggle (`Nomor HP` active `#FFFBEB` with `#F59E0B` border | `Email`), phone input `+62 812 3456 7890` with helper `"Kode OTP akan dikirim melalui WhatsApp."`, primary yellow CTA `"Kirim OTP ke nomor HP"` (navigates to `/auth/verify-otp`), divider `"atau gunakan email"`, email input `nama@email.com` + white button `"Kirim OTP ke email"`, Google button `"G Lanjutkan dengan Google"`, and cream info box `"Baru di Hingo? Tidak perlu daftar terpisah. Nomor atau email baru otomatis membuat akun setelah OTP berhasil. Kamu lalu diminta memverifikasi identitas."`

### SCREEN 3: Verifikasi Nomor HP (`/auth/verify-otp`)
- Same left editorial panel on Desktop.
- Right OTP card: Title `"Verifikasi nomor HP"`, subtitle `"Masukkan 6 digit kode yang kami kirim melalui WhatsApp."`, phone pill `+62 812 3456 7890` with `Ubah` link, 6-box OTP input (`4`, `8`, `2`, `1`, empty active box, empty box), primary yellow button `"Verifikasi & lanjutkan"` (links to `/auth/verify-identity`), countdown `"Belum menerima kode? Kirim ulang dalam 00:42 · Kode berlaku selama 5 menit"`, security note, and routing card `"Setelah verifikasi: Akun lama → kembali ke belanja. Akun baru → lengkapi profil & verifikasi identitas."`

### SCREEN 4: Verifikasi Identitas / KYC (`/auth/verify-identity`)
- Header: Eyebrow `AKUN BARU / VERIFIKASI IDENTITAS`, H1 `"Kenalan dulu, biar lebih aman."`, 3-step pills (`✓ Dokumen KTP`, `✓ Selfie wajah`, `3 Peninjauan` active).
- Cream status banner: `"Identitas sedang ditinjau — Dokumen Naya sudah diterima, tetapi akun belum terverifikasi. Peninjauan biasanya selesai maksimal 1 × 24 jam. Kami akan mengirim pembaruan lewat WhatsApp."`
- Main Card (`Data sesuai identitas`):
  - Read-only / editable inputs: `Nama lengkap sesuai KTP` (`Naya Putri`), `NIK (disamarkan demi privasi)` (`•••• •••• •••• 0842`).
  - Upload section 1 (`1. Foto dokumen KTP`): File card `ktp_naya.jpg · 1,8 MB` with green badge `✓ Berhasil diunggah` (`22 Okt 2026 · 09.48 WIB`) and interactive file re-upload dropzone.
  - Upload section 2 (`2. Selfie wajah`): File card `selfie_naya.jpg · 2,1 MB` with green badge `✓ Berhasil diunggah`.
- Right Sidebar:
  - `Status akun Naya` card: Badge `Menunggu peninjauan`, checklist (`Nomor HP sudah terverifikasi`, `Identitas belum terverifikasi`), yellow CTA `"Kembali jelajahi barang"` (`/catalog`) + outline CTA `"Hubungi CS"` (`/chat/support`).
  - `Data pribadimu tetap privat` card explaining encryption.

### SCREEN 5: Katalog dan Pencarian (`/catalog`)
- Top Banner (`#FFFBEB`): Eyebrow `KURASI HINGO / PRELOVED PILIHAN`, H1 `"Upgrade gear, bukan anggaran."`, right card `"Ditangani tim kami"`.
- Category Filter Pills: `Semua gear` (active yellow), `Keyboard`, `Mouse`, `Headset`, `Monitor`, `Aksesoris`.
- **2-Column Layout (Desktop) / Filter Drawer + 2-Col Grid (Mobile)**:
  - Left Filter Sidebar (`Filter` + `Reset` link):
    - `Kategori` radio list (`Semua peripheral`, `Keyboard`, `Mouse`, `Headset`, `Monitor`)
    - `Kondisi barang` selectable pills (`Sangat baik`, `Baik`)
    - `Harga minimum` (`Rp0`) & `Harga maksimum` (`Rp2.000.000`) inputs
    - `Asal pengiriman` (`Jakarta Selatan`)
  - Right Product Grid:
    - Header `"Peripheral preloved"` + `"6 barang ditemukan di Jakarta Selatan"` + Sort dropdown `"Urutkan: Terbaru ↓"` + Removable active filter chips (`Kondisi: Baik+ ×`, `≤ Rp2 juta ×`, `Jakarta Selatan ×`).
    - 6 Product Cards with real peripheral photos:
      1. `Keychron K2 V2` — Sangat baik · 1 barang — `Rp850.000` (links to `/product/keychron-k2-v2`)
      2. `Logitech MX Master 3` — Baik · 1 barang — `Rp650.000`
      3. `Sony WH-1000XM4` — Sangat baik · 1 barang — `Rp1.850.000`
      4. `Dell P2419H 24 inci` — Baik · 1 barang — `Rp1.250.000`
      5. `Logitech G304` — Sangat baik · 1 barang — `Rp275.000`
      6. `Akko 3068B Plus` — Baik · 1 barang — `Rp720.000`

### SCREEN 6: Detail Produk (`/product/[slug]`)
- Breadcrumb: `Jelajah / Keyboard / Keychron K2 V2`.
- **Left Column**:
  - Interactive photo gallery: Main preview image + 3 clickable thumbnails (`Foto barang titipan · 3 foto · Geser untuk melihat detail`).
  - `Tentang barang ini` card: Key-value table (`Kondisi: Sangat baik`, `Pemakaian: 8 bulan`, `Switch: Gateron Brown`, `Kelengkapan: Box, kabel, keycap puller`), detailed inspection paragraph (`"Keyboard pribadi, bukan bekas warnet. Semua tombol, Bluetooth, dan lampu RGB berfungsi normal. Ada gores halus di sisi bawah, tidak terlihat saat dipakai."`), metadata `"Diunggah 22 Oktober 2026 · Kode barang K2-0842"`.
- **Right Column**:
  - Pills: `Sangat baik` (`#FFFBEB`) + `Stok 1 barang`.
  - Title: `Keychron K2 V2`, subtitle `Wireless mechanical keyboard · Brown switch`.
  - Price: `Rp850.000` + comparison `"Harga baru sekitar Rp1.499.000 · Hemat 43%"`.
  - Shipping info: `Dikirim dari Jakarta Selatan` → `Ke Tebet, Jakarta Selatan Rp18.000` (`JNE REG · Estimasi tiba 24–25 Okt 2026`).
  - Cream trust box: `Dicek dan dikirim tim kami`.
  - Action buttons: Outline button `"Chat admin"` (`/chat/product`) + Primary yellow button `"Tambah keranjang"` (adds item and navigates to `/cart`). On Mobile, render a sticky bottom bar with `Harga barang Rp850.000` + `Chat` + `Tambah keranjang`.
  - `Dikelola tim Hingo` card: Avatar `H`, `Admin Hingo · Tim pengelola · Aktif 5 menit lalu`, outline button `Chat admin`.
- Bottom full-width cream banner: `Gunakan pembayaran resmi`.

### SCREEN 7: Keranjang (`/cart`)
- Header: Eyebrow `BELANJA / KERANJANG`, H1 `"Keranjangmu"`, subtitle `"Satu temuan bagus, siap jadi milikmu."`
- **Left Column**:
  - Select-all bar: Checkbox `Pilih semua (1 barang)` + `Hapus`.
  - Cart Item Card: Checkbox, badge `✓ Dikelola Hingo · Jakarta Selatan`, thumbnail, title `Keychron K2 V2`, variant `Sangat baik · Brown switch`, price `Rp850.000`, stock label `Jumlah 1 · Stok hanya 1`, quantity stepper (`- 1 +` disabled at 1 because preloved stock is 1) + `Hapus barang`, and cream notice `"Barang preloved hanya tersedia 1. Selesaikan checkout sebelum dibeli orang lain."`
  - Trust banner `Dicek dan dikirim tim kami` + link `← Lanjut jelajahi barang`.
- **Right Sidebar (`Ringkasan pembayaran`)**:
  - Breakdown: `Harga barang Rp850.000`, `Ongkir JNE REG Rp18.000`, `Perlindungan pengiriman Rp5.000`, `Biaya layanan Rp2.500`, `Total pembayaran Rp875.500`.
  - Primary yellow button `"Lanjut checkout (1)"` (navigates to `/checkout`).

### SCREEN 8: Checkout dan Pembayaran (`/checkout`)
- Stepper header: `KERANJANG → CHECKOUT → PEMBAYARAN`, H1 `"Checkout aman"`.
- **Left Column**:
  - `Alamat pengiriman` card: Badge `Rumah · Utama`, `Naya Putri · 0812 3456 7890`, address in Tebet, `Ubah` button.
  - `Barang pesanan` card: `Keychron K2 V2` (`Rp850.000 · 1 barang · Berat 1 kg`) + input `Catatan untuk tim (opsional)` prefilled with `"Mohon bubble wrap tambahan, ya."`
  - `Pengiriman` card: Selectable radio cards (`JNE REG Rp18.000 · Estimasi tiba 24–25 Okt 2026` selected with `#FFC629` border vs `J&T Reguler Rp22.000`) + checked toggle `Perlindungan pengiriman Rp5.000`.
  - `Metode pembayaran` card: Selectable radio cards (`BCA Virtual Account · Verifikasi otomatis · Bayar sebelum 24 jam` selected vs `QRIS · Scan dengan aplikasi pembayaran pilihanmu`) + cream warning `"Bayar hanya melalui Hingo"`.
- **Right Sidebar**:
  - `Ringkasan pembayaran` (`Total pembayaran Rp875.500`) + Primary yellow button `"Bayar Rp875.500"` (creates/opens order `/orders/GRL-20261022-0842`).
  - `Dicek dan dikirim tim kami` card + `Alur pesanan` (1. Bayar pesanan melalui Hingo, 2. Tim kami kemas dan kirim barang, 3. Cek barang, konfirmasi penerimaan).

### SCREEN 9: Detail Transaksi dan Status Pesanan (`/orders/[id]`)
- Header: Eyebrow `TRANSAKSI / DETAIL PESANAN`, H1 `"Barang tiba. Cek dulu, ya."`, subtitle `"GRL-20261022-0842 · Dibuat 22 Oktober 2026"`.
- Cream Escrow Banner: `"Dana masih ditahan Hingo — Rp875.500 sudah dibayar. Dana pemilik barang belum dicairkan. Periksa barang sebelum konfirmasi; laporkan jika ada kendala."`
- **Left Column**:
  - `Periksa sebelum konfirmasi` card: Badge `Menunggu konfirmasi pembeli`, deadline box `"Batas pemeriksaan: 26 Okt 2026, 14.00 WIB"`, interactive primary yellow button `"Barang sesuai, konfirmasi terima"` (updates order state to completed) and outline button `"Ada kendala? Laporkan masalah"` (links to `/chat/support`).
  - `Perjalanan transaksi` vertical timeline:
    1. `Pembayaran diterima` (`22 Okt 2026 · 10.32 WIB` — Rp875.500 via BCA VA) — Completed
    2. `Barang dikirim tim Hingo` (`23 Okt 2026 · 09.15 WIB` — JNE REG · Resi JNE2201040842) — Completed
    3. `Paket tiba — waktunya cek barang` (`24 Okt 2026 · 13.56 WIB` — Diterima Naya. Dana masih ditahan) — Active Yellow Dot
    4. `Konfirmasi & pencairan dana` (`Menunggu konfirmasi pembeli`) — Upcoming
  - `Detail barang` card (`Keychron K2 V2`) with `Chat admin Hingo` button.
  - `Pengiriman & alamat` card (`JNE REG · JNE2201040842`) with `Lacak pengiriman` modal/button.
- **Right Sidebar**:
  - `Status pembayaran` card: Green pill `Dana terlindungi`, `Rp875.500`, `Pembayaran: Lunas`, `Hasil titip jual: Belum diteruskan`, `Metode: BCA VA`.
  - `Ringkasan pembayaran` card (`Rp875.500`) + `Barang bermasalah? Kami bantu.` card (`Chat CS Hingo` → `/chat/support`) + `Lihat bukti pembayaran`.

### SCREEN 10: Chat Admin Produk (`/chat/product`)
- Header: H1 `"Tanya admin Hingo"`, subtitle `"Tanya kondisi, hasil pengecekan, dan pengiriman barang titipan ke tim Hingo."`
- **3-Column Messaging Layout (Desktop) / Full-Screen Chat (Mobile)**:
  - Left Sidebar (`Pesan`): Search input `"Nama atau barang"`, 3 thread items:
    1. `Admin Hingo` (Active `#FFFBEB` card: `"Siap, checkout di Hingo ya."` · `Keychron K2 V2` · `10.14`)
    2. `CS Hingo · Resmi` (`"Kami siap bantu cek barangmu."` · `14.08` → links to `/chat/support`)
    3. `Info Hingo` (`"Tips aman belanja preloved"` · `Kemarin`)
  - Center Chat Panel:
    - Top bar: `Admin Hingo · Tim Hingo · Aktif 5 menit lalu` + product pill `Keychron K2 V2 · Rp850.000 · Sangat baik`.
    - Cream banner: `"Jaga transaksi tetap di Hingo — Tanya barang titipan ke admin. Bayar hanya melalui kanal resmi Hingo."`
    - Chat messages (`22 Oktober 2026`):
      - User (`10.10 · ✓✓`): `"Halo Kak, Keychron K2-nya masih ada? Semua tombol dan Bluetooth normal?"`
      - Admin (`10.11`): `"Halo Naya, tersedia di kami. Tombol dan Bluetooth sudah dicek. Ada gores halus di sisi bawah."`
      - User (`10.12 · ✓✓`): `"Box dan kabel ikut? Bisa dikirim ke Tebet pakai JNE REG?"`
      - Admin (`10.14`): `"Lengkap: box, kabel, keycap puller. Tim kami kirim ke Tebet, ongkir Rp18.000. Checkout di Hingo ya."`
    - Quick-reply chips (`Terima kasih, Kak`, `Boleh foto detailnya?`) + working message input with `Kirim` button that appends messages live.
  - Right Product Context Sidebar: Card showing `Keychron K2 V2` (`Rp850.000`, `Sangat baik`, `✓ Dicek dan dikelola tim Hingo`), buttons `Lihat barang` (`/product/keychron-k2-v2`) & `Tambah keranjang` (`/cart`), plus `Chat CS Hingo` card.

### SCREEN 11: Chat Admin dan CS (`/chat/support`)
- Header: H1 `"Pusat bantuan Hingo"`, subtitle `"Dukungan resmi untuk pembayaran, pengiriman, dan kendala barang."`
- **3-Column Layout**:
  - Left Sidebar: Thread `CS Hingo · Resmi` selected (`GRL-20261022-0842`).
  - Center Chat Panel:
    - Header: `CS Hingo · Resmi — Mira · Tim bantuan · Online` + badge `Tiket CS-0842 · Percakapan aktif`.
    - Cream order alert: `"Pembayaran ditangani Hingo — Transaksi GRL-20261022-0842 · Rp875.500. Jangan konfirmasi penerimaan jika barang bermasalah."`
    - Messages (`24 Oktober 2026`):
      - User (`14.05 · ✓✓`): `"Halo, paket Keychron K2 V2 sudah tiba. Apa yang harus saya cek sebelum konfirmasi?"`
      - CS Mira (`14.06`): `"Halo Naya, saya Mira dari CS Hingo. Cek kondisi fisik, semua tombol, Bluetooth, serta kelengkapan box dan kabel. Rekam video saat membuka paket ya."`
      - User (`14.07 · ✓✓`): `"Kalau ternyata ada tombol yang tidak berfungsi, dananya bagaimana?"`
      - CS Mira (`14.08`): `"Danamu tetap ditahan. Pilih “Laporkan masalah” sebelum 26 Okt, 14.00 WIB. Sertakan foto/video; tim Hingo akan menangani kendalamu."`
    - Action chips: `Lihat transaksi` (`/orders/GRL-20261022-0842`) & `Laporkan masalah`, security notice, and live chat input.
  - Right Context Sidebar: `Transaksi terkait` card (`GRL-20261022-0842`, `Keychron K2 V2`, badge `Barang tiba`, `Detail transaksi`), `Kami siap membantu` card (`Jam layanan: 08.00–22.00 WIB`, `Waktu respons biasanya 2–5 menit`).

### SCREEN 12: Pengajuan Titip Jual (`/seller/consignments/new`)
- Seller Sub-Header + Eyebrow `RUANG PENJUAL / PENGAJUAN BARU`, H1 `"Gear menganggur? Titip jual aja."`
- 4-Step Pills: `1 Pengecekan online` (active yellow), `2 Pengiriman ke Hingo`, `3 Cek kondisi fisik`, `4 Hasil akhir`.
- Cream instruction banner: `"Tahap saat ini: Pengecekan online — Jangan kirim barang sebelum ada konfirmasi dari Hingo."`
- **Left Column (5-Part Interactive Form with Draft & Submit Actions)**:
  - `01 · Tentang barangmu`: Kategori (`Keyboard`), Nama/merek/model (`Keychron V1`), Varian/spesifikasi (`75% · K Pro Brown · USB-C`), Lama pemakaian (`10 bulan`), Spesifikasi tambahan (`Warna carbon black, hot-swap, RGB, layout ANSI...`).
  - `02 · Kondisi & kelengkapan`: Kondisi saat ini (`Bekas · berfungsi normal`), Kondisi aktual & cacat, Kelengkapan yang ikut dititipkan.
  - `03 · Foto barang asli`: 3 photo preview cards (`Tampak depan`, `Casing bawah · gores`, `Kelengkapan`) + button `+ Tambah / ganti foto`.
  - `04 · Harga yang kamu harapkan`: Input `Rp850.000`.
  - `05 · Kontak & penyerahan`: `Naya Putri`, `0812 3456 7890`, `naya.putri@example.com`, `Bandung`, radio cards (`Kirim setelah lolos pengecekan online` selected vs `Antar langsung sesuai arahan admin`).
  - `Persetujuan pemilik`: 3 checked consent boxes + outline button `"Simpan draf"` + primary yellow button `"Kirim untuk review"` (creates consignment record and redirects to `/seller/consignments`).
- **Right Sidebar**: `Setelah kamu mengajukan` (4 stages explanation) + `Belum cocok? Tetap jelas.` card with `Tanya admin Hingo` button.

### SCREEN 13: Barang Titipan Saya — Seller Dashboard (`/seller/consignments`)
- Header: Eyebrow `RUANG PENJUAL / DASHBOARD`, H1 `"Barang titipan saya"`, subtitle `"Halo, Naya! Pantau gear kamu, dari pengajuan sampai hasil penjualan."`, right yellow CTA `"+ Ajukan titip jual"` (`/seller/consignments/new`).
- **4 KPI Summary Cards**:
  1. `9` — `Total barang` (Seluruh pengajuan)
  2. `4` — `Perlu tindakan` (Persetujuan, kirim, revisi, retur) — Highlighted `#FFFBEB` background with `#FFC629` border
  3. `1` — `Dipasarkan` (Ditangani tim Hingo)
  4. `1` — `Selesai` (Pencairan sudah diterima)
- Cream Alert Banner: `"4 barang butuh tindakanmu — Tinjau hasil inspeksi MX Master 3S, kirim Akko setelah membaca instruksi, lengkapi foto Keychron C1, dan bahas pengembalian AOC."`
- **Main List + Right Financial Sidebar**:
  - Search input `"Cari nama barang atau ID…"` + Interactive Filter Pills (`Semua · 9`, `Perlu tindakan · 4`, `Diproses · 2`, `Dipasarkan · 1`, `Ke pembeli · 1`, `Selesai · 1`).
  - **All 9 Seeded Consignment Cards** (clicking a card opens `/seller/consignments/[code]`):
    1. `Logitech MX Master 3S` (`HG-261018-031`) — Badge `Tinjau hasil inspeksi` (yellow) — Usulan harga Rp950.000 — Link `Tinjau hasil inspeksi →`
    2. `Akko 5075B Plus` (`HG-261019-032`) — Badge `Siap dikirim ke Hingo` (yellow) — Lolos pengecekan online — Link `Lihat instruksi kirim →`
    3. `HyperX Cloud II` (`HG-261019-033`) — Badge `Dalam kiriman ke Hingo` — JNE REG · HGO261021033 — Link `Lacak ke Hingo →`
    4. `Razer Orochi V2` (`HG-261015-034`) — Badge `Sedang dipasarkan` — Harga disepakati Rp550.000 — Link `Lihat pemasaran →`
    5. `Dell P2422H` (`HG-261010-035`) — Badge `Dikirim ke pembeli` — Estimasi hasil bersih Rp1.450.000 — Link `Lacak ke pembeli →`
    6. `SteelSeries Apex 3` (`HG-261002-036`) — Badge `Pencairan diterima` — Sudah diterima Rp450.000 — Link `Lihat bukti pencairan →`
    7. `Keychron C1` (`HG-261020-037`) — Badge `Perlu revisi` (yellow) — Foto port USB belum jelas — Link `Perbaiki pengajuan →`
    8. `Logitech G435` (`HG-261021-038`) — Badge `Menunggu review` — Tahap: Pengecekan online — Link `Lihat pengajuan →`
    9. `AOC 24G2` (`HG-261012-039`) — Badge `Pengembalian dibahas` (yellow) — Panel bergaris — Link `Bahas pengembalian →`
  - **Right Sidebar**:
    - `Ringkasan hasil titip jual`: `Estimasi belum dibayarkan: Rp1.450.000` (Dari Dell P2422H), `Pencairan sudah diterima: Rp450.000` (green `#16A34A`, SteelSeries Apex 3), button `Lihat riwayat pencairan`.
    - `Dua pengiriman, beda tujuan` (`Pemilik → Hingo` vs `Hingo → pembeli`).
    - `Admin Hingo siap membantu` (`Chat admin Hingo`).

### SCREEN 14: Detail Barang Titipan (`/seller/consignments/[code]`)
- Breadcrumb: `BARANG TITIPAN SAYA / HG-261018-031`, H1 `"Inspeksi selesai. Tunggu rincian admin."`, subtitle `"Logitech MX Master 3S · Inspeksi fisik selesai 22 Okt 2026, 10.30 WIB · Menunggu rincian admin"`.
- Cream status box: `"Inspeksi fisik selesai, hasil akhir belum dicatat"` with 4 status pills (`✓ Inspeksi fisik selesai`, `Belum ada rincian biaya`, `Belum ada hasil bersih`, `Belum ada ketentuan lengkap`).
- **Left Column**:
  - Item card: `Logitech MX Master 3S` (`HG-261018-031 · Mouse · Graphite · Pemilik: Naya Putri`) + 3 inspection photos (`Gores sandaran ibu jari`, `Kelengkapan diterima`).
  - `Laporan inspeksi Hingo`: Pills (`✓ Fungsi normal`, `Ada cacat kosmetik`), 4 detail rows (`Spesifikasi`, `Uji fungsi`, `Kondisi & cacat`, `Kelengkapan diterima`).
  - `Pengiriman pemilik → Hingo`: Badge `Sudah diterima Hingo`, `JNE REG · HGO261020031`, `Dikirim dari Bandung oleh Naya · 20 Okt 2026`, `Diterima tim Hingo · 21 Okt 2026`, button `Lihat pelacakan & bukti terima`.
  - `Perjalanan titipan` (9-step vertical timeline from `Pengajuan dikirim` to `Pencairan hasil titip jual`).
  - `Ingin revisi atau tidak lanjut?` card with `Ajukan pembatalan` button.
- **Right Sidebar**:
  - `4 tahap pengajuan` card (`Pengecekan online` ✓, `Pengiriman ke Hingo` ✓, `Cek fisik & tanya jawab` active, `Hasil` pending).
  - `Tinjau harga & kondisi` card: Badge `Menunggu rincian admin`, `Usulan harga jual setelah inspeksi: Rp950.000` (`Harapan awalmu Rp1.000.000`), `Biaya titip jual: Menunggu konfirmasi admin`, `Estimasi hasil bersih: Belum dapat dihitung`, disabled button `Setujui harga & kondisi`, primary yellow button `"Minta rincian biaya & hasil bersih"` (triggers admin fee breakdown calculation/simulation or opens chat), outline button `"Tanya hasil pemeriksaan"`.
  - `Hasil pengajuan` card (`Disetujui`, `Ditolak`, `Dibatalkan penjual`), `Rencana pemasaran` (`Instagram`, `Facebook`, `TikTok`), `Pengiriman Hingo → pembeli`, `Penjualan & pencairan`.

---

# 6. EXECUTION & VERIFICATION STEPS FOR ANTIGRAVITY AGENT
1. Initialize the Next.js 15 + TypeScript + Tailwind CSS project and configure `prisma/schema.prisma`.
2. Run migration and execute `prisma/seed.ts` so all 9 consignment items (`HG-261018-031` to `HG-261012-039`), all catalog products (`Keychron K2 V2`, `Logitech MX Master 3S`, etc.), active order `GRL-20261022-0842`, and chat threads (`Admin Hingo` and `CS-0842`) are pre-populated.
3. Build shared layout components (Navbar, Sub-header, Mobile Bottom Navigation Bar, Footer, ProductCard, StatusBadge).
4. Implement all 14 routes with full interactive states (search & category/price/condition filtering, cart add/remove, checkout courier & payment selection, order confirmation, live message sending in chat, and consignment form submission).
5. Start the dev server, inspect both Desktop (`1440px`) and Mobile (`390px`) viewports in the Antigravity browser preview, and verify zero TypeScript or runtime errors.
```

---

## 5. Prompt Alternatif (Stack Laravel 11 + MySQL + Tailwind CSS)

Jika kamu lebih memilih menggunakan **PHP / Laravel 11 + MySQL** (misalnya dengan Laragon atau XAMPP), gunakan prompt pembuka ini:

```markdown
# ROLE & TECH STACK (LARAVEL 11 + MYSQL EDITION)
Act as a Senior Full-Stack Laravel Developer inside Google Antigravity. Use the connected **Figma MCP** tool to read file `xKNQ51VDVCSdk8qF8bUelM` (nodes `0:1` and `14:13159`) and build the **"Hingo"** ("Titip jual gear, kami yang urus") managed peripheral consignment web application using:
- **Backend Framework**: Laravel 11 (PHP 8.3+) with Eloquent ORM, Database Migrations, and Seeders.
- **Database**: MySQL 8.0 (`hingo_db`).
- **Frontend**: Blade Templates + Livewire 3 (for reactive catalog filtering, cart updates, consignment form steps, and live chat) + Tailwind CSS + Alpine.js.
- **Design System & Pages**: Implement all 14 Desktop (1440px) and Mobile (390px) screens from the Hingo specification (`Home`, `Masuk atau daftar`, `Verifikasi nomor HP`, `Verifikasi identitas`, `Katalog dan pencarian`, `Detail produk`, `Keranjang`, `Checkout dan pembayaran`, `Detail transaksi`, `Chat admin produk`, `Chat admin dan CS`, `Pengajuan titip jual`, `Barang titipan saya`, and `Detail barang titipan`) with exact `#FFC629` primary yellow, `#FFFBEB` cream surface, and `#1A1A1A` dark theme tokens, complete with `DatabaseSeeder` pre-populating Naya Putri's account, all 9 consignment items (`HG-261018-031` to `HG-261012-039`), order `GRL-20261022-0842`, and chat threads.
```