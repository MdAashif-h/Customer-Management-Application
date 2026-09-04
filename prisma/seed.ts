import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const name = process.env.SEED_ADMIN_NAME; const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase(); const password = process.env.SEED_ADMIN_PASSWORD;
  if (!name || !email || !password) throw new Error("SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD are required.");
  await prisma.user.upsert({ where: { email }, update: { name, role: "ADMIN", passwordHash: await hash(password, 12) }, create: { name, email, role: "ADMIN", passwordHash: await hash(password, 12) } });
}
main().finally(() => prisma.$disconnect());