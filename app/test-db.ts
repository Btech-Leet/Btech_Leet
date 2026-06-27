import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(resources, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
