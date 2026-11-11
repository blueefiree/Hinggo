import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obdczozspvkdebhtyhoh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_qYJsxxD04jDxX2WXPPysTg_vf8IY1AN";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== SEEDING HINGGO COMPREHENSIVE DUMMY DATA (PRISMA + SUPABASE) ===");

  // =========================================================================
  // 1. SEED USERS (Admin, Demo Seller, Demo Buyer)
  // =========================================================================
  console.log("1. Seeding Users...");

  const usersData = [
    {
      id: "user-admin",
      name: "Admin Hingo",
      email: "admin@hingo.id",
      phone: "+6281200000001",
      city: "Jakarta Selatan",
      bio: "Kurator Resmi & Verifikator Escrow Hingo Indonesia.",
      role: "ADMIN",
      phoneVerified: true,
      emailVerified: true,
      kycStatus: "VERIFIED",
    },
    {
      id: "user-seller-1",
      name: "Budi Pratama",
      email: "seller1@gmail.com",
      phone: "+6281234567891",
      city: "Jakarta Selatan",
      bio: "Kolektor custom keyboard & competitive FPS enthusiast. Semua gear rawatan pribadi.",
      role: "USER",
      phoneVerified: true,
      emailVerified: true,
      kycStatus: "VERIFIED",
    },
    {
      id: "user-buyer-1",
      name: "Dimas Arya",
      email: "buyer1@gmail.com",
      phone: "+6281234567892",
      city: "Bandung",
      bio: "Esports player & keyboard builder.",
      role: "USER",
      phoneVerified: true,
      emailVerified: true,
      kycStatus: "VERIFIED",
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });

    try {
      await supabase.from("users").upsert({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        city: u.city,
        bio: u.bio,
        role: u.role,
        phone_verified: u.phoneVerified,
        email_verified: u.emailVerified,
        kyc_status: u.kycStatus,
      });
    } catch (e) {
      console.warn("Supabase user sync notice:", e);
    }
  }

  // Seed Address & Bank Account
  const buyerAddress = {
    id: "addr-buyer-1",
    userId: "user-buyer-1",
    userEmail: "buyer1@gmail.com",
    label: "Rumah",
    recipientName: "Dimas Arya",
    phone: "+6281234567892",
    fullAddress: "Jl. Riau No. 120, Cibeunying, Kota Bandung",
    city: "Bandung",
    postalCode: "40115",
    isPrimary: true,
  };
  await prisma.address.upsert({
    where: { id: buyerAddress.id },
    update: buyerAddress,
    create: buyerAddress,
  });

  const sellerBank = {
    id: "bank-seller-1",
    userId: "user-seller-1",
    userEmail: "seller1@gmail.com",
    bankName: "BCA",
    accountNumber: "8820394812",
    accountHolder: "Budi Pratama",
    isPrimary: true,
  };
  await prisma.bankAccount.upsert({
    where: { id: sellerBank.id },
    update: sellerBank,
    create: sellerBank,
  });

  // =========================================================================
  // 2. SEED PRODUCTS (12 High-Quality Gaming Gear Across All 5 Categories)
  // =========================================================================
  console.log("2. Seeding Products...");

  const productsData = [
    // --- KEYBOARD ---
    {
      id: "prod-keychron-q1",
      code: "HG-PRD-001",
      slug: "keychron-q1-pro-wireless-custom-banana",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "KEYCHRON",
      name: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
      subtitle: "Barebone Knob + Gateron Jupiter Banana · Sangat baik",
      category: "KEYBOARD",
      condition: "Sangat baik",
      usageDuration: "3 bulan",
      switchOrVariant: "Gateron Jupiter Banana (Tactile Lubed)",
      completeness: "Fullset box, kabel aviator braided, keycap puller, switch puller, hex key L, extra gasket",
      description: "Keyboard custom aluminium CNC 75% layout premium dari Keychron. Koneksi nirkabel Bluetooth 5.1 dan kabel Type-C. PCB hot-swappable dengan south-facing RGB. Sudah dilakukan tape mod dan lubing pada stabilizer sehingga suara ketikan sangat padat (thocky).",
      defectNotes: "Fisik 99% mulus seperti baru, tidak ada scratch atau dent pada case aluminum CNC anodized. RGB dan koneksi wireless normal 100%.",
      price: 2450000,
      originalNewPrice: 3200000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 2,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-wooting-60he",
      code: "HG-PRD-002",
      slug: "wooting-60he-rapid-trigger-tofu60",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "WOOTING",
      name: "Wooting 60HE Rapid Trigger Analog Gaming Keyboard",
      subtitle: "Lekker Switch 0.1mm · Modded Tofu60 Redux · Sangat baik",
      category: "KEYBOARD",
      condition: "Sangat baik",
      usageDuration: "2 bulan",
      switchOrVariant: "Lekker Magnetic Analog Switch (Adjustable 0.1-4.0mm)",
      completeness: "Fullset box original, case Tofu60 Redux Anodized Red, brass weight bar, kabel original Wooting, strap khas",
      description: "Keyboard gaming kompetitif nomor satu dunia untuk Valorant & CS2. Fitur Rapid Trigger memungkinkan input berhenti seketika saat tombol dilepas, memberikan keuntungan counter-strafing maksimal. Sudah di-upgrade ke case aluminium Tofu60 Redux premium.",
      defectNotes: "Fisik sangat mulus terawat, fungsi magnetic switch telah dikalibrasi via web app Wootility dan lolos uji responsivitas 100%.",
      price: 3850000,
      originalNewPrice: 4900000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 4,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-vortex-gt8",
      code: "HG-PRD-003",
      slug: "vortexseries-gt8-tri-mode-silent-peach",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "VORTEXSERIES",
      name: "VortexSeries GT-8 Gasket Mount Tri-Mode Wireless",
      subtitle: "Outemu Silent Peach Switch · Hotswap RGB · Baik",
      category: "KEYBOARD",
      condition: "Baik",
      usageDuration: "6 bulan",
      switchOrVariant: "Outemu Silent Peach Linear (Ultra Quiet)",
      completeness: "Unit keyboard, kabel USB-C paracord, dongle wireless 2.4Ghz, replacement box packing aman Hingo",
      description: "Keyboard 75% gasket mount dengan peredaman suara maksimal cocok untuk kantor atau streaming larut malam tanpa berisik. Koneksi 3 mode (Bluetooth, 2.4Ghz, Wired).",
      defectNotes: "Ada goresan halus di bagian bawah dekat rubber feet karena pemakaian wajar, keycap dan switch fungsi 100% normal.",
      price: 680000,
      originalNewPrice: 950000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 4.8,
      soldCount: 1,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },

    // --- MOUSE ---
    {
      id: "prod-gpx-superlight-2",
      code: "HG-PRD-004",
      slug: "logitech-g-pro-x-superlight-2-wireless-white",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "LOGITECH",
      name: "Logitech G Pro X Superlight 2 Wireless Gaming Mouse",
      subtitle: "Hero 2 Sensor 32K DPI · White Edition · Sangat baik",
      category: "MOUSE",
      condition: "Sangat baik",
      usageDuration: "1 bulan",
      switchOrVariant: "Lightforce Hybrid Optical-Mechanical Switches",
      completeness: "Fullset box, grip tape original (belum dipasang), dongle Lightspeed, extender USB, kabel Type-C, PTFE skate mulus",
      description: "Mouse esport standar atlet pro dunia berbobot hanya 60 gram. Dilengkapi sakelar hybrid Lightforce untuk kecepatan optik dengan sentuhan mekanis klik yang renyah. Baterai tahan hingga 95 jam.",
      defectNotes: "Kondisi 99% seperti baru, warna putih bersih bebas noda, tidak ada double click, scroll wheel akurat 100%.",
      price: 1850000,
      originalNewPrice: 2499000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 5,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-razer-viper-v3",
      code: "HG-PRD-005",
      slug: "razer-viper-v3-pro-wireless-8k",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "RAZER",
      name: "Razer Viper V3 Pro Ultra-lightweight Wireless Mouse",
      subtitle: "Focus Pro 35K Gen-2 · True 8000Hz Polling Rate · Sangat baik",
      category: "MOUSE",
      condition: "Sangat baik",
      usageDuration: "2 minggu",
      switchOrVariant: "Razer Optical Mouse Switches Gen-3 (90M clicks)",
      completeness: "Fullset box lengkap, HyperPolling 8K wireless dongle, kabel Speedflex USB-C, sticker Razer",
      description: "Mouse flagship generasi terbaru dari Razer seberat 54 gram. Sensor Focus Pro 35K Gen-2 dengan akurasi 99.8% dan dukungan 8000Hz polling rate nirkabel untuk pergerakan kursor termulus di monitor 240Hz/360Hz.",
      defectNotes: "Like New (kondisi pajangan review), pemakaian baru 2 minggu, bodi bebas goresan, sensor optik lolos uji tracking speed.",
      price: 2150000,
      originalNewPrice: 2899000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 3,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-pulsar-x2v2",
      code: "HG-PRD-006",
      slug: "pulsar-x2v2-wireless-gaming-mouse-size2",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "PULSAR",
      name: "Pulsar X2V2 Wireless Gaming Mouse Size 2 Medium",
      subtitle: "Optical Switches · PAW3395 Sensor · Black · Baik",
      category: "MOUSE",
      condition: "Baik",
      usageDuration: "4 bulan",
      switchOrVariant: "Optical Light Switches + Dustproof Pulsar Blue Encoder",
      completeness: "Unit mouse, dongle wireless 2.4Ghz, kabel paracord, box original",
      description: "Mouse simetris ergonomis claw grip terfavorit komunitas. Sensor PAW3395 26.000 DPI yang hemat daya dengan encoder scroll tahan debu.",
      defectNotes: "Ada sedikit kilau bekas sentuhan jari (shine mark) di tombol klik kiri, fungsi sensor dan skate Obsidian terpasang rapi.",
      price: 1050000,
      originalNewPrice: 1450000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 4.9,
      soldCount: 2,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },

    // --- HEADSET ---
    {
      id: "prod-arctis-nova-pro",
      code: "HG-PRD-007",
      slug: "steelseries-arctis-nova-pro-wireless-dac",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "STEELSERIES",
      name: "SteelSeries Arctis Nova Pro Wireless Gaming Headset",
      subtitle: "Dual Battery Swappable · Base Station DAC · Sangat baik",
      category: "HEADSET",
      condition: "Sangat baik",
      usageDuration: "3 bulan",
      switchOrVariant: "Active Noise Cancelling (ANC) + Hi-Res Audio Drivers",
      completeness: "Fullset box, GameDAC Gen 2 Base Station, 2 baterai original, kabel 3.5mm, kabel USB, pouch",
      description: "Headset gaming wireless tercanggih di pasaran. Dilengkapi sistem baterai ganda yang dapat ditukar tanpa mematikan perangkat (hot-swap), ANC 4-mic hybrid, dan sonar parametric EQ.",
      defectNotes: "Earpad kulit sintetis masih sangat empuk dan bersih, GameDAC layar OLED bening bebas gores, fungsi mikrofon jernih 100%.",
      price: 4250000,
      originalNewPrice: 5800000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 1,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-hyperx-cloud-3",
      code: "HG-PRD-008",
      slug: "hyperx-cloud-iii-wireless-gaming-headset",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "HYPERX",
      name: "HyperX Cloud III Wireless Gaming Headset Black/Red",
      subtitle: "120-Hour Battery · 53mm Angled Drivers · Sangat baik",
      category: "HEADSET",
      condition: "Sangat baik",
      usageDuration: "2 bulan",
      switchOrVariant: "DTS Headphone:X Spatial Audio",
      completeness: "Fullset box, detachable mic dengan mesh filter, USB dongle, USB-C to USB-A adapter",
      description: "Kenyamanan legendaris seri Cloud dengan daya tahan baterai fenomenal hingga 120 jam pemakaian non-stop. Driver miring 53mm menghasilkan staging audio kompetitif akurat.",
      defectNotes: "Fisik 98% mulus terawat, headband aluminium kokoh, busa memory foam empuk tanpa retak.",
      price: 1650000,
      originalNewPrice: 2399000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 4.9,
      soldCount: 3,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },

    // --- MONITOR ---
    {
      id: "prod-rog-pg27aqdm",
      code: "HG-PRD-009",
      slug: "asus-rog-swift-oled-pg27aqdm-240hz",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "ASUS",
      name: "ASUS ROG Swift OLED PG27AQDM Gaming Monitor 27\"",
      subtitle: "1440p QHD · 240Hz 0.03ms OLED Panel · Sangat baik",
      category: "MONITOR",
      condition: "Sangat baik",
      usageDuration: "4 bulan",
      switchOrVariant: "Anti-Glare Micro-texture Coating + Custom Heatsink",
      completeness: "Fullset box original lengkap, stand tripod ROG, power brick, kabel DisplayPort, kabel HDMI, sertifikat kalibrasi pabrik",
      description: "Monitor gaming impian setiap pro gamer. Panel OLED 27 inci 1440p dengan refresh rate 240Hz dan response time kilat 0.03ms. Dilengkapi custom heatsink pintar dan voltage optimization untuk mencegah burn-in.",
      defectNotes: "Layar 0 dead pixel, 0 burn-in (lolos uji software DisplayTest 100% white/black screen), bezel dan stand mulus terawat.",
      price: 13900000,
      originalNewPrice: 18500000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 1,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-zowie-xl2546k",
      code: "HG-PRD-010",
      slug: "benq-zowie-xl2546k-240hz-dyac-plus",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "BENQ",
      name: "BenQ ZOWIE XL2546K Esports Gaming Monitor 24.5\"",
      subtitle: "Fast TN · 240Hz DyAc+ Motion Clarity · Sangat baik",
      category: "MONITOR",
      condition: "Sangat baik",
      usageDuration: "5 bulan",
      switchOrVariant: "DyAc+ Technology + Black eQualizer + Color Vibrance",
      completeness: "Fullset box, S-Switch remote control, pelindung shield samping (kiri & kanan), dust cover, kabel DP",
      description: "Monitor resmi turnamen major CS:GO/CS2 dan Valorant Champions. Teknologi DyAc+ menghilangkan motion blur saat spraying senjata.",
      defectNotes: "Fisik sangat prima, tidak ada scratch pada panel maupun bodi, tombol joystick dan S-Switch empuk normal.",
      price: 6200000,
      originalNewPrice: 8400000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 2,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },

    // --- ACCESSORIES ---
    {
      id: "prod-artisan-hayate",
      code: "HG-PRD-011",
      slug: "artisan-ninja-fx-hayate-otsu-xsoft-xl",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "ARTISAN",
      name: "Artisan Ninja FX Hayate Otsu XSoft XL Mousepad",
      subtitle: "Color: Wine Red · Mid/High Speed Hybrid Pad · Sangat baik",
      category: "ACCESSORIES",
      condition: "Sangat baik",
      usageDuration: "1 bulan",
      switchOrVariant: "XSoft Poron Sponge Base 4mm (Made in Japan)",
      completeness: "Unit mousepad dalam kemasan cardboard sleeve original Artisan datar (tidak pernah digulung)",
      description: "Mousepad artisan buatan tangan dari Jepang dengan material Poron sponge premium. Menawarkan kontrol mikro presisi dengan stopping power terbaik untuk pemain sniper dan tracking cepat.",
      defectNotes: "Permukaan kain sangat bersih bebas debu/minyak, jahitan tepi terkunci rapat tidak ada benang berserabut.",
      price: 790000,
      originalNewPrice: 1150000,
      stock: 1,
      location: "Jakarta Selatan",
      rating: 5.0,
      soldCount: 4,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
    {
      id: "prod-coiled-cable",
      code: "HG-PRD-012",
      slug: "custom-coiled-cable-aviator-black-gold",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brand: "HINGO",
      name: "Custom Coiled Aviator Cable Mechanical Keyboard",
      subtitle: "Paracord Black & Gold + Techflex · Metal GX16 Aviator · Sangat baik",
      category: "ACCESSORIES",
      condition: "Sangat baik",
      usageDuration: "1 bulan",
      switchOrVariant: "Type-C to USB-A Gold Plated Terminals",
      completeness: "Unit kabel coiled lengkap dengan pouch serut pelindung",
      description: "Kabel coiled premium berlapis ganda (Paracord + Techflex) dengan konektor aviator logam GX16 kokoh untuk melengkapi estetika setup meja gaming.",
      defectNotes: "Gulungan spiral koil rapat dan elastis, konektor metal mengkilap bebas oksidasi.",
      price: 1950000,
      originalNewPrice: 299000,
      stock: 3,
      location: "Jakarta Selatan",
      rating: 4.9,
      soldCount: 6,
      isVerifiedByTeam: true,
      images: [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
      ],
      status: "AVAILABLE",
    },
  ];

  for (const p of productsData) {
    const { images, ...productFields } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        ...productFields,
        images: JSON.stringify(images),
      },
      create: {
        ...productFields,
        images: JSON.stringify(images),
      },
    });

    try {
      const sbPayload: any = {
        id: p.id,
        code: p.code,
        slug: p.slug,
        seller_id: p.sellerId,
        seller_email: p.sellerEmail,
        brand: p.brand,
        name: p.name,
        subtitle: p.subtitle,
        category: p.category,
        condition: p.condition,
        usage_duration: p.usageDuration,
        switch_or_variant: p.switchOrVariant,
        completeness: p.completeness,
        description: p.description,
        defect_notes: p.defectNotes,
        price: p.price,
        original_new_price: p.originalNewPrice,
        stock: p.stock,
        location: p.location,
        rating: p.rating,
        sold_count: p.soldCount,
        is_verified_by_team: p.isVerifiedByTeam,
        images: images,
        status: p.status,
      };

      let { error } = await supabase.from("products").upsert(sbPayload);
      if (error && error.message?.includes("seller_email")) {
        delete sbPayload.seller_email;
        await supabase.from("products").upsert(sbPayload);
      }
    } catch (e) {
      console.warn("Supabase product sync notice:", e);
    }
  }

  // =========================================================================
  // 3. SEED CONSIGNMENTS (4 Items in Various Lifecycle Stages)
  // =========================================================================
  console.log("3. Seeding Consignments...");

  const consignmentsData = [
    {
      id: "csg-razer-huntsman",
      code: "HG-261101-482",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      category: "KEYBOARD",
      brandModel: "Razer Huntsman V3 Pro TKL",
      variantSpec: "Gen-2 Analog Optical Switches",
      usageDuration: "2 bulan",
      additionalSpecs: "Rapid Trigger adjustable 0.1mm - 4.0mm, textured doubleshot PBT keycaps",
      currentCondition: "Bekas · mulus terawat 99%",
      defectDetails: "Tidak ada cacat fungsi. LED dan rotary dial berfungsi normal.",
      completeness: "Unit lengkap box original, magnetic wrist rest kulit, kabel USB-C braided",
      photos: ["https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"],
      expectedPrice: 2800000,
      proposedPrice: 2750000,
      consignmentFeePercent: 8,
      consignmentFeeAmount: 220000,
      adminHandlingFee: 19000,
      estimatedNetPayout: 2511000,
      actualNetPayout: 2511000,
      originCity: "Jakarta Selatan",
      handoverMethod: "Kirim ke Gudang Hingo via kurir ekspedisi",
      inboundCourier: "JNE REG",
      inboundTrackingNumber: "JNE2209148201",
      stage: "PRICE_AGREED_MARKETING",
      actionActor: "COMPLETED",
      badgeLabel: "Sedang dipasarkan",
      statusSummary: "Barang lolos uji kurasi dan inspeksi fisik 100%. Resmi tayang di katalog belanja Hingo.",
      timeline: [
        { stepOrder: 1, title: "Pengajuan titip jual diterima", description: "Formulir online dan foto telah diterima tim kurator.", timestampText: "1 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 2, title: "Lolos kurasi online", description: "Foto spesifikasi disetujui, seller mengirimkan barang ke gudang.", timestampText: "2 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 3, title: "Inspeksi fisik lolos", description: "Unit diterima di warehouse Hingo dan lolos uji fungsi switch 100%.", timestampText: "4 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 4, title: "Harga disepakati & tayang", description: "Barang resmi tayang di katalog seharga Rp2.750.000.", timestampText: "5 Nov · Aktif", state: "CURRENT" },
      ],
    },
    {
      id: "csg-sennheiser-hd660s2",
      code: "HG-261105-194",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      category: "HEADSET",
      brandModel: "Sennheiser HD 660S2 Open-Back",
      variantSpec: "300 Ohm Audiophile Grade Dynamic Drivers",
      usageDuration: "3 bulan",
      additionalSpecs: "Kabel balance 4.4mm Pentaconn dan kabel 6.35mm original",
      currentCondition: "Bekas · berfungsi normal",
      defectDetails: "Velour earpad bersih, tidak ada kendala suara balance kiri dan kanan.",
      completeness: "Fullset box, kabel 6.35mm, kabel 4.4mm, adapter 3.5mm",
      photos: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=900&auto=format&fit=crop"],
      expectedPrice: 5500000,
      proposedPrice: 5300000,
      consignmentFeePercent: 8,
      consignmentFeeAmount: 424000,
      adminHandlingFee: 19000,
      estimatedNetPayout: 4857000,
      actualNetPayout: null,
      originCity: "Jakarta Selatan",
      handoverMethod: "Kirim ke Gudang Hingo via kurir ekspedisi",
      inboundCourier: "SiCepat BEST",
      inboundTrackingNumber: "003928174829",
      stage: "RECEIVED_AT_HINGO",
      actionActor: "HINGO",
      badgeLabel: "Sedang diinspeksi gudang",
      statusSummary: "Paket telah tiba di Gudang Hingo Jakarta Selatan. Tim teknisi sedang menguji respon frekuensi audio.",
      timeline: [
        { stepOrder: 1, title: "Pengajuan titip jual diterima", description: "Formulir online diterima tim Hingo.", timestampText: "5 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 2, title: "Lolos kurasi online", description: "Seller mengirim unit ke warehouse Hingo via SiCepat.", timestampText: "6 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 3, title: "Unit tiba & inspeksi teknis", description: "Barang sedang diuji fisik dan audio oleh teknisi Hingo.", timestampText: "Hari ini · Dalam proses", state: "CURRENT" },
      ],
    },
    {
      id: "csg-finalmouse-ulx",
      code: "HG-261108-771",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      category: "MOUSE",
      brandModel: "Finalmouse UltralightX Lion (Medium) Guardian",
      variantSpec: "Carbon Fiber Composite Chassis 35g",
      usageDuration: "1 bulan",
      additionalSpecs: "Batch 2 firmware ter-update, polling rate wireless 4000Hz",
      currentCondition: "Bekas · mulus terawat 99%",
      defectDetails: "Sangat mulus tanpa goresan, klik omron optical renyah.",
      completeness: "Fullset box original collector edition, dongle, kabel Type-C",
      photos: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=900&auto=format&fit=crop"],
      expectedPrice: 3200000,
      proposedPrice: null,
      consignmentFeePercent: 8,
      consignmentFeeAmount: 256000,
      adminHandlingFee: 19000,
      estimatedNetPayout: 2925000,
      actualNetPayout: null,
      originCity: "Jakarta Selatan",
      handoverMethod: "Kirim ke Gudang Hingo via kurir ekspedisi",
      inboundCourier: null,
      inboundTrackingNumber: null,
      stage: "ONLINE_CHECK_PASSED",
      actionActor: "SELLER",
      badgeLabel: "Lolos kurasi online, kirim fisik",
      statusSummary: "Foto dan spesifikasi disetujui kurator! Silakan kirimkan unit fisik ke alamat Gudang Hingo Jakarta.",
      timeline: [
        { stepOrder: 1, title: "Pengajuan titip jual diterima", description: "Data spesifikasi dikirim seller.", timestampText: "8 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 2, title: "Kurasi foto lolos", description: "Foto fisik jelas dan sesuai standar kurasi Hingo.", timestampText: "9 Nov · Selesai", state: "COMPLETED" },
        { stepOrder: 3, title: "Menunggu pengiriman unit fisik", description: "Silakan masukkan nomor resi kirim ke gudang Hingo.", timestampText: "Menunggu tindakan seller", state: "CURRENT" },
      ],
    },
    {
      id: "csg-wooting-80he",
      code: "HG-261110-305",
      sellerId: "user-seller-1",
      sellerEmail: "seller1@gmail.com",
      brandModel: "Wooting 80HE Hall Effect Keyboard",
      category: "KEYBOARD",
      variantSpec: "80% Layout PCR Plastic White Case",
      usageDuration: "1 minggu",
      additionalSpecs: "True 8000Hz polling rate, Lekker Switch V2",
      currentCondition: "Bekas · berfungsi normal",
      defectDetails: "Unit baru buka segel, tested 100% normal.",
      completeness: "Fullset box original lengkap tanpa minus",
      photos: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=900&auto=format&fit=crop"],
      expectedPrice: 4100000,
      proposedPrice: null,
      consignmentFeePercent: 8,
      consignmentFeeAmount: 328000,
      adminHandlingFee: 19000,
      estimatedNetPayout: 3753000,
      actualNetPayout: null,
      originCity: "Jakarta Selatan",
      handoverMethod: "Kirim ke Gudang Hingo via kurir ekspedisi",
      inboundCourier: null,
      inboundTrackingNumber: null,
      stage: "ONLINE_CHECK",
      actionActor: "HINGO",
      badgeLabel: "Menunggu kurasi online",
      statusSummary: "Pengajuan telah masuk antrean kurasi. Tim kurator Hingo sedang memeriksa keaslian foto dalam 1x24 jam.",
      timeline: [
        { stepOrder: 1, title: "Pengajuan titip jual diterima", description: "Data spesifikasi dan foto gear berhasil dikirimkan.", timestampText: "Kemarin · Baru saja", state: "CURRENT" },
      ],
    },
  ];

  for (const c of consignmentsData) {
    const { timeline, photos, ...consignmentFields } = c;

    const item = await prisma.consignmentItem.upsert({
      where: { id: c.id },
      update: {
        ...consignmentFields,
        photos: JSON.stringify(photos),
      },
      create: {
        ...consignmentFields,
        photos: JSON.stringify(photos),
      },
    });

    // Clear old timeline & re-add
    await prisma.consignmentTimeline.deleteMany({ where: { consignmentId: item.id } });
    for (const t of timeline) {
      await prisma.consignmentTimeline.create({
        data: {
          consignmentId: item.id,
          stepOrder: t.stepOrder,
          title: t.title,
          description: t.description,
          timestampText: t.timestampText,
          state: t.state,
        },
      });
    }

    try {
      const sbPayload: any = {
        id: c.id,
        code: c.code,
        seller_id: c.sellerId,
        seller_email: c.sellerEmail,
        category: c.category,
        brand_model: c.brandModel,
        variant_spec: c.variantSpec,
        usage_duration: c.usageDuration,
        current_condition: c.currentCondition,
        completeness: c.completeness,
        photos: photos,
        expected_price: c.expectedPrice,
        proposed_price: c.proposedPrice,
        consignment_fee: c.consignmentFeeAmount,
        estimated_net_payout: c.estimatedNetPayout,
        origin_city: c.originCity,
        stage: c.stage,
        badge_label: c.badgeLabel,
        status_summary: c.statusSummary,
      };

      let { error } = await supabase.from("consignments").upsert(sbPayload);
      if (error && error.message?.includes("seller_email")) {
        delete sbPayload.seller_email;
        await supabase.from("consignments").upsert(sbPayload);
      }
    } catch (e) {
      console.warn("Supabase consignment sync notice:", e);
    }
  }

  // =========================================================================
  // 4. SEED ORDERS (1 Active Escrow Checking + 1 Completed Order)
  // =========================================================================
  console.log("4. Seeding Orders...");

  const ordersData = [
    {
      id: "ord-superlight-active",
      orderCode: "GRL-20261108-8421",
      buyerId: "user-buyer-1",
      buyerEmail: "buyer1@gmail.com",
      productId: "prod-gpx-superlight-2",
      addressId: "addr-buyer-1",
      itemPrice: 1850000,
      shippingCourier: "JNE REG",
      shippingCost: 18000,
      shippingProtection: 5000,
      serviceFee: 2500,
      totalAmount: 1875500,
      paymentMethod: "BCA_VA",
      vaNumber: "8801 081234567892",
      buyerNote: "Tolong bubble wrap tebal ya min.",
      trackingNumber: "JNE2201040842",
      escrowStatus: "HELD_BY_HINGO",
      orderStatus: "DELIVERED_CHECKING",
      inspectionDeadline: "48 jam setelah paket tiba (Sisa waktu: 34 jam)",
      timeline: [
        { stepOrder: 1, title: "Pembayaran terverifikasi", description: "Dana Rp1.875.500 berhasil diamankan di rekening rekber Hingo.", timestampText: "8 Nov 14:20 WIB", isCompleted: true },
        { stepOrder: 2, title: "Pesanan dikemas & dikirim", description: "Paket diserahkan ke JNE REG dengan resi JNE2201040842.", timestampText: "9 Nov 10:15 WIB", isCompleted: true },
        { stepOrder: 3, title: "Paket tiba & masa uji 48 jam dimulai", description: "Silakan periksa fisik & fungsi mouse sebelum dana diteruskan ke seller.", timestampText: "10 Nov 09:30 WIB", isCompleted: false },
      ],
    },
    {
      id: "ord-artisan-completed",
      orderCode: "GRL-20261102-1953",
      buyerId: "user-buyer-1",
      buyerEmail: "buyer1@gmail.com",
      productId: "prod-artisan-hayate",
      addressId: "addr-buyer-1",
      itemPrice: 790000,
      shippingCourier: "SiCepat BEST",
      shippingCost: 22000,
      shippingProtection: 5000,
      serviceFee: 2500,
      totalAmount: 819500,
      paymentMethod: "QRIS",
      vaNumber: null,
      buyerNote: "Jangan ditekuk saat kirim.",
      trackingNumber: "002938104819",
      escrowStatus: "RELEASED_TO_SELLER",
      orderStatus: "COMPLETED",
      inspectionDeadline: "Selesai",
      timeline: [
        { stepOrder: 1, title: "Pembayaran terverifikasi", description: "Pembayaran QRIS Rp819.500 berhasil diverifikasi instan.", timestampText: "2 Nov 11:00 WIB", isCompleted: true },
        { stepOrder: 2, title: "Paket dikirim", description: "Paket dikirim via SiCepat BEST.", timestampText: "3 Nov 13:00 WIB", isCompleted: true },
        { stepOrder: 3, title: "Pesanan selesai & dana dilepas", description: "Pembeli telah konfirmasi penerimaan barang. Dana telah ditransfer ke seller.", timestampText: "5 Nov 16:45 WIB", isCompleted: true },
      ],
    },
  ];

  for (const o of ordersData) {
    const { timeline, ...orderFields } = o;
    const ord = await prisma.order.upsert({
      where: { id: o.id },
      update: orderFields,
      create: orderFields,
    });

    await prisma.orderTimeline.deleteMany({ where: { orderId: ord.id } });
    for (const t of timeline) {
      await prisma.orderTimeline.create({
        data: {
          orderId: ord.id,
          stepOrder: t.stepOrder,
          title: t.title,
          description: t.description,
          timestampText: t.timestampText,
          isCompleted: t.isCompleted,
        },
      });
    }

    try {
      const sbPayload: any = {
        id: o.id,
        order_code: o.orderCode,
        buyer_id: o.buyerId,
        buyer_email: o.buyerEmail,
        product_id: o.productId,
        item_price: o.itemPrice,
        shipping_courier: o.shippingCourier,
        shipping_cost: o.shippingCost,
        shipping_protection: o.shippingProtection,
        service_fee: o.serviceFee,
        total_amount: o.totalAmount,
        payment_method: o.paymentMethod,
        tracking_number: o.trackingNumber,
        escrow_status: o.escrowStatus,
        order_status: o.orderStatus,
      };

      let { error } = await supabase.from("orders").upsert(sbPayload);
      if (error && error.message?.includes("buyer_email")) {
        delete sbPayload.buyer_email;
        await supabase.from("orders").upsert(sbPayload);
      }
    } catch (e) {
      console.warn("Supabase order sync notice:", e);
    }
  }

  // =========================================================================
  // 5. SEED CART & WISHLIST FOR DEMO BUYER
  // =========================================================================
  console.log("5. Seeding Cart & Wishlist...");

  // Wishlist: Keychron Q1 & Wooting 60HE
  await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId: "user-buyer-1", productId: "prod-keychron-q1" },
    },
    update: {},
    create: {
      userId: "user-buyer-1",
      userEmail: "buyer1@gmail.com",
      productId: "prod-keychron-q1",
    },
  });

  // Cart: Custom Coiled Aviator Cable
  await prisma.cartItem.upsert({
    where: { id: "cart-item-cable" },
    update: { quantity: 1, selected: true },
    create: {
      id: "cart-item-cable",
      userId: "user-buyer-1",
      userEmail: "buyer1@gmail.com",
      productId: "prod-coiled-cable",
      quantity: 1,
      selected: true,
    },
  });

  console.log("=== SEEDING COMPLETED SUCCESSFULLY! ===");
  console.log("Summary:");
  console.log("- 3 Users (Admin, Seller, Buyer)");
  console.log("- 12 Products across all 5 categories (Available in Catalog)");
  console.log("- 4 Consignments with complete timelines (Available in Seller Hub & Admin)");
  console.log("- 2 Orders with Escrow tracking (1 Active Inspection + 1 Completed)");
  console.log("- 1 Cart Item & 1 Wishlist Item for demo buyer");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
