export interface Product {
  id: string;
  code: string;
  slug: string;
  brand: string;
  name: string;
  category: "KEYBOARD" | "MOUSE" | "HEADSET" | "MONITOR" | "ACCESSORIES";
  subtitle: string;
  condition: "Sangat baik" | "Baik";
  usageDuration: string;
  switchOrVariant: string;
  completeness: string;
  description: string;
  defectNotes: string;
  price: number;
  originalNewPrice: number;
  rating: number;
  soldCount: number;
  stock: number;
  location: string;
  isVerifiedByTeam: boolean;
  images: string[];
}

export interface ConsignmentItem {
  id: string;
  code: string;
  category: "KEYBOARD" | "MOUSE" | "HEADSET" | "MONITOR" | "ACCESSORIES";
  brandModel: string;
  variantSpec: string;
  usageDuration: string;
  additionalSpecs: string;
  currentCondition: string;
  defectDetails: string;
  completeness: string;
  photos: string[];
  expectedPrice: number;
  proposedPriceAfterInspection?: number;
  consignmentFee?: number;
  estimatedNetPayout?: number;
  actualNetPayout?: number;
  originCity: string;
  handoverMethod: string;
  inboundCourier?: string;
  inboundTrackingNumber?: string;
  stage:
    | "ONLINE_CHECK"
    | "REVISION_NEEDED"
    | "ONLINE_CHECK_PASSED"
    | "SHIPPING_TO_HINGO"
    | "INSPECTION_COMPLETED"
    | "PRICE_AGREED_MARKETING"
    | "SOLD_SHIPPING_TO_BUYER"
    | "PAYOUT_COMPLETED"
    | "RETURN_DISCUSSED";
  actionActor: "SELLER" | "HINGO" | "SELLER_AND_HINGO" | "COMPLETED";
  badgeLabel: string;
  statusSummary: string;
  actionPrompt: string;
  inspectionReport?: {
    functionNormal: boolean;
    hasCosmeticDefect: boolean;
    specs: string;
    functionTest: string;
    conditionAndDefect: string;
    completenessReceived: string;
    inspectedAt: string;
  };
}

export interface OrderItem {
  id: string;
  orderCode: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  product: Product;
  itemPrice: number;
  shippingCourier: string;
  shippingCost: number;
  shippingProtection: number;
  serviceFee: number;
  totalAmount: number;
  paymentMethod: string;
  buyerNote: string;
  trackingNumber: string;
  escrowStatus: "HELD_BY_HINGO" | "RELEASED_TO_SELLER" | "DISPUTED";
  orderStatus:
    | "AWAITING_PAYMENT"
    | "PACKING"
    | "SHIPPED"
    | "DELIVERED_CHECKING"
    | "COMPLETED"
    | "ISSUE_REPORTED";
  inspectionDeadline: string;
  createdAt: string;
  timeline: {
    step: number;
    title: string;
    timestamp: string;
    detail: string;
    status: "completed" | "current" | "upcoming";
  }[];
}

export interface ChatMessage {
  id: string;
  senderRole: "USER" | "ADMIN" | "CS";
  senderName: string;
  content: string;
  timeLabel: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  type: "PRODUCT_ADMIN" | "CS_SUPPORT" | "SYSTEM_INFO";
  title: string;
  subtitle: string;
  avatarText: string;
  ticketCode?: string;
  badge?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  product?: Partial<Product>;
  order?: Partial<OrderItem>;
  messages: ChatMessage[];
}

