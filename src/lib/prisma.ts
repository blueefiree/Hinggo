import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Ensure database file is writable on Vercel Serverless
if (process.env.VERCEL) {
  const tmpDbPath = "/tmp/dev.db";
  if (!fs.existsSync(tmpDbPath)) {
    try {
      const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDbPath);
      }
    } catch (e) {
      console.warn("Could not copy dev.db to /tmp:", e);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl:
      process.env.VERCEL && fs.existsSync("/tmp/dev.db")
        ? "file:/tmp/dev.db"
        : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
