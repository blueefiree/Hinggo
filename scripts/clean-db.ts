import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning all dummy data and products from DB...");
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.orderTimeline.deleteMany({});
  await prisma.disputeReport.deleteMany({});
  await prisma.payout.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.consignmentTimeline.deleteMany({});
  await prisma.consignmentItem.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatThread.deleteMany({});
  await prisma.product.deleteMany({});

  const productCount = await prisma.product.count();
  console.log(`Pembersihan database selesai! Jumlah Product di database: ${productCount}`);
}

clean()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

