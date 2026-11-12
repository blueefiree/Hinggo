-- Step 17B: Aktifkan RLS ketat pada seluruh tabel schema public & kunci bucket sensitif

-- 1. Pastikan RLS aktif di semua tabel schema public
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

-- 2. Hapus policy permisif lama ("Allow all access for Hingo app")
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.users;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.otp_verifications;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.kyc_documents;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.addresses;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.bank_accounts;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.products;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.wishlists;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.cart_items;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.consignments;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.orders;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.chat_threads;
DROP POLICY IF EXISTS "Allow all access for Hingo app" ON public.chat_messages;

-- 3. products: Hanya SELECT publik untuk produk berstatus AVAILABLE
--    INSERT/UPDATE/DELETE tanpa policy untuk anon/authenticated (hanya service_role)
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
CREATE POLICY "Public can read active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'AVAILABLE');

-- 4. Tabel sensitif (users, orders, cart_items, wishlists, addresses, bank_accounts,
--    kyc_documents, consignments, otp_verifications, chat_threads, chat_messages):
--    TANPA policy untuk anon/authenticated -> default DENY.
--    Server API mengakses via SUPABASE_SERVICE_ROLE_KEY setelah verifikasi sesi Step 15.

-- 5. Kunci bucket Storage sensitif agar wajib private (diakses via signed URL)
UPDATE storage.buckets
SET public = false
WHERE id IN ('kyc-documents', 'payment-proofs');

