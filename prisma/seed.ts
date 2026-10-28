import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (ONLY Admin user, ZERO dummy products/transactions)...");

  // Seed Admin user
  await prisma.user.upsert({
    where: { id: "user-admin" },
    update: {
      name: "Admin Hingo",
      role: "ADMIN",
      kycStatus: "VERIFIED",
      phoneVerified: true,
    },
    create: {
      id: "user-admin",
      name: "Admin Hingo",
      email: "admin@hingo.id",
      phone: "+6281200000001",
      city: "Jakarta Selatan",
      role: "ADMIN",
      phoneVerified: true,
      kycStatus: "VERIFIED",
    },
  });
  console.log("Admin user seeded successfully!");

  console.log("Database seeded clean with 0 dummy products.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