export const INITIAL_USER = {
  id: "user-naya",
  name: "Naya Putri",
  phone: "+62 812 3456 7890",
  email: "naya.putri@example.com",
  city: "Bandung",
  role: "USER",
  phoneVerified: true,
  kycStatus: "PENDING_REVIEW",
  address: {
    label: "Rumah",
    isPrimary: true,
    recipientName: "Naya Putri",
    phone: "0812 3456 7890",
    fullAddress: "Jl. Melati No. 18, RT 003/RW 005, Tebet, Jakarta Selatan, DKI Jakarta 12810",
    city: "Jakarta Selatan",
  },
  kycDocument: {
    fullNameKtp: "Naya Putri",
    maskedNik: "•••• •••• •••• 0842",
    ktpFileName: "ktp_naya.jpg",
    ktpFileSize: "1,8 MB",
    selfieFileName: "selfie_naya.jpg",
    selfieFileSize: "2,1 MB",
    uploadedAt: "22 Okt 2026 · 09.48 WIB",
    status: "PENDING_REVIEW",
  },
};

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    code: "K2-0842",
    slug: "keychron-k2-v2",
    brand: "KEYCHRON",
    name: "Keychron K2 V2",
    category: "KEYBOARD",
    subtitle: "Wireless mechanical keyboard · Brown switch",
    condition: "Sangat baik",
    usageDuration: "8 bulan",
    switchOrVariant: "Gateron Brown",
    completeness: "Box, kabel, keycap puller",
    description:
      "Keyboard pribadi, bukan bekas warnet. Semua tombol, Bluetooth, dan lampu RGB berfungsi normal. Ada gores halus di sisi bawah, tidak terlihat saat dipakai.",
    defectNotes: "Ada gores halus di sisi bawah, tidak terlihat saat dipakai.",
    price: 850000,
    originalNewPrice: 1499000,
    rating: 4.9,
    soldCount: 2100,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-2",
    code: "MX-3012",
    slug: "logitech-mx-master-3",
    brand: "LOGITECH",
    name: "Logitech MX Master 3",
    category: "MOUSE",
    subtitle: "Advanced ergonomic wireless mouse with MagSpeed",
    condition: "Baik",
    usageDuration: "14 bulan",
    switchOrVariant: "Darkfield 4000 DPI",
    completeness: "Unit mouse, USB-C cable",
    description:
      "Pemakaian harian untuk desain grafis. Tombol gesture dan horizontal scroll berfungsi sangat empuk. Lecet wajar pemakaian di bagian thumb rest.",
    defectNotes: "Lecet halus pada karet thumb rest, fungsional 100% prima.",
    price: 650000,
    originalNewPrice: 1399000,
    rating: 4.8,
    soldCount: 1420,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-3",
    code: "XM4-9921",
    slug: "sony-wh-1000xm4",
    brand: "SONY",
    name: "Sony WH-1000XM4",
    category: "HEADSET",
    subtitle: "Wireless Noise Cancelling Headphones - Black",
    condition: "Sangat baik",
    usageDuration: "6 bulan",
    switchOrVariant: "LDAC & Multipoint Bluetooth",
    completeness: "Hardcase, kabel aux, adapter pesawat",
    description:
      "Headphone noise cancelling terbaik. Baterai awet 28+ jam. Earpad empuk seperti baru, no sobek no bau.",
    defectNotes: "Hanya gores mikro di case luar, unit headphone mulus 98%.",
    price: 1850000,
    originalNewPrice: 3899000,
    rating: 4.9,
    soldCount: 890,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=900&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-4",
    code: "DELL-2419",
    slug: "dell-p2419h-24",
    brand: "DELL",
    name: "Dell P2419H 24 inci",
    category: "MONITOR",
    subtitle: "FHD IPS Professional Monitor with Pivot Stand",
    condition: "Baik",
    usageDuration: "18 bulan",
    switchOrVariant: "IPS 60Hz 1080p, Pivot Stand",
    completeness: "Stand original, kabel power, kabel HDMI",
    description:
      "Monitor kerja profesional dengan bezel tipis dan stand rotasi pivot. No dead pixel, warna akurat 99% sRGB.",
    defectNotes: "Ada baret halus di base stand belakang. Layar bersih mulus.",
    price: 1250000,
    originalNewPrice: 2499000,
    rating: 4.7,
    soldCount: 610,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-5",
    code: "G304-411",
    slug: "logitech-g304",
    brand: "LOGITECH",
    name: "Logitech G304 Lightspeed",
    category: "MOUSE",
    subtitle: "Wireless Gaming Mouse HERO Sensor 12.000 DPI",
    condition: "Sangat baik",
    usageDuration: "4 bulan",
    switchOrVariant: "Black Hero Sensor",
    completeness: "Unit, Lightspeed dongle, extension cable, box",
    description:
      "Mouse gaming sejuta umat yang sangat awet. Klik kiri-kanan empuk renyah tanpa double click. Baterai AA tahan berbulan-bulan.",
    defectNotes: "Kondisi fisik 97%, skate mouse diganti Corepad lebih licin.",
    price: 275000,
    originalNewPrice: 599000,
    rating: 4.8,
    soldCount: 3200,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-6",
    code: "AKKO-3068",
    slug: "akko-3068b-plus",
    brand: "AKKO",
    name: "Akko 3068B Plus",
    category: "KEYBOARD",
    subtitle: "65% Multi-modes Hot-swap Wireless CS Jelly Purple",
    condition: "Baik",
    usageDuration: "7 bulan",
    switchOrVariant: "CS Jelly Purple Tactile",
    completeness: "Box, kabel braided, novelty keycaps, switch puller",
    description:
      "Compact 65% layout mechanical keyboard. Switch tactile empuk berkarakter thocky. Support Bluetooth 5.0, 2.4GHz dongle, dan wired type-C.",
    defectNotes: "Tombol spasi ada sedikit shine wajar pemakaian.",
    price: 720000,
    originalNewPrice: 1299000,
    rating: 4.8,
    soldCount: 750,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-7",
    code: "K8P-101",
    slug: "keychron-k8-pro",
    brand: "KEYCHRON",
    name: "Keychron K8 Pro Wireless Mechanical",
    category: "KEYBOARD",
    subtitle: "QMK/VIA Wireless Custom Keyboard · Red Switch",
    condition: "Sangat baik",
    usageDuration: "5 bulan",
    switchOrVariant: "Gateron G Pro Red Linear",
    completeness: "Fullset box original, keycaps Mac & Win, kabel",
    description:
      "Kondisi koleksi jarang dipakai. Suara lembut linear dan stabiliser sudah di-lube tim Hingo.",
    defectNotes: "Mulus total 99% tanpa kendala.",
    price: 1499000,
    originalNewPrice: 2299000,
    rating: 4.9,
    soldCount: 920,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-8",
    code: "MX-3S-202",
    slug: "logitech-mx-master-3s",
    brand: "LOGITECH",
    name: "Logitech MX Master 3S Wireless",
    category: "MOUSE",
    subtitle: "Quiet Clicks · 8K DPI Darkfield · Graphite",
    condition: "Sangat baik",
    usageDuration: "3 bulan",
    switchOrVariant: "8000 DPI Quiet Click",
    completeness: "Fullset, Logi Bolt USB, kabel type-C",
    description:
      "Seri terbaru 3S dengan klik sangat senyap dan sensor 8K DPI. Cocok untuk setup profesional.",
    defectNotes: "Hanya tanda pemakaian halus di telapak.",
    price: 1599000,
    originalNewPrice: 1999000,
    rating: 5.0,
    soldCount: 1800,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-9",
    code: "HX-C3-303",
    slug: "hyperx-cloud-iii",
    brand: "HYPERX",
    name: "HyperX Cloud III Gaming Headset",
    category: "HEADSET",
    subtitle: "DTS Headphone:X Spatial Audio · Ultra-Comfort",
    condition: "Sangat baik",
    usageDuration: "4 bulan",
    switchOrVariant: "53mm Angled Drivers",
    completeness: "Detachable mic, USB-C to USB-A adapter",
    description:
      "Headset gaming legendaris dengan busa memory foam paling empuk dan mic jernih.",
    defectNotes: "Mulus tanpa baret atau sobek.",
    price: 1349000,
    originalNewPrice: 1899000,
    rating: 4.9,
    soldCount: 1100,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=900&auto=format&fit=crop",
    ],
  },
  {
    id: "prod-10",
    code: "LG-27-404",
    slug: "lg-ultragear-27-165hz",
    brand: "LG",
    name: "LG UltraGear 27\" 165Hz IPS",
    category: "MONITOR",
    subtitle: "1ms MBR · HDR10 · AMD FreeSync Premium",
    condition: "Sangat baik",
    usageDuration: "9 bulan",
    switchOrVariant: "27GP750-B IPS 165Hz",
    completeness: "Stand ergonomis pivot, kabel DP, adaptor",
    description:
      "Monitor kompetitif esports dengan refresh rate tinggi dan warna IPS punchy. No dead pixel.",
    defectNotes: "Ada goresan kecil di bagian belakang monitor dekat bracket VESA.",
    price: 3299000,
    originalNewPrice: 4899000,
    rating: 4.9,
    soldCount: 540,
    stock: 1,
    location: "Jakarta Selatan",
    isVerifiedByTeam: true,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=900&auto=format&fit=crop",
    ],
  },
];

