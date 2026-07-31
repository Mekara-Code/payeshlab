import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  payeshLabPrisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function getPrisma() {
  if (!globalForPrisma.payeshLabPrisma) {
    globalForPrisma.payeshLabPrisma = createPrismaClient();
  }

  return globalForPrisma.payeshLabPrisma;
}
