const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Test raw SQL to check version
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('✓ Connection works');
    console.log('  PostgreSQL:', version[0].version.substring(0, 60));
    
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    console.log('✓ Tables in database:', tables.length);
    if (tables.length > 0) {
      console.log('  Tables found:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('  No tables created yet - migration may be stuck or pending');
    }
  } catch (e) {
    console.log('✗ Error:', e.message.substring(0, 150));
  } finally {
    await prisma.$disconnect();
  }
})();
