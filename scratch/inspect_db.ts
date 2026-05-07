import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("--- Projects ---");
  const projects = await prisma.project.findMany();
  projects.forEach(p => {
    console.log(`ID: ${p.id}, Title: ${p.title}, Logo: ${p.logo}`);
  });

  console.log("\n--- Partners ---");
  const partners = await prisma.partner.findMany();
  partners.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.name}, LogoUrl: ${p.logoUrl}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
