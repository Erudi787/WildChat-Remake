import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cit.edu";
  const adminPassword = process.env.ADMIN_PASSWORD || "wildchat-admin-2026";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      profile: {
        create: {
          displayName: "WildChat Admin",
        },
      },
    },
  });

  console.log(`Admin user ready: ${admin.username} (${admin.role})`);

  // Ensure all pre-existing users are ACTIVE
  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "User" SET status = 'ACTIVE' WHERE status = 'PENDING' AND role = 'USER'`
  );
  if (updated > 0) {
    console.log(`Set ${updated} existing user(s) to ACTIVE status`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
