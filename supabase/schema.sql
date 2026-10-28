CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Pengguna Hingo',
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  city TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  role TEXT DEFAULT 'USER',
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'UNVERIFIED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name_ktp TEXT NOT NULL,
  nik_number TEXT NOT NULL,
  masked_nik TEXT NOT NULL,
  ktp_image_url TEXT NOT NULL,
  ktp_file_size TEXT DEFAULT '1.5 MB',
  selfie_image_url TEXT NOT NULL,
  selfie_file_size TEXT DEFAULT '1.8 MB',
  status TEXT DEFAULT 'PENDING_REVIEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Rumah',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'Sangat baik',
  usage_duration TEXT DEFAULT '',
  switch_or_variant TEXT DEFAULT '',
  completeness TEXT DEFAULT '',
  description TEXT DEFAULT '',
  defect_notes TEXT DEFAULT '',
  price BIGINT NOT NULL,
  original_new_price BIGINT DEFAULT 0,
  stock INT DEFAULT 1,
  location TEXT DEFAULT 'Jakarta Selatan',
  rating NUMERIC(3,1) DEFAULT 5.0,
  sold_count INT DEFAULT 0,
  is_verified_by_team BOOLEAN DEFAULT TRUE,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  selected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  brand_model TEXT NOT NULL,
  variant_spec TEXT DEFAULT '',
  usage_duration TEXT DEFAULT '',
  additional_specs TEXT DEFAULT '',
  current_condition TEXT DEFAULT 'Bekas · berfungsi normal',
  defect_details TEXT DEFAULT '',
  completeness TEXT DEFAULT '',
  photos JSONB DEFAULT '[]'::jsonb,
  expected_price BIGINT NOT NULL,
  proposed_price BIGINT,
  consignment_fee BIGINT,
  estimated_net_payout BIGINT,
  origin_city TEXT DEFAULT '',
  handover_method TEXT DEFAULT 'SHIP_AFTER_ONLINE_CHECK',
  inbound_courier TEXT DEFAULT '',
  inbound_tracking_number TEXT DEFAULT '',
  stage TEXT DEFAULT 'ONLINE_CHECK',
  badge_label TEXT DEFAULT 'Menunggu review',
  status_summary TEXT DEFAULT 'Data sudah terkirim. Jangan kirim barang sebelum ada instruksi.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  item_price BIGINT NOT NULL,
  shipping_courier TEXT DEFAULT 'JNE REG',
  shipping_cost BIGINT DEFAULT 18000,
  shipping_protection BIGINT DEFAULT 5000,
  service_fee BIGINT DEFAULT 2500,
  total_amount BIGINT NOT NULL,
  payment_method TEXT DEFAULT 'BCA_VA',
  buyer_note TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  escrow_status TEXT DEFAULT 'HELD_BY_HINGO',
  order_status TEXT DEFAULT 'PAID_PACKING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'PRODUCT_ADMIN',
  title TEXT DEFAULT 'Admin Hingo',
  ticket_code TEXT DEFAULT '',
  related_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for Hingo app" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.otp_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.kyc_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.addresses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.consignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.chat_threads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for Hingo app" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