export const CONSIGNMENT_ITEMS: ConsignmentItem[] = [
  {
    id: "csg-1",
    code: "HG-261018-031",
    category: "MOUSE",
    brandModel: "Logitech MX Master 3S",
    variantSpec: "Graphite · 8000 DPI Quiet Click",
    usageDuration: "6 bulan",
    additionalSpecs: "Baterai awet 70 hari, support Logi Bolt receiver dan Bluetooth triple channel.",
    currentCondition: "Bekas · berfungsi normal",
    defectDetails: "Ada gores halus di sandaran ibu jari karena cincin. Fungsi klik dan scroll 100% prima.",
    completeness: "Mouse unit, Logi Bolt receiver, kabel USB-C original, kartu manual.",
    photos: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 1000000,
    proposedPriceAfterInspection: 950000,
    consignmentFee: 95000,
    estimatedNetPayout: 855000,
    originCity: "Bandung",
    handoverMethod: "Kirim via JNE REG (HGO261020031)",
    inboundCourier: "JNE REG",
    inboundTrackingNumber: "HGO261020031",
    stage: "INSPECTION_COMPLETED",
    actionActor: "SELLER",
    badgeLabel: "Tinjau hasil inspeksi",
    statusSummary: "Inspeksi fisik selesai, usulan harga Rp950.000",
    actionPrompt: "Tinjau hasil inspeksi →",
    inspectionReport: {
      functionNormal: true,
      hasCosmeticDefect: true,
      specs: "Sensor Darkfield 8000 DPI, koneksi Logi Bolt & Bluetooth, baterai 500mAh",
      functionTest: "Sensor optik 100% responsif pada kayu dan kaca, MagSpeed scroll wheel normal, semua 7 tombol klik senyap dan taktil, koneksi dual mode berfungsi sempurna.",
      conditionAndDefect: "Terdapat gores halus pada area karet sandaran jempol kiri bekas gesekan jam tangan. Casing atas, tombol klik, dan skate bawah masih mulus dan rapi.",
      completenessReceived: "Unit mouse, receiver Logi Bolt USB, kabel USB-C original, box lengkap.",
      inspectedAt: "22 Okt 2026, 10.30 WIB oleh Tim Inspeksi Hingo",
    },
  },
  {
    id: "csg-2",
    code: "HG-261019-032",
    category: "KEYBOARD",
    brandModel: "Akko 5075B Plus",
    variantSpec: "75% Hot-swap · V3 Cream Yellow Pro",
    usageDuration: "4 bulan",
    additionalSpecs: "Gasket mount, RGB side light, rotary encoder knob CNC aluminium.",
    currentCondition: "Bekas · berfungsi normal",
    defectDetails: "Tidak ada goresan mayor, switch original bersih.",
    completeness: "Box lengkap, dongle 2.4G, kabel aviator, switch ekstra.",
    photos: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 850000,
    originCity: "Bandung",
    handoverMethod: "Kirim setelah lolos pengecekan online",
    stage: "ONLINE_CHECK_PASSED",
    actionActor: "SELLER",
    badgeLabel: "Siap dikirim ke Hingo",
    statusSummary: "Lolos pengecekan online, baca instruksi pengemasan",
    actionPrompt: "Lihat instruksi kirim →",
  },
  {
    id: "csg-3",
    code: "HG-261019-033",
    category: "HEADSET",
    brandModel: "HyperX Cloud II",
    variantSpec: "Gunmetal · 7.1 Virtual Surround Sound",
    usageDuration: "9 bulan",
    additionalSpecs: "Driver 53mm neodymium magnet, sound card USB kontrol volume.",
    currentCondition: "Bekas · berfungsi normal",
    defectDetails: "Earpad kulit sedikit terkelupas mikro, earpad cadangan velour masih baru.",
    completeness: "Unit headset, mic, USB sound card dongle, earpad velour, pouch.",
    photos: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 750000,
    originCity: "Bandung",
    handoverMethod: "JNE REG · Resi HGO261021033",
    inboundCourier: "JNE REG",
    inboundTrackingNumber: "HGO261021033",
    stage: "SHIPPING_TO_HINGO",
    actionActor: "HINGO",
    badgeLabel: "Dalam kiriman ke Hingo",
    statusSummary: "JNE REG · HGO261021033 dalam perjalanan ke gudang Hingo",
    actionPrompt: "Lacak ke Hingo →",
  },
  {
    id: "csg-4",
    code: "HG-261015-034",
    category: "MOUSE",
    brandModel: "Razer Orochi V2",
    variantSpec: "White Edition · Ultra-lightweight 60g",
    usageDuration: "5 bulan",
    additionalSpecs: "Koneksi HyperSpeed Wireless dan Bluetooth, baterai AA/AAA hybrid.",
    currentCondition: "Bekas · mulus",
    defectDetails: "Tidak ada cacat, grip tape sudah dilepas tanpa sisa lem.",
    completeness: "Unit mouse, USB dongle, baterai Energizer Lithium, buku manual.",
    photos: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 550000,
    proposedPriceAfterInspection: 550000,
    consignmentFee: 55000,
    estimatedNetPayout: 495000,
    originCity: "Bandung",
    handoverMethod: "Diterima gudang Hingo",
    stage: "PRICE_AGREED_MARKETING",
    actionActor: "HINGO",
    badgeLabel: "Sedang dipasarkan",
    statusSummary: "Harga disepakati Rp550.000. Sedang dipromosikan di Instagram & TikTok Hingo",
    actionPrompt: "Lihat pemasaran →",
  },
  {
    id: "csg-5",
    code: "HG-261010-035",
    category: "MONITOR",
    brandModel: "Dell P2422H",
    variantSpec: "23.8\" IPS FHD · ComfortView Plus",
    usageDuration: "11 bulan",
    additionalSpecs: "Ultra-thin bezel, USB 3.2 Gen 1 hub 4 port, height-adjustable pivot stand.",
    currentCondition: "Bekas · sangat prima",
    defectDetails: "Hanya goresan tipis di plastik alas stand.",
    completeness: "Monitor, kabel DisplayPort, kabel power, stand original.",
    photos: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 1600000,
    proposedPriceAfterInspection: 1600000,
    consignmentFee: 150000,
    estimatedNetPayout: 1450000,
    originCity: "Bandung",
    handoverMethod: "Diterima gudang Hingo",
    stage: "SOLD_SHIPPING_TO_BUYER",
    actionActor: "HINGO",
    badgeLabel: "Dikirim ke pembeli",
    statusSummary: "Barang terjual! Estimasi hasil bersih Rp1.450.000 sedang dikirim ke pembeli di Surabaya",
    actionPrompt: "Lacak ke pembeli →",
  },
  {
    id: "csg-6",
    code: "HG-261002-036",
    category: "KEYBOARD",
    brandModel: "SteelSeries Apex 3",
    variantSpec: "RGB Gaming Keyboard · Whisper Quiet Switches",
    usageDuration: "12 bulan",
    additionalSpecs: "IP32 water resistant, magnetic wrist rest, 10-zone RGB.",
    currentCondition: "Bekas · berfungsi normal",
    defectDetails: "Pemakaian wajar, tombol bersih.",
    completeness: "Unit keyboard, wrist rest magnetik, box original.",
    photos: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 500000,
    proposedPriceAfterInspection: 500000,
    consignmentFee: 50000,
    actualNetPayout: 450000,
    originCity: "Bandung",
    handoverMethod: "Selesai",
    stage: "PAYOUT_COMPLETED",
    actionActor: "COMPLETED",
    badgeLabel: "Pencairan diterima",
    statusSummary: "Dana Rp450.000 telah ditransfer ke rekening BCA Naya Putri pada 15 Okt 2026",
    actionPrompt: "Lihat bukti pencairan →",
  },
  {
    id: "csg-7",
    code: "HG-261020-037",
    category: "KEYBOARD",
    brandModel: "Keychron C1",
    variantSpec: "Tenkeyless Non-Backlight · Gateron Red",
    usageDuration: "8 bulan",
    additionalSpecs: "Type-C wired connection, hot-swappable PCB.",
    currentCondition: "Bekas",
    defectDetails: "Port kabel sedikit longgar jika digoyang keras.",
    completeness: "Hanya unit dan kabel.",
    photos: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 600000,
    originCity: "Bandung",
    handoverMethod: "Menunggu revisi foto",
    stage: "REVISION_NEEDED",
    actionActor: "SELLER",
    badgeLabel: "Perlu revisi",
    statusSummary: "Foto port USB Type-C belum jelas, mohon unggah foto resolusi tinggi tambahan",
    actionPrompt: "Perbaiki pengajuan →",
  },
  {
    id: "csg-8",
    code: "HG-261021-038",
    category: "HEADSET",
    brandModel: "Logitech G435",
    variantSpec: "Lightspeed Wireless · Black & Neon Yellow",
    usageDuration: "2 bulan",
    additionalSpecs: "Ringan hanya 165g, dual beamforming mic, Dolby Atmos ready.",
    currentCondition: "Seperti baru",
    defectDetails: "Mulus tanpa bekas noda atau gores.",
    completeness: "Fullset dus buku, kabel charger, dongle USB.",
    photos: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 480000,
    originCity: "Bandung",
    handoverMethod: "Pengecekan online",
    stage: "ONLINE_CHECK",
    actionActor: "HINGO",
    badgeLabel: "Menunggu review",
    statusSummary: "Tahap: Pengecekan online oleh tim kurator Hingo (estimasi 1x24 jam)",
    actionPrompt: "Lihat pengajuan →",
  },
  {
    id: "csg-9",
    code: "HG-261012-039",
    category: "MONITOR",
    brandModel: "AOC 24G2",
    variantSpec: "24\" 144Hz IPS 1ms Gaming Monitor",
    usageDuration: "20 bulan",
    additionalSpecs: "Freesync premium, 126% sRGB wide color gamut.",
    currentCondition: "Bekas · ada kendala panel",
    defectDetails: "Muncul garis horizontal halus di tepi bawah layar saat pemakaian di atas 30 menit.",
    completeness: "Monitor, kabel DP, power cord, kaki stand.",
    photos: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
    ],
    expectedPrice: 1600000,
    originCity: "Bandung",
    handoverMethod: "Di gudang Hingo",
    stage: "RETURN_DISCUSSED",
    actionActor: "SELLER_AND_HINGO",
    badgeLabel: "Pengembalian dibahas",
    statusSummary: "Panel terdeteksi bergaris saat inspeksi suhu. Tim Hingo merekomendasikan pengembalian ke pemilik",
    actionPrompt: "Bahas pengembalian →",
  },
];

