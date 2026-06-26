import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "trial@trial.com" } });
  console.log("User found:", !!user);
  if (user) {
    console.log("Email:", user.email);
    console.log("Has password:", !!user.password);
    const valid = await bcrypt.compare("trial123", user.password ?? "");
    console.log("Password trial123 valid:", valid);
  } else {
    const all = await prisma.user.findMany({ select: { email: true } });
    console.log("All users:", all);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
