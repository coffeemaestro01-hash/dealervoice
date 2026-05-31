const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

(async () => {
  try {
    const sql = fs.readFileSync('/tmp/schema.sql', 'utf-8');
    const statements = sql.split(';').filter(s => s.trim());
    
    console.log(`🔄 Applying ${statements.length} SQL statements...`);
    let count = 0;
    let skipped = 0;
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await prisma.$executeRawUnsafe(stmt + ';');
          count++;
          if (count % 50 === 0) console.log(`  ✓ ${count} statements...`);
        } catch (e) {
          const msg = e.message || '';
          if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
            skipped++;
          } else if (msg.includes('does not exist') || msg.includes('ERROR')) {
            // Sometimes column/table doesn't exist, skip
            skipped++;
          } else {
            console.log(`⚠ ${e.code}: ${msg.substring(0, 80)}`);
            skipped++;
          }
        }
      }
    }
    
    console.log(`✅ Applied schema: ${count} statements, ${skipped} skipped`);
  } catch (e) {
    console.log('✗ Fatal error:', e.message.substring(0, 150));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
