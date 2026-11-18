-- ==============================================================================
-- MIGRATION: 20261118_prd_schema.sql
-- Hingo PRD Schema Migration (16 Kelompok Data Bagian 8.1 PRD)
-- Branch: feat/prd-mvp
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABEL PENGATURAN (SETTINGS) & SEED DATA BISNIS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed pengaturan bisnis sesuai PRD 4.3, 6.1, 6.2, 6.4, 6.5
INSERT INTO public.settings (key, value, description) VALUES
  ('fee_flat_under_threshold', '10000'::jsonb, 'Fee tetap untuk harga jual sampai Rp200.000'),
  ('fee_percent_above_threshold', '0.05'::jsonb, 'Fee persentase (5%) untuk harga jual di atas Rp200.000'),
  ('fee_threshold', '200000'::jsonb, 'Ambang batas perhitungan fee flat vs persen (Rp200.000)'),
  ('dummy_shipping_cost', '18000'::jsonb, 'Biaya ongkir dummy tetap (Rp18.000)'),
  ('insurance_threshold', '500000'::jsonb, 'Ambang batas asuransi wajib untuk barang di atas Rp500.000'),
  ('dummy_insurance_cost', '5000'::jsonb, 'Biaya asuransi dummy tetap (Rp5.000)'),
  ('early_withdrawal_fee', '25000'::jsonb, 'Biaya penarikan barang sebelum masa habis (Rp25.000)'),
  ('order_hold_hours', '24'::jsonb, 'Batas penahanan pesanan menunggu pembayaran (24 jam)'),
  ('proposal_schedule_high', '{"days": [21, 36, 50], "discount_percent": 0.05}'::jsonb, 'Jadwal usulan harga barang >= 200rb (hari 21, 36, 50 diskon 5% harga awal)'),
  ('proposal_schedule_low', '{"days": [30], "discount_percent": 0.10}'::jsonb, 'Jadwal usulan harga barang < 200rb (hari 30 diskon 10% harga awal)'),
  ('proposal_response_days', '3'::jsonb, 'Batas respons usulan penurunan harga (3 hari)'),
  ('consignment_period_days', '60'::jsonb, 'Masa penitipan barang (60 hari sejak pertama Tayang)'),
  ('extension_period_days', '30'::jsonb, 'Masa perpanjangan penitipan (30 hari, maksimal 1x)'),
  ('end_of_term_decision_hours', '72'::jsonb, 'Batas keputusan consignor setelah masa habis (3x24 jam)'),
  ('tracking_input_deadline_hours', '48'::jsonb, 'Batas consignor mengisi nomor resi pengiriman ke Hingo (2x24 jam)'),
  ('return_shipping_payment_deadline_hours', '24'::jsonb, 'Batas consignor membayar ongkir kembali (1x24 jam)'),
  ('warranty_period_days', '7'::jsonb, 'Masa garansi pembeli sejak barang diterima (7 hari)'),
  ('schedule_speed_factor', '1'::jsonb, 'Faktor percepatan jadwal demo (1 = normal; 1440 = 1 hari jadi 1 menit)'),
  ('admin_whatsapp', '"081234567890"'::jsonb, 'Nomor WhatsApp admin untuk kontak darurat manual / link wa.me'),
  ('warehouse_address', '"Gudang Hingo, Jl. Tebet Raya No. 42, Jakarta Selatan 12810"'::jsonb, 'Alamat gudang Hingo untuk pengiriman barang'),
  ('rejection_reasons', '["barang tidak berfungsi", "kondisi tidak sesuai pengajuan", "bukti kepemilikan tidak memenuhi syarat", "rusak dalam pengiriman", "kategori tidak diterima", "tidak dikirim tepat waktu", "lainnya (catatan wajib)"]'::jsonb, 'Daftar alasan penolakan baku')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. TABEL TRANSISI STATUS (STATUS_TRANSITIONS) DARI TABEL 4.2 PRD
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.status_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('CONSIGNOR', 'BUYER', 'ADMIN', 'SYSTEM')),
  trigger_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_status, to_status, actor_role)
);

