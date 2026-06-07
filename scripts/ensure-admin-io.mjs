/**
 * Ensure admin@dealervoice.io exists with SUPER_ADMIN role.
 * Run: node --env-file=.env.local scripts/ensure-admin-io.mjs
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = "admin@dealervoice.io";
const password = "Admin@123!";

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log("Already exists:", email, existing.role);
  await prisma.$disconnect();
  process.exit(0);
}

const legacy = await prisma.user.findUnique({ where: { email: "admin@dealervoice.com" } });

await prisma.user.create({
  data: {
    name: "Super Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    emailVerified: new Date(),
    avatarUrl: legacy?.avatarUrl ?? null,
  },
});

console.log(`Created ${email} / ${password}`);
await prisma.$disconnect();
