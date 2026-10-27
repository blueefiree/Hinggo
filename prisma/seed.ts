import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hingo database...");

  // 1. User: Naya Putri
  const naya = await prisma.user.upsert({
    where: { email: "naya.putri@example.com" },
    update: {},
    create: {
      id: "user-naya",
      name: "Naya Putri",
      phone: "+62 812 3456 7890",
      email: "naya.putri@example.com",
      city: "Bandung",
      role: "USER",
      phoneVerified: true,
      kycStatus: "PENDING_REVIEW",
    },
  });

  // 2. KYC Document
  await prisma.kycDocument.upsert({
    where: { userId: naya.id },
    update: {},
    create: {
      userId: naya.id,
      fullNameKtp: "Naya Putri",
      maskedNik: "•••• •••• •••• 0842",
      ktpFileName: "ktp_naya.jpg",
      ktpFileSize: "1,8 MB",
      selfieFileName: "selfie_naya.jpg",
      selfieFileSize: "2,1 MB",
      status: "PENDING_REVIEW",
    },
  });

  // 3. Address
  const primaryAddress = await prisma.address.create({
    data: {
      userId: naya.id,
      label: "Rumah",
      isPrimary: true,
      recipientName: "Naya Putri",
      phone: "0812 3456 7890",
      fullAddress:
        "Jl. Melati No. 18, RT 003/RW 005, Tebet, Jakarta Selatan, DKI Jakarta 12810",
      city: "Jakarta Selatan",
    },
  });

  // 4. Products
  const k2 = await prisma.product.upsert({
    where: { code: "K2-0842" },
    update: {},
    create: {
      code: "K2-0842",
      slug: "keychron-k2-v2",
      brand: "KEYCHRON",
      name: "Keychron K2 V2",
      category: "KEYBOARD",
      subtitle: "Wireless mechanical keyboard · Brown switch",
      condition: "SANGAT_BAIK",
      usageDuration: "8 bulan",
      switchOrVariant: "Gateron Brown",
      completeness: "Box, kabel, keycap puller",
      description:
        "Keyboard pribadi, bukan bekas warnet. Semua tombol, Bluetooth, dan lampu RGB berfungsi normal. Ada gores halus di sisi bawah, tidak terlihat saat dipakai.",
      defectNotes:
        "Ada gores halus di sisi bawah, tidak terlihat saat dipakai.",
      price: 850000,
      originalNewPrice: 1499000,
      rating: 4.9,
      soldCount: 2100,
      stock: 1,
      location: "Jakarta Selatan",
      isVerifiedByTeam: true,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop",
      ]),
    },
  });

  // 5. Consignments
  await prisma.consignmentItem.upsert({
    where: { code: "HG-261018-031" },
    update: {},
    create: {
      code: "HG-261018-031",
      sellerId: naya.id,
      category: "MOUSE",
      brandModel: "Logitech MX Master 3S",
      variantSpec: "Graphite · 8000 DPI Quiet Click",
      usageDuration: "6 bulan",
      additionalSpecs:
        "Baterai awet 70 hari, support Logi Bolt receiver dan Bluetooth triple channel.",
      currentCondition: "Bekas · berfungsi normal",
      defectDetails: "Ada gores halus di sandaran ibu jari karena cincin.",
      completeness: "Mouse unit, Logi Bolt receiver, kabel USB-C original.",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop",
      ]),
      expectedPrice: 1000000,
      proposedPriceAfterInspection: 950000,
      consignmentFee: 95000,
      estimatedNetPayout: 855000,
      originCity: "Bandung",
      handoverMethod: "Kirim via JNE REG",
      inboundCourier: "JNE REG",
      inboundTrackingNumber: "HGO261020031",
      stage: "INSPECTION_COMPLETED",
      actionActor: "SELLER",
      badgeLabel: "Tinjau hasil inspeksi",
      statusSummary: "Inspeksi fisik selesai, usulan harga Rp950.000",
    },
  });

  // 6. Active Escrow Order
  await prisma.order.upsert({
    where: { orderCode: "GRL-20261022-0842" },
    update: {},
    create: {
      orderCode: "GRL-20261022-0842",
      buyerId: naya.id,
      productId: k2.id,
      addressId: primaryAddress.id,
      itemPrice: 850000,
      shippingCourier: "JNE REG",
      shippingCost: 18000,
      shippingProtection: 5000,
      serviceFee: 2500,
      totalAmount: 875500,
      paymentMethod: "BCA_VA",
      buyerNote: "Mohon bubble wrap tambahan, ya.",
      trackingNumber: "JNE2201040842",
      escrowStatus: "HELD_BY_HINGO",
      orderStatus: "DELIVERED_CHECKING",
      inspectionDeadline: "26 Okt 2026, 14.00 WIB",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