-- Seed seluruh transisi resmi dari Tabel 4.2 PRD
INSERT INTO public.status_transitions (from_status, to_status, actor_role, trigger_description) VALUES
  ('Diajukan', 'Ditolak saat screening', 'ADMIN', 'Data atau foto tidak memenuhi syarat'),
  ('Diajukan', 'Disetujui, menunggu kiriman', 'ADMIN', 'Screening lolos'),
  ('Disetujui, menunggu kiriman', 'Dalam perjalanan ke Hingo', 'CONSIGNOR', 'Consignor mengisi resi'),
  ('Disetujui, menunggu kiriman', 'Ditolak saat screening', 'SYSTEM', 'Resi belum diisi dalam 2x24 jam'),
  ('Dalam perjalanan ke Hingo', 'Diterima, sedang diuji', 'ADMIN', 'Paket tiba dan dibuka'),
  ('Diterima, sedang diuji', 'Tayang', 'ADMIN', 'Lolos uji, harga tayang ditetapkan'),
  ('Diterima, sedang diuji', 'Ditolak setelah pengecekan', 'ADMIN', 'Gagal uji, tidak sesuai pengajuan, atau rusak dalam pengiriman'),
  ('Diterima, sedang diuji', 'Tayang', 'ADMIN', 'Hasil uji lebih buruk dari klaim consignor, dan consignor menyetujui harga yang disesuaikan'),
  ('Diterima, sedang diuji', 'Menunggu ongkir kembali', 'ADMIN', 'Hasil uji lebih buruk dari klaim consignor, dan consignor memilih ambil kembali'),
  ('Ditolak setelah pengecekan', 'Menunggu ongkir kembali', 'ADMIN', 'Alasan penolakan dicatat'),
  ('Menunggu ongkir kembali', 'Dikembalikan ke consignor', 'ADMIN', 'Consignor sudah membayar ongkir kembali (dan biaya penarikan bila ditarik), buktinya diverifikasi admin, lalu barang dikirim balik'),
  ('Tayang', 'Ditahan menunggu pembayaran', 'SYSTEM', 'Pembeli menyelesaikan checkout'),
  ('Ditahan menunggu pembayaran', 'Tayang', 'SYSTEM', '24 jam lewat tanpa bukti transfer'),
  ('Ditahan menunggu pembayaran', 'Dibayar, dikemas', 'ADMIN', 'Bukti transfer terverifikasi'),
  ('Dibayar, dikemas', 'Dikirim ke pembeli', 'ADMIN', 'Resi diisi'),
  ('Dikirim ke pembeli', 'Diterima pembeli', 'ADMIN', 'Tanggal terima diisi dari resi atau konfirmasi pembeli'),
  ('Diterima pembeli', 'Klaim diproses', 'BUYER', 'Pembeli mengajukan klaim dalam masa garansi 7 hari'),
  ('Klaim diproses', 'Klaim: cacat tersembunyi', 'ADMIN', 'Klaim valid, cacat tidak mungkin terdeteksi saat uji'),
  ('Klaim diproses', 'Klaim: kesalahan Hingo', 'ADMIN', 'Klaim valid, cacat seharusnya terdeteksi atau laporan uji tidak sesuai'),
  ('Klaim diproses', 'Klaim: kesalahan pengiriman', 'ADMIN', 'Klaim valid, barang rusak dalam perjalanan ke pembeli'),
  ('Klaim diproses', 'Diterima pembeli', 'ADMIN', 'Klaim tidak valid, masa garansi tetap berjalan'),
  ('Klaim: cacat tersembunyi', 'Menunggu ongkir kembali', 'ADMIN', 'Barang kembali ke Hingo, consignor tidak dibayar'),
  ('Klaim: kesalahan Hingo', 'Tayang', 'ADMIN', 'Refund selesai, barang diuji ulang dan ditayangkan lagi'),
  ('Diterima pembeli', 'Siap dibayar ke consignor', 'SYSTEM', 'Dana masuk dan masa garansi 7 hari lewat tanpa klaim'),
  ('Siap dibayar ke consignor', 'Consignor sudah dibayar', 'ADMIN', 'Transfer ke consignor dilakukan dan buktinya dicatat'),
  ('Tayang', 'Masa penitipan habis', 'SYSTEM', 'Hari ke-60 sejak pertama tayang'),
  ('Masa penitipan habis', 'Tayang', 'CONSIGNOR', 'Consignor memilih perpanjang, dengan harga baru yang disepakati dengan admin'),
  ('Masa penitipan habis', 'Menunggu ongkir kembali', 'CONSIGNOR', 'Consignor memilih ambil kembali'),
  ('Masa penitipan habis', 'Menunggu ongkir kembali', 'SYSTEM', 'Sistem menetapkannya bila tidak ada respons dalam 3x24 jam'),
  ('Tayang', 'Menunggu ongkir kembali', 'ADMIN', 'Consignor menarik barang sebelum masa habis dan dikenai biaya penarikan Rp25.000 (admin memproses pengajuan)')
