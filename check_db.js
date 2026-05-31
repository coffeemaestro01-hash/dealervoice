const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.hnzkheobcnutsuddgrpb:Dms@27041995!!!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
    }
  }
});

(async () => {
  try {
    console.log('Testing connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Connection successful');
    
    try {
      const migrations = await prisma.$queryRaw`SELECT * FROM _prisma_migrations LIMIT 5`;
      console.log('✓ Migrations table exists:', migrations.length, 'records');
    } catch (e2) {
      console.log('✗ _prisma_migrations table missing (not migrated yet)');
    }
  } catch (e) {
    console.log('✗ Connection failed:', e.message.substring(0, 150));
  } finally {
    await prisma.$disconnect();
  }
})();
