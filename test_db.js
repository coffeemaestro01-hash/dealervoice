const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.hnzkheobcnutsuddgrpb:Dms@27041995!!!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
});

(async () => {
  try {
    const res = await pool.query('SELECT version()');
    console.log('✓ PostgreSQL connected');
    console.log('  Version:', res.rows[0].version.substring(0, 60));
    
    // Check if any tables exist
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' LIMIT 10
    `);
    console.log('✓ Tables in database:', tables.rows.length);
    if (tables.rows.length > 0) {
      console.log('  Tables:', tables.rows.map(r => r.table_name).join(', '));
    }
  } catch (e) {
    console.log('✗ Error:', e.message);
  } finally {
    await pool.end();
  }
})();
