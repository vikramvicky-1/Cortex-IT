import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.project.update({
    where: { slug: 'dailydocket' },
    data: { logo: '/dailydocket.png' }
  });
  console.log(`Updated "${result.title}" logo to: ${result.logo}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
