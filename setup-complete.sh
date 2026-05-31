#!/bin/bash
# Complete DealerVoice setup script

set -e

export DATABASE_URL='postgresql://postgres.hnzkheobcnutsuddgrpb:Dms@27041995!!!@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'

echo "🚀 DealerVoice Complete Setup"
echo "=============================="
echo ""

# Step 1: Check if database has tables
echo "📊 Checking database schema..."
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { const result = await prisma.user.findFirst(); console.log('✓ Database migrated and ready'); } catch(e) { console.log('✗ Database not ready'); process.exit(1); } finally { await prisma.\$disconnect(); } })()" || { echo "Database not ready yet. Please wait for migrations to complete first."; exit 1; }

echo ""

# Step 2: Seed the database
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo ""

# Step 3: Verify seed
echo "✅ Verifying seed..."
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { const countries = await prisma.country.count(); const brands = await prisma.brand.count(); const users = await prisma.user.count(); console.log(\`✓ Database ready: \${countries} countries, \${brands} brands, \${users} users\`); } catch(e) { console.log('✗ Verification failed:', e.message); process.exit(1); } finally { await prisma.\$disconnect(); } })()"

echo ""
echo "🎉 Setup complete! DealerVoice is ready to go!"
echo ""
echo "Admin credentials:"
echo "  Email: admin@dealervoice.com"
echo "  Password: Admin@123!"
echo ""
echo "Next steps:"
echo "  1. Visit https://dealervoice-psi.vercel.app"
echo "  2. Sign up or login with admin credentials"
echo "  3. Start managing dealerships and reviews"
echo ""
