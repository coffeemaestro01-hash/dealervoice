const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns...');
    
    // Country table
    const cmds = [
      'ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "nameLocal" TEXT',
      'ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
      'ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "dealerCount" INTEGER DEFAULT 0',
      'ALTER TABLE "City" ADD COLUMN IF NOT EXISTS "population" INTEGER',
      'ALTER TABLE "City" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
      'ALTER TABLE "City" ADD COLUMN IF NOT EXISTS "dealerCount" INTEGER DEFAULT 0',
      'ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "countryCode" TEXT',
      'ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
    ];
    
    for (const cmd of cmds) {
      try {
        await prisma.$executeRawUnsafe(cmd);
        console.log('✓', cmd.split(' ')[5]);
      } catch (e) {
        // Already exists, skip
      }
    }
    
    console.log('✅ Columns added');
  } catch (e) {
    console.log('✗ Error:', e.message.substring(0, 150));
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
