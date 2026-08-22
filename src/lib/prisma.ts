import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** SQLite on Vercel is read-only in the bundle — copy to /tmp so login and writes work. */
function prepareDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }

  const url = process.env.DATABASE_URL;
  if (!process.env.VERCEL || !url.startsWith("file:")) return;

  const tmp = "/tmp/infusion.db";
  if (!fs.existsSync(tmp)) {
    const bundled = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(process.cwd(), "dev.db"),
    ].find((candidate) => fs.existsSync(candidate));
    if (bundled) {
      fs.copyFileSync(bundled, tmp);
    }
  }
  process.env.DATABASE_URL = `file:${tmp}`;
}

prepareDatabaseUrl();

/** Singleton Prisma client — prevents connection exhaustion in dev hot-reload */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