ON CONFLICT (from_status, to_status, actor_role) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. TABEL PENGGUNA (USERS) - SKEMA PRD 8.1
-- ------------------------------------------------------------------------------
-- Perbarui tabel users jika sudah ada, atau buat baru
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Pengguna Hingo',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Rekening consignor
  bank_name TEXT DEFAULT '',
  bank_account_number TEXT DEFAULT '',
  bank_account_holder TEXT DEFAULT '',
  
  -- Alamat pembeli
  buyer_recipient_name TEXT DEFAULT '',
  buyer_phone TEXT DEFAULT '',
  buyer_full_address TEXT DEFAULT '',
  buyer_city TEXT DEFAULT '',
  buyer_postal_code TEXT DEFAULT '',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pastikan kolom baru ada jika tabel users lama sudah dibuat
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
    ALTER TABLE public.users ADD COLUMN password_hash TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='whatsapp') THEN
    ALTER TABLE public.users ADD COLUMN whatsapp TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_active') THEN
    ALTER TABLE public.users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bank_name') THEN
    ALTER TABLE public.users ADD COLUMN bank_name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bank_account_number') THEN
    ALTER TABLE public.users ADD COLUMN bank_account_number TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bank_account_holder') THEN
    ALTER TABLE public.users ADD COLUMN bank_account_holder TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='buyer_recipient_name') THEN
    ALTER TABLE public.users ADD COLUMN buyer_recipient_name TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='buyer_phone') THEN
    ALTER TABLE public.users ADD COLUMN buyer_phone TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='buyer_full_address') THEN
    ALTER TABLE public.users ADD COLUMN buyer_full_address TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='buyer_city') THEN
    ALTER TABLE public.users ADD COLUMN buyer_city TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='buyer_postal_code') THEN
    ALTER TABLE public.users ADD COLUMN buyer_postal_code TEXT DEFAULT '';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. TABEL BARANG (ITEMS) - 20 STATUS ATOMIK PRD
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT UNIQUE NOT NULL,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  category TEXT NOT NULL CHECK (category IN ('RAM', 'SSD', 'GPU')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  condition TEXT NOT NULL,
  usage_duration TEXT NOT NULL,
  completeness TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  declaration_own_item BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Harga
  expected_price BIGINT NOT NULL,
  min_price BIGINT NOT NULL,
  initial_listing_price BIGINT,
  current_listing_price BIGINT,
  
  -- Status (20 status persis tabel 4.1 PRD)
  status TEXT NOT NULL DEFAULT 'Diajukan' CHECK (status IN (
    'Diajukan',
    'Ditolak saat screening',
    'Disetujui, menunggu kiriman',
    'Dalam perjalanan ke Hingo',
    'Diterima, sedang diuji',
    'Ditolak setelah pengecekan',
    'Menunggu ongkir kembali',
    'Dikembalikan ke consignor',
    'Tayang',
    'Ditahan menunggu pembayaran',
    'Dibayar, dikemas',
    'Dikirim ke pembeli',
    'Diterima pembeli',
    'Klaim diproses',
    'Klaim: cacat tersembunyi',
    'Klaim: kesalahan Hingo',
    'Siap dibayar ke consignor',
    'Consignor sudah dibayar',
    'Masa penitipan habis',
    'Klaim: kesalahan pengiriman'
  )),
  
  -- Catatan screening & penolakan
  admin_market_price_reference TEXT,
  rejection_reason TEXT,
  rejection_notes TEXT,
  
  -- Resi kirim ke Hingo
  inbound_courier TEXT,
  inbound_tracking_number TEXT,
  inbound_shipped_at TIMESTAMPTZ,
  
  -- Waktu tayang dan perpanjangan
  first_listed_at TIMESTAMPTZ,
  listing_ends_at TIMESTAMPTZ,
  extension_used BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawal_requested BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metrik
  view_count INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index performa untuk pencarian katalog & status
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items (status);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_consignor ON public.items (consignor_id);
CREATE INDEX IF NOT EXISTS idx_items_first_listed_at ON public.items (first_listed_at);

-- ------------------------------------------------------------------------------
-- 5. TABEL DOKUMEN IDENTITAS & KEPEMILIKAN (IDENTITY_DOCUMENTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ktp_file_url TEXT NOT NULL,
  ownership_proof_url TEXT NOT NULL,
  ownership_proof_type TEXT NOT NULL DEFAULT 'NOTA' CHECK (ownership_proof_type IN ('NOTA', 'DUS_ASLI', 'SERIAL_NUMBER')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'REJECTED')),
  is_purged BOOLEAN NOT NULL DEFAULT FALSE,
  purged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id)
);

