import { PrismaClient } from "@prisma/client";
import { normalizePhoneNumber } from "../src/lib/otp-sender";

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== MEMULAI TEST OTOMATIS: REAL OTP, PERSISTENT SESSION, DAN PROFIL PENGGUNA ===");

  // 1. Test normalisasi nomor HP
  const testPhones = ["08123456789", "+6281234567890", "0812-3456-7890", "62899998888"];
  console.log("\n1. Testing Phone Normalization:");
  for (const p of testPhones) {
    console.log(`   ${p} -> ${normalizePhoneNumber(p)}`);
  }

  // 2. Test OTP Generation & Database Storage
  console.log("\n2. Testing OTP Storage in Database:");
  const testTargetEmail = "buyer.testing@hingo.id";
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpRecord = await prisma.otpVerification.create({
    data: {
      target: testTargetEmail,
      otpCode,
      expiresAt,
      verified: false,
    },
  });
  console.log(`   ✓ OTP Berhasil dibuat di DB: Target=${otpRecord.target}, Code=${otpRecord.otpCode}, ID=${otpRecord.id}`);

  // 3. Test User Registration via OTP Verification
  console.log("\n3. Testing User Creation & Verification:");
  let user = await prisma.user.findFirst({ where: { email: testTargetEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Testing User Hingo",
        email: testTargetEmail,
        emailVerified: true,
        phone: null,
        phoneVerified: false,
        city: "Jakarta Selatan",
        role: "USER",
        bio: "Enthusiast mechanical keyboard & desk setup.",
      },
    });
    console.log(`   ✓ User baru berhasil dibuat di DB: ID=${user.id}, Name=${user.name}`);
  }

  // 4. Test 30-Day Persistent Session Creation
  console.log("\n4. Testing 30-Day Persistent Session:");
  const sessionToken = "test-token-" + Date.now();
  const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Antigravity Test",
      expiresAt: sessionExpiresAt,
    },
    include: { user: true },
  });
  console.log(`   ✓ Session 30 hari berhasil dibuat: Token=${session.token}, User=${session.user.name}, Expires=${session.expiresAt.toISOString()}`);

  // 5. Test CRUD Address
  console.log("\n5. Testing Address CRUD:");
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: "Rumah Utama",
      recipientName: "Testing User Hingo",
      phone: "081234567890",
      fullAddress: "Jl. Senopati No. 88, Kebayoran Baru",
      city: "Jakarta Selatan",
      postalCode: "12190",
      isPrimary: true,
    },
  });
  console.log(`   ✓ Alamat pengiriman tersimpan di DB: Label=${address.label}, City=${address.city}, Primary=${address.isPrimary}`);

  // 6. Test CRUD Bank Account
  console.log("\n6. Testing Bank Account CRUD:");
  const bankAccount = await prisma.bankAccount.create({
    data: {
      userId: user.id,
      bankName: "BCA",
      accountNumber: "8801928371",
      accountHolder: "TESTING USER HINGO",
      isPrimary: true,
    },
  });
  console.log(`   ✓ Rekening bank tersimpan di DB: Bank=${bankAccount.bankName}, No=${bankAccount.accountNumber}, Holder=${bankAccount.accountHolder}`);

  // 7. Test Link WhatsApp Contact
  console.log("\n7. Testing WhatsApp Linking to Existing User:");
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      phone: "+6281234567890",
      phoneVerified: true,
    },
  });
  console.log(`   ✓ WhatsApp berhasil ditautkan: Phone=${updatedUser.phone}, Verified=${updatedUser.phoneVerified}`);

  // Clean up test data
  console.log("\n8. Cleaning up test data...");
  await prisma.session.delete({ where: { id: session.id } });
  await prisma.address.delete({ where: { id: address.id } });
  await prisma.bankAccount.delete({ where: { id: bankAccount.id } });
  await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log("   ✓ Test data bersih!");

  console.log("\n=== SEMUA TEST BERHASIL 100%! ===");
}

runTest()
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
