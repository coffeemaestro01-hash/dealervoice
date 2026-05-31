const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTables() {
  console.log('🔧 Creating core tables...');

  try {
    // Countries
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Country" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT NOT NULL UNIQUE,
        "code3" TEXT,
        "dialCode" TEXT,
        "currency" TEXT,
        "locale" TEXT,
        "flagEmoji" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `;
    console.log('✓ Country table created');

    // Cities
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "City" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "stateCode" TEXT,
        "stateName" TEXT,
        "countryId" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "City_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE ("slug", "countryId")
      )
    `;
    console.log('✓ City table created');

    // Brands
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Brand" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "logoUrl" TEXT,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `;
    console.log('✓ Brand table created');

    // Users
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "emailVerified" TIMESTAMP(3),
        "passwordHash" TEXT,
        "name" TEXT NOT NULL,
        "displayName" TEXT,
        "avatarUrl" TEXT,
        "bio" TEXT,
        "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
        "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
        "locale" TEXT DEFAULT 'en',
        "timezone" TEXT DEFAULT 'UTC',
        "reputationScore" INTEGER DEFAULT 0,
        "helpfulVotes" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "deletedAt" TIMESTAMP(3)
      )
    `;
    console.log('✓ User table created');

    // Dealerships
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Dealership" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "logoUrl" TEXT,
        "phoneNumber" TEXT,
        "website" TEXT,
        "email" TEXT,
        "address" TEXT,
        "cityName" TEXT,
        "stateName" TEXT,
        "countryId" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION,
        "longitude" DOUBLE PRECISION,
        "overallRating" DOUBLE PRECISION DEFAULT 0,
        "totalReviews" INTEGER DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "deletedAt" TIMESTAMP(3),
        CONSTRAINT "Dealership_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        UNIQUE ("slug", "countryId")
      )
    `;
    console.log('✓ Dealership table created');

    // Reviews
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "dealershipId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "overallRating" DOUBLE PRECISION NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT,
        "type" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "deletedAt" TIMESTAMP(3),
        CONSTRAINT "Review_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "Dealership" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;
    console.log('✓ Review table created');

    console.log('\n✅ All core tables created successfully!');
  } catch (error) {
    if (error.code !== 'P3014') { // Ignore "Migration lock is being held" error
      console.error('✗ Error creating tables:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