CREATE INDEX IF NOT EXISTS idx_identity_docs_item ON public.identity_documents (item_id);
CREATE INDEX IF NOT EXISTS idx_identity_docs_consignor ON public.identity_documents (consignor_id);

-- ------------------------------------------------------------------------------
-- 6. TABEL PERSETUJUAN SYARAT PENITIPAN (TERMS_ACCEPTANCES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  fee_terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  shipping_terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  warranty_and_payout_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  price_proposal_schedule_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  end_of_term_rules_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE (item_id)
);

CREATE INDEX IF NOT EXISTS idx_terms_acceptances_item ON public.terms_acceptances (item_id);

-- ------------------------------------------------------------------------------
-- 7. TABEL LAPORAN PENGUJIAN (TEST_REPORTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  test_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checklist_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  youtube_video_url TEXT,
  physical_completeness TEXT NOT NULL,
  test_result TEXT NOT NULL CHECK (test_result IN ('PASSED', 'FAILED')),
  tester_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id)
);

CREATE INDEX IF NOT EXISTS idx_test_reports_item ON public.test_reports (item_id);

-- ------------------------------------------------------------------------------
-- 8. TABEL KERANJANG (CARTS & CART_ITEMS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_item ON public.cart_items (item_id);

-- ------------------------------------------------------------------------------
-- 9. TABEL PESANAN (ORDERS) & PENJUALAN PER BARANG (ORDER_ITEMS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_cost BIGINT NOT NULL DEFAULT 18000,
  insurance_cost BIGINT NOT NULL DEFAULT 0,
  total_items_price BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,
  hold_expires_at TIMESTAMPTZ NOT NULL,
  
  -- Bukti pembayaran manual
  payment_proof_url TEXT,
  payment_proof_uploaded_at TIMESTAMPTZ,
  payment_verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.users(id),
  
  -- Pengiriman ke pembeli
  outbound_courier TEXT DEFAULT 'JNE REG',
  outbound_tracking_number TEXT,
  outbound_shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  
  order_status TEXT NOT NULL DEFAULT 'Ditahan menunggu pembayaran',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders (buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_hold_expires ON public.orders (hold_expires_at);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  sale_price BIGINT NOT NULL,
  fee_amount BIGINT NOT NULL,
  consignor_amount BIGINT NOT NULL,
  received_at TIMESTAMPTZ,
  warranty_ends_at TIMESTAMPTZ,
  is_paid_to_consignor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON public.order_items (item_id);
CREATE INDEX IF NOT EXISTS idx_order_items_consignor ON public.order_items (consignor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_warranty ON public.order_items (warranty_ends_at);

-- ------------------------------------------------------------------------------
-- 10. TABEL KLAIM GARANSI (CLAIMS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  claim_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL,
  photo_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Klaim diproses' CHECK (status IN (
    'Klaim diproses',
    'Klaim: cacat tersembunyi',
    'Klaim: kesalahan Hingo',
    'Klaim: kesalahan pengiriman',
    'Ditolak/Tidak Valid'
  )),
  resolution_result TEXT,
  admin_notes TEXT,
  resolved_by_admin_id UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  refund_amount BIGINT DEFAULT 0,
  refund_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_item ON public.claims (item_id);
CREATE INDEX IF NOT EXISTS idx_claims_buyer ON public.claims (buyer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims (status);

-- ------------------------------------------------------------------------------
-- 11. TABEL PEMBAYARAN KE CONSIGNOR (CONSIGNOR_PAYOUTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consignor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE RESTRICT,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  sale_price BIGINT NOT NULL,
  fee_amount BIGINT NOT NULL,
  net_amount BIGINT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_holder TEXT NOT NULL,
  transfer_proof_url TEXT,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  admin_id UUID NOT NULL REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id)
);

CREATE INDEX IF NOT EXISTS idx_payouts_consignor ON public.consignor_payouts (consignor_id);
CREATE INDEX IF NOT EXISTS idx_payouts_item ON public.consignor_payouts (item_id);

-- ------------------------------------------------------------------------------
-- 12. TABEL PENGEMBALIAN BARANG (ITEM_RETURNS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
  consignor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (reason IN (
    'Ditolak saat screening',
    'Ditolak setelah pengecekan',
    'Ditarik sebelum masa habis',
    'Tidak diperpanjang',
    'Cacat tersembunyi'
  )),
  return_shipping_fee BIGINT NOT NULL DEFAULT 18000,
  withdrawal_fee BIGINT NOT NULL DEFAULT 0,
  total_return_cost BIGINT NOT NULL,
  payment_deadline TIMESTAMPTZ NOT NULL,
  payment_proof_url TEXT,
  payment_proof_uploaded_at TIMESTAMPTZ,
  payment_verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES public.users(id),
  return_courier TEXT,
  return_tracking_number TEXT,
  return_shipped_at TIMESTAMPTZ,
  expedition_returned_to_hingo BOOLEAN NOT NULL DEFAULT FALSE,
  expedition_incident_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_item ON public.item_returns (item_id);
CREATE INDEX IF NOT EXISTS idx_returns_consignor ON public.item_returns (consignor_id);

-- ------------------------------------------------------------------------------
-- 13. TABEL USULAN PENURUNAN HARGA (PRICE_PROPOSALS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  stage_day INT NOT NULL CHECK (stage_day IN (21, 30, 36, 50)),
  original_price BIGINT NOT NULL,
  current_price BIGINT NOT NULL,
  proposed_price BIGINT NOT NULL,
  min_price BIGINT NOT NULL,
  view_count_at_proposal INT NOT NULL DEFAULT 0,
  proposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_deadline TIMESTAMPTZ NOT NULL,
  answer TEXT NOT NULL DEFAULT 'PENDING' CHECK (answer IN ('PENDING', 'ACCEPTED', 'REJECTED', 'NO_RESPONSE')),
  answered_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, stage_day)
);

CREATE INDEX IF NOT EXISTS idx_proposals_item ON public.price_proposals (item_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.price_proposals (answer, response_deadline);

-- ------------------------------------------------------------------------------
-- 14. TABEL RIWAYAT STATUS (STATUS_HISTORY) - APPEND-ONLY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('CONSIGNOR', 'BUYER', 'ADMIN', 'SYSTEM')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_item ON public.status_history (item_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON public.status_history (created_at);

-- ------------------------------------------------------------------------------
-- 15. TABEL RIWAYAT HARGA (PRICE_HISTORY) - APPEND-ONLY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  old_price BIGINT NOT NULL,
  new_price BIGINT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'harga awal',
    'penurunan yang disetujui consignor',
    'perubahan oleh admin atas permintaan consignor',
    'perpanjangan'
  )),
  actor_id UUID REFERENCES public.users(id),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('ADMIN', 'CONSIGNOR', 'SYSTEM')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_item ON public.price_history (item_id);

-- ------------------------------------------------------------------------------
-- 16. TABEL LOG NOTIFIKASI (NOTIFICATION_LOG)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES public.users(id),
  event_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_preview TEXT,
  status TEXT NOT NULL CHECK (status IN ('SENT', 'FAILED')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_email ON public.notification_log (recipient_email);
CREATE INDEX IF NOT EXISTS idx_notification_log_created ON public.notification_log (created_at);

-- ------------------------------------------------------------------------------
-- 17. TRIGGER APPEND-ONLY PADA STATUS_HISTORY & PRICE_HISTORY
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_update_or_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Operasi % tidak diizinkan pada tabel ini: audit log bersifat append-only.', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_status_history_append_only ON public.status_history;
CREATE TRIGGER trg_status_history_append_only
BEFORE UPDATE OR DELETE ON public.status_history
FOR EACH ROW EXECUTE FUNCTION public.prevent_update_or_delete();

DROP TRIGGER IF EXISTS trg_price_history_append_only ON public.price_history;
CREATE TRIGGER trg_price_history_append_only
BEFORE UPDATE OR DELETE ON public.price_history
FOR EACH ROW EXECUTE FUNCTION public.prevent_update_or_delete();

-- ------------------------------------------------------------------------------
-- 18. FUNGSI SQL ATOMIK (RPC): TRANSITION_ITEM_STATUS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.transition_item_status(
  p_item_id UUID,
  p_to_status TEXT,
  p_actor_id UUID,
  p_actor_role TEXT,
  p_note TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_current_status TEXT;
  v_item_record RECORD;
  v_transition_valid BOOLEAN := FALSE;
  v_test_passed BOOLEAN := FALSE;
  v_history_id UUID;
BEGIN
  -- 1. Kunci baris barang dengan FOR UPDATE
  SELECT * INTO v_item_record
  FROM public.items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Barang dengan ID % tidak ditemukan.', p_item_id;
  END IF;

  v_current_status := v_item_record.status;

  -- 2. Cegah perubahan status akhir (Terminal States)
  IF v_current_status IN ('Ditolak saat screening', 'Dikembalikan ke consignor', 'Consignor sudah dibayar') THEN
    RAISE EXCEPTION 'Status akhir (%) tidak dapat diubah lagi. Koreksi hanya boleh melalui catatan.', v_current_status;
  END IF;

  -- 3. Periksa kecocokan transisi di tabel status_transitions
  SELECT EXISTS(
    SELECT 1 FROM public.status_transitions
    WHERE from_status = v_current_status
      AND to_status = p_to_status
      AND actor_role = p_actor_role
  ) INTO v_transition_valid;

  IF NOT v_transition_valid THEN
    RAISE EXCEPTION 'Transisi tidak valid: tidak ada aturan perpindahan dari "%" ke "%" oleh peran "%".',
      v_current_status, p_to_status, p_actor_role;
  END IF;

  -- 4. Validasi khusus jika berpindah ke status 'Tayang':
  --    Wajib memiliki laporan pengujian berstatus PASSED
  IF p_to_status = 'Tayang' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.test_reports
      WHERE item_id = p_item_id AND test_result = 'PASSED'
    ) INTO v_test_passed;

    IF NOT v_test_passed THEN
      RAISE EXCEPTION 'Barang tidak dapat berstatus Tayang tanpa laporan uji fisik berstatus PASSED (Lolos).';
    END IF;
  END IF;

  -- 5. Perbarui status pada tabel items
  UPDATE public.items
  SET
    status = p_to_status,
    first_listed_at = CASE
      WHEN p_to_status = 'Tayang' AND first_listed_at IS NULL THEN NOW()
      ELSE first_listed_at
    END,
    listing_ends_at = CASE
      WHEN p_to_status = 'Tayang' AND listing_ends_at IS NULL THEN NOW() + INTERVAL '60 days'
      ELSE listing_ends_at
    END,
    inbound_shipped_at = CASE
      WHEN p_to_status = 'Dalam perjalanan ke Hingo' AND inbound_shipped_at IS NULL THEN NOW()
      ELSE inbound_shipped_at
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- 6. Tulis riwayat ke status_history (append-only)
  INSERT INTO public.status_history (item_id, from_status, to_status, actor_id, actor_role, notes)
  VALUES (p_item_id, v_current_status, p_to_status, p_actor_id, p_actor_role, p_note)
  RETURNING id INTO v_history_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'item_id', p_item_id,
    'from_status', v_current_status,
    'to_status', p_to_status,
    'actor_role', p_actor_role,
    'history_id', v_history_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 19. FUNGSI SQL ATOMIK (RPC): CHECKOUT_HOLD_ITEMS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.checkout_hold_items(
  p_buyer_id UUID,
  p_item_ids UUID[],
  p_recipient_name TEXT,
  p_recipient_phone TEXT,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_shipping_postal_code TEXT,
  p_shipping_cost BIGINT,
  p_insurance_cost BIGINT
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_failed_items UUID[] := '{}';
  v_total_items_price BIGINT := 0;
  v_total_amount BIGINT := 0;
  v_order_id UUID;
  v_order_code TEXT;
  v_hold_hours INT := 24;
  v_fee_amount BIGINT;
  v_consignor_amount BIGINT;
  v_fee_threshold BIGINT := 200000;
  v_fee_flat BIGINT := 10000;
  v_fee_percent NUMERIC := 0.05;
BEGIN
  -- Ambil pengaturan penahanan dari settings jika ada
  SELECT COALESCE((value)::int, 24) INTO v_hold_hours
  FROM public.settings WHERE key = 'order_hold_hours';

  SELECT COALESCE((value)::bigint, 200000) INTO v_fee_threshold
  FROM public.settings WHERE key = 'fee_threshold';

  SELECT COALESCE((value)::bigint, 10000) INTO v_fee_flat
  FROM public.settings WHERE key = 'fee_flat_under_threshold';

  SELECT COALESCE((value)::numeric, 0.05) INTO v_fee_percent
  FROM public.settings WHERE key = 'fee_percent_above_threshold';

  -- 1. Kunci dan periksa semua barang yang diminta
  FOR v_item IN
    SELECT id, status, current_listing_price, consignor_id
    FROM public.items
    WHERE id = ANY(p_item_ids)
    FOR UPDATE
  LOOP
    IF v_item.status <> 'Tayang' THEN
      v_failed_items := array_append(v_failed_items, v_item.id);
    ELSE
      v_total_items_price := v_total_items_price + COALESCE(v_item.current_listing_price, 0);
    END IF;
  END LOOP;

  -- 2. Jika ada barang yang tidak berstatus Tayang, gagalkan seluruh transaksi
  IF array_length(v_failed_items, 1) > 0 OR v_total_items_price = 0 THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Sebagian atau seluruh barang sudah tidak tersedia.',
      'failed_item_ids', v_failed_items
    );
  END IF;

  v_total_amount := v_total_items_price + p_shipping_cost + p_insurance_cost;
  v_order_code := 'GRL-' || to_char(NOW(), 'YYYYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));

  -- 3. Buat order baru
  INSERT INTO public.orders (
    order_code,
    buyer_id,
    recipient_name,
    recipient_phone,
    shipping_address,
    shipping_city,
    shipping_postal_code,
    shipping_cost,
    insurance_cost,
    total_items_price,
    total_amount,
    hold_expires_at,
    order_status
  ) VALUES (
    v_order_code,
    p_buyer_id,
    p_recipient_name,
    p_recipient_phone,
    p_shipping_address,
    p_shipping_city,
    p_shipping_postal_code,
    p_shipping_cost,
    p_insurance_cost,
    v_total_items_price,
    v_total_amount,
    NOW() + (v_hold_hours || ' hours')::interval,
    'Ditahan menunggu pembayaran'
  )
  RETURNING id INTO v_order_id;

  -- 4. Pindahkan setiap barang ke status 'Ditahan menunggu pembayaran' & buat order_items
  FOR v_item IN
    SELECT id, current_listing_price, consignor_id
    FROM public.items
    WHERE id = ANY(p_item_ids)
  LOOP
    -- Hitung fee PRD 6.1
    IF v_item.current_listing_price <= v_fee_threshold THEN
      v_fee_amount := v_fee_flat;
    ELSE
      v_fee_amount := ROUND(v_item.current_listing_price * v_fee_percent);
    END IF;
    v_consignor_amount := v_item.current_listing_price - v_fee_amount;

    -- Transisi status atomik via transition_item_status
    PERFORM public.transition_item_status(
      v_item.id,
      'Ditahan menunggu pembayaran',
      p_buyer_id,
      'SYSTEM',
      'Ditahan otomatis untuk pesanan ' || v_order_code
    );

    -- Simpan penjualan per barang
    INSERT INTO public.order_items (
      order_id,
      item_id,
      consignor_id,
      sale_price,
      fee_amount,
      consignor_amount
    ) VALUES (
      v_order_id,
      v_item.id,
      v_item.consignor_id,
      v_item.current_listing_price,
      v_fee_amount,
      v_consignor_amount
    );
  END LOOP;

  -- 5. Bersihkan item yang dicheckout dari keranjang pembeli bila ada
  DELETE FROM public.cart_items
  WHERE item_id = ANY(p_item_ids)
    AND cart_id IN (SELECT id FROM public.carts WHERE user_id = p_buyer_id);

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', v_order_id,
    'order_code', v_order_code,
    'total_amount', v_total_amount,
    'hold_expires_at', (NOW() + (v_hold_hours || ' hours')::interval)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 20. ROW LEVEL SECURITY (RLS) PADA SEMUA TABEL
-- ------------------------------------------------------------------------------
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Default DENY untuk anon & authenticated di semua tabel sensitif (server service_role only).
-- Satu-satunya SELECT publik diperbolehkan untuk item berstatus 'Tayang':
DROP POLICY IF EXISTS "Public can view listed items" ON public.items;
CREATE POLICY "Public can view listed items"
  ON public.items
  FOR SELECT
  TO anon, authenticated
  USING (status = 'Tayang');

-- ------------------------------------------------------------------------------
-- 21. BUCKET STORAGE
-- ------------------------------------------------------------------------------
-- Buat bucket bila belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('kyc-documents', 'kyc-documents', false),
  ('payment-proofs', 'payment-proofs', false),
  ('claim-proofs', 'claim-proofs', false),
  ('item-photos', 'item-photos', true)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;
