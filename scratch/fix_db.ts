import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Updating DailyDocket project logo...");
  const projectResult = await prisma.project.updateMany({
    where: { title: 'DailyDocket' },
    data: { logo: '/dailydocket-main.png' }
  });
  console.log(`Updated ${projectResult.count} project entries.`);

  console.log("Ensuring DailyDocket partner logo is correct...");
  const partnerResult = await prisma.partner.updateMany({
    where: { name: 'DailyDocket' },
    data: { logoUrl: '/dailydocket-main.png' }
  });
  console.log(`Updated ${partnerResult.count} partner entries.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
