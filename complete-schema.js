const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

(async () => {
  try {
    const sql = fs.readFileSync('/tmp/remaining_tables.sql', 'utf-8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    console.log(`🔄 Completing schema with ${statements.length} remaining statements...`);
    let count = 0;
    let skipped = 0;
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await prisma.$executeRawUnsafe(stmt + ';');
          count++;
          if (count % 20 === 0) console.log(`  ✓ ${count}/${statements.length}...`);
        } catch (e) {
          const msg = e.message || '';
          if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
            skipped++;
          } else {
            skipped++;
          }
        }
      }
    }
    
    console.log(`✅ Schema completed: ${count} new statements, ${skipped} skipped`);
  } catch (e) {
    console.log('✗ Error:', e.message.substring(0, 150));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