export const INITIAL_ORDER: OrderItem = {
  id: "ord-842",
  orderCode: "GRL-20261022-0842",
  buyerName: "Naya Putri",
  buyerPhone: "0812 3456 7890",
  buyerAddress: "Jl. Melati No. 18, RT 003/RW 005, Tebet, Jakarta Selatan, DKI Jakarta 12810",
  product: PRODUCTS[0],
  itemPrice: 850000,
  shippingCourier: "JNE REG",
  shippingCost: 18000,
  shippingProtection: 5000,
  serviceFee: 2500,
  totalAmount: 875500,
  paymentMethod: "BCA Virtual Account",
  buyerNote: "Mohon bubble wrap tambahan, ya.",
  trackingNumber: "JNE2201040842",
  escrowStatus: "HELD_BY_HINGO",
  orderStatus: "DELIVERED_CHECKING",
  inspectionDeadline: "26 Okt 2026, 14.00 WIB",
  createdAt: "22 Oktober 2026",
  timeline: [
    {
      step: 1,
      title: "Pembayaran diterima",
      timestamp: "22 Okt 2026 · 10.32 WIB",
      detail: "Rp875.500 dibayar via BCA Virtual Account. Dana resmi disimpan di rekening bersama Hingo.",
      status: "completed",
    },
    {
      step: 2,
      title: "Barang dikirim tim Hingo",
      timestamp: "23 Okt 2026 · 09.15 WIB",
      detail: "Dikemas rapi dengan double bubble wrap oleh tim logistik Hingo. JNE REG Resi: JNE2201040842.",
      status: "completed",
    },
    {
      step: 3,
      title: "Paket tiba — waktunya cek barang",
      timestamp: "24 Okt 2026 · 13.56 WIB",
      detail: "Paket telah diterima Naya. Dana sebesar Rp875.500 masih ditahan Hingo untuk keamananmu.",
      status: "current",
    },
    {
      step: 4,
      title: "Konfirmasi & pencairan dana",
      timestamp: "Menunggu konfirmasi pembeli",
      detail: "Setelah pembeli menekan konfirmasi atau batas waktu habis, hasil penjualan baru diteruskan ke pemilik barang.",
      status: "upcoming",
    },
  ],
};

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: "product",
    type: "PRODUCT_ADMIN",
    title: "Admin Hingo",
    subtitle: "Tim Hingo · Aktif 5 menit lalu",
    avatarText: "H",
    lastMessage: "Lengkap: box, kabel, keycap puller. Tim kami kirim ke Tebet, ongkir Rp18.000. Checkout di Hingo ya.",
    lastTime: "10.14",
    product: PRODUCTS[0],
    messages: [
      {
        id: "msg-1",
        senderRole: "USER",
        senderName: "Naya Putri",
        content: "Halo Kak, Keychron K2-nya masih ada? Semua tombol dan Bluetooth normal?",
        timeLabel: "10.10",
        isRead: true,
      },
      {
        id: "msg-2",
        senderRole: "ADMIN",
        senderName: "Admin Hingo",
        content: "Halo Naya, tersedia di kami. Tombol dan Bluetooth sudah dicek. Ada gores halus di sisi bawah.",
        timeLabel: "10.11",
        isRead: true,
      },
      {
        id: "msg-3",
        senderRole: "USER",
        senderName: "Naya Putri",
        content: "Box dan kabel ikut? Bisa dikirim ke Tebet pakai JNE REG?",
        timeLabel: "10.12",
        isRead: true,
      },
      {
        id: "msg-4",
        senderRole: "ADMIN",
        senderName: "Admin Hingo",
        content: "Lengkap: box, kabel, keycap puller. Tim kami kirim ke Tebet, ongkir Rp18.000. Checkout di Hingo ya.",
        timeLabel: "10.14",
        isRead: true,
      },
    ],
  },
  {
    id: "support",
    type: "CS_SUPPORT",
    title: "CS Hingo · Resmi",
    subtitle: "Mira · Tim bantuan · Online",
    avatarText: "CS",
    ticketCode: "CS-0842",
    badge: "Percakapan aktif",
    lastMessage: "Danamu tetap ditahan. Pilih “Laporkan masalah” sebelum 26 Okt, 14.00 WIB...",
    lastTime: "14.08",
    order: INITIAL_ORDER,
    messages: [
      {
        id: "cs-1",
        senderRole: "USER",
        senderName: "Naya Putri",
        content: "Halo, paket Keychron K2 V2 sudah tiba. Apa yang harus saya cek sebelum konfirmasi?",
        timeLabel: "14.05",
        isRead: true,
      },
      {
        id: "cs-2",
        senderRole: "CS",
        senderName: "Mira · CS Hingo",
        content: "Halo Naya, saya Mira dari CS Hingo. Cek kondisi fisik, semua tombol, Bluetooth, serta kelengkapan box dan kabel. Rekam video saat membuka paket ya.",
        timeLabel: "14.06",
        isRead: true,
      },
      {
        id: "cs-3",
        senderRole: "USER",
        senderName: "Naya Putri",
        content: "Kalau ternyata ada tombol yang tidak berfungsi, dananya bagaimana?",
        timeLabel: "14.07",
        isRead: true,
      },
      {
        id: "cs-4",
        senderRole: "CS",
        senderName: "Mira · CS Hingo",
        content: "Danamu tetap ditahan. Pilih “Laporkan masalah” sebelum 26 Okt, 14.00 WIB. Sertakan foto/video; tim Hingo akan menangani kendalamu.",
        timeLabel: "14.08",
        isRead: true,
      },
    ],
  },
  {
    id: "info",
    type: "SYSTEM_INFO",
    title: "Info Hingo",
    subtitle: "Pusat Panduan & Edukasi",
    avatarText: "i",
    lastMessage: "Tips aman belanja preloved: Selalu rekam video unboxing saat paket tiba.",
    lastTime: "Kemarin",
    messages: [
      {
        id: "info-1",
        senderRole: "ADMIN",
        senderName: "Info Hingo",
        content: "Selamat datang di Hingo! Semua barang di platform kami dicek fisik oleh kurator ahli sebelum dikirim.",
        timeLabel: "Kemarin",
        isRead: true,
      },
      {
        id: "info-2",
        senderRole: "ADMIN",
        senderName: "Info Hingo",
        content: "Tips aman belanja preloved: Selalu rekam video unboxing saat paket tiba.",
        timeLabel: "Kemarin",
        isRead: true,
      },
    ],
  },
];
