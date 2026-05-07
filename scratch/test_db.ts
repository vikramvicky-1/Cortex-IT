import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("Testing connection to Neon DB...");
  try {
    const startTime = Date.now();
    await prisma.$connect();
    const connectTime = Date.now() - startTime;
    console.log(`Connected successfully in ${connectTime}ms!`);
    
    // Perform a simple query
    const count = await prisma.project.count();
    console.log(`Successfully fetched project count: ${count}`);
  } catch (error) {
    console.error("Failed to connect to the database:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
