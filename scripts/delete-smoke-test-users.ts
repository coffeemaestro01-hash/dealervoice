/**
 * Delete automated smoke-test accounts from production DB.
 * Usage: npm run db:delete-smoke-users
 */
import { loadProjectEnv } from "./load-env";
import { PrismaClient } from "@prisma/client";

loadProjectEnv();

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        startsWith: "dv-smoke-",
        endsWith: "@mailinator.com",
      },
    },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No smoke-test users found.");
    return;
  }

  for (const user of users) {
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Deleted ${user.email}`);
  }

  console.log(`Removed ${users.length} smoke-test user(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
