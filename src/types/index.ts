export type ItemCategory = "RAM" | "SSD" | "GPU";

export type ItemStatus =
  | "Diajukan"
  | "Ditolak saat screening"
  | "Disetujui, menunggu kiriman"
  | "Dalam perjalanan ke Hingo"
  | "Diterima, sedang diuji"
  | "Ditolak setelah pengecekan"
  | "Menunggu ongkir kembali"
  | "Dikembalikan ke consignor"
  | "Tayang"
  | "Ditahan menunggu pembayaran"
  | "Dibayar, dikemas"
  | "Dikirim ke pembeli"
  | "Diterima pembeli"
  | "Klaim diproses"
  | "Klaim: cacat tersembunyi"
  | "Klaim: kesalahan Hingo"
  | "Siap dibayar ke consignor"
  | "Consignor sudah dibayar"
  | "Masa penitipan habis"
  | "Klaim: kesalahan pengiriman";

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  is_active: boolean;
  force_deactivated_note?: string;
  city?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder?: string;
  buyer_recipient_name?: string;
  buyer_phone?: string;
  buyer_full_address?: string;
  buyer_city?: string;
  buyer_postal_code?: string;
  created_at?: string;
}

export interface Item {
  id: string;
  item_code: string;
  consignor_id: string;
  category: ItemCategory;
  brand: string;
  model: string;
  condition: string;
  usage_duration: string;
  completeness: string;
  specifications: Record<string, any>;
  photos: string[];
  declaration_own_item: boolean;
  expected_price: number;
  min_price: number;
  initial_listing_price?: number;
  current_listing_price?: number;
  status: ItemStatus;
  admin_market_price_reference?: string;
  rejection_reason?: string;
  rejection_notes?: string;
  inbound_courier?: string;
  inbound_tracking_number?: string;
  inbound_shipped_at?: string;
  first_listed_at?: string;
  listing_ends_at?: string;
  extension_used: boolean;
  withdrawal_requested: boolean;
  view_count: number;
  created_at?: string;
  updated_at?: string;
  consignor?: User;
  test_report?: TestReport;
}

export interface TestReport {
  id: string;
  item_id: string;
  admin_id: string;
  test_date: string;
  checklist_results: Record<string, boolean>;
  test_photos: string[];
  youtube_video_url?: string;
  physical_completeness?: string;
  test_result: "PASSED" | "FAILED";
  tester_notes?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_code: string;
  buyer_id: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_cost: number;
  insurance_cost: number;
  total_items_price: number;
  total_amount: number;
  hold_expires_at?: string;
  payment_proof_url?: string;
  payment_proof_uploaded_at?: string;
  payment_verified_at?: string;
  verified_by_admin_id?: string;
  outbound_courier?: string;
  outbound_tracking_number?: string;
  outbound_shipped_at?: string;
  received_at?: string;
  order_status: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  consignor_id: string;
  sale_price: number;
  fee_amount: number;
  consignor_amount: number;
  received_at?: string;
  warranty_ends_at?: string;
  is_paid_to_consignor: boolean;
  item?: Item;
}

export interface Claim {
  id: string;
  order_item_id: string;
  item_id: string;
  buyer_id: string;
  claim_date: string;
  reason: string;
  photo_proofs: string[];
  video_url?: string;
  status: string;
  resolution_result?: string;
  admin_notes?: string;
  resolved_by_admin_id?: string;
  resolved_at?: string;
  refund_amount?: number;
  refund_paid_at?: string;
  created_at?: string;
  item?: Item;
}

export interface PriceProposal {
  id: string;
  item_id: string;
  stage_day: number;
  original_price: number;
  current_price: number;
  proposed_price: number;
  min_price: number;
  view_count_at_proposal: number;
  proposed_at: string;
  response_deadline: string;
  answer?: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  answered_at?: string;
}
