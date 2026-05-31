const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
let pass = 0, fail = 0;
const ok = (n) => { console.log('  ✅', n); pass++; };
const no = (n, e) => { console.log('  ❌', n, '→', e); fail++; };

(async () => {
  console.log('\n🧪 DATABASE INTEGRITY TESTS\n');
  try {
    // Test 1: Countries
    const countries = await prisma.country.count();
    countries >= 10 ? ok(`Countries seeded (${countries})`) : no('Countries', `only ${countries}`);

    // Test 2: Brands
    const brands = await prisma.brand.count();
    brands >= 30 ? ok(`Brands seeded (${brands})`) : no('Brands', `only ${brands}`);

    // Test 3: Cities
    const cities = await prisma.city.count();
    cities >= 5 ? ok(`Cities seeded (${cities})`) : no('Cities', `only ${cities}`);

    // Test 4: Admin user
    const admin = await prisma.user.findUnique({ where: { email: 'admin@dealervoice.com' } });
    admin && admin.role === 'SUPER_ADMIN' ? ok('Admin user exists w/ SUPER_ADMIN role') : no('Admin user', 'missing/wrong role');

    // Test 5: Admin password hash valid
    const bcrypt = require('bcryptjs');
    const validPw = admin && await bcrypt.compare('Admin@123!', admin.passwordHash);
    validPw ? ok('Admin password hash verifies') : no('Admin password', 'hash mismatch');

    // Test 6: Can create a test dealership (write test)
    const us = await prisma.country.findUnique({ where: { code: 'US' } });
    const testDealer = await prisma.dealership.upsert({
      where: { slug: 'test-dealer-qa' },
      create: { slug: 'test-dealer-qa', name: 'QA Test Motors', countryId: us.id, status: 'ACTIVE', cityName: 'Los Angeles', overallRating: 4.5, totalReviews: 0, isFeatured: true, isVerified: true },
      update: {},
    });
    testDealer ? ok('Dealership write/upsert works') : no('Dealership write', 'failed');

    // Test 7: Relations work (dealer -> country)
    const withCountry = await prisma.dealership.findUnique({ where: { slug: 'test-dealer-qa' }, include: { country: true } });
    withCountry?.country?.name === 'United States' ? ok('Dealer→Country relation works') : no('Relation', 'broken');

    // Test 8: Create a test review
    const review = await prisma.review.upsert({
      where: { id: 'qa-test-review-1' },
      create: { id: 'qa-test-review-1', dealershipId: testDealer.id, authorId: admin.id, overallRating: 5, title: 'Great service', body: 'Excellent experience at this dealership during QA testing.', status: 'PUBLISHED', reviewType: 'NEW_CAR_PURCHASE' },
      update: {},
    });
    review ? ok('Review write works') : no('Review write', 'failed');

    // Test 9: Review relations
    const reviewFull = await prisma.review.findUnique({ where: { id: 'qa-test-review-1' }, include: { author: true, dealership: true } });
    reviewFull?.author?.email === 'admin@dealervoice.com' ? ok('Review→Author→Dealer relations work') : no('Review relations', 'broken');

    // Test 10: Cleanup test data
    await prisma.review.delete({ where: { id: 'qa-test-review-1' } });
    await prisma.dealership.delete({ where: { slug: 'test-dealer-qa' } });
    ok('Test data cleanup (delete works)');

    console.log(`\n📊 DB TESTS: ${pass} passed, ${fail} failed\n`);
  } catch (e) {
    console.log('💥 Fatal:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
