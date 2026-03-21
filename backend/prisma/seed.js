const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");

const prisma = new PrismaClient();

async function main() {
  const demoEmail = "demo@facedetector.local";
  const demoName = "CyberDemo";
  const demoPassword = "demo12345";

  const existing = await prisma.user.findFirst({
    where: { email: { equals: demoEmail, mode: "insensitive" } },
    select: { id: true },
  });

  if (existing) {
    console.log("Seed skipped: demo user already exists.");
    return;
  }

  const hash = await argon2.hash(demoPassword, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: demoName,
        email: demoEmail,
        entries: 0,
      },
    });

    await tx.login.create({
      data: {
        id: created.id,
        email: demoEmail,
        hash,
      },
    });

    return created;
  });

  console.log(`Seed complete: created demo user ${user.name} (id=${user.id}).`);
}

main()
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
