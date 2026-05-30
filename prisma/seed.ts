import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Countries
  const countries = [
    { name: "United States", code: "US", code3: "USA", dialCode: "+1", currency: "USD", locale: "en-US", flagEmoji: "🇺🇸" },
    { name: "United Kingdom", code: "GB", code3: "GBR", dialCode: "+44", currency: "GBP", locale: "en-GB", flagEmoji: "🇬🇧" },
    { name: "Germany", code: "DE", code3: "DEU", dialCode: "+49", currency: "EUR", locale: "de-DE", flagEmoji: "🇩🇪" },
    { name: "France", code: "FR", code3: "FRA", dialCode: "+33", currency: "EUR", locale: "fr-FR", flagEmoji: "🇫🇷" },
    { name: "Australia", code: "AU", code3: "AUS", dialCode: "+61", currency: "AUD", locale: "en-AU", flagEmoji: "🇦🇺" },
    { name: "Canada", code: "CA", code3: "CAN", dialCode: "+1", currency: "CAD", locale: "en-CA", flagEmoji: "🇨🇦" },
    { name: "Japan", code: "JP", code3: "JPN", dialCode: "+81", currency: "JPY", locale: "ja-JP", flagEmoji: "🇯🇵" },
    { name: "India", code: "IN", code3: "IND", dialCode: "+91", currency: "INR", locale: "en-IN", flagEmoji: "🇮🇳" },
    { name: "United Arab Emirates", code: "AE", code3: "ARE", dialCode: "+971", currency: "AED", locale: "ar-AE", flagEmoji: "🇦🇪" },
    { name: "Brazil", code: "BR", code3: "BRA", dialCode: "+55", currency: "BRL", locale: "pt-BR", flagEmoji: "🇧🇷" },
  ];

  for (const c of countries) {
    await prisma.country.upsert({ where: { code: c.code }, create: c, update: {} });
  }
  console.log("✅ Countries seeded");

  const us = await prisma.country.findUnique({ where: { code: "US" } });

  // Cities
  const cities = [
    { name: "New York", slug: "new-york", stateCode: "NY", stateName: "New York", countryId: us!.id, latitude: 40.7128, longitude: -74.0060 },
    { name: "Los Angeles", slug: "los-angeles", stateCode: "CA", stateName: "California", countryId: us!.id, latitude: 34.0522, longitude: -118.2437 },
    { name: "Chicago", slug: "chicago", stateCode: "IL", stateName: "Illinois", countryId: us!.id, latitude: 41.8781, longitude: -87.6298 },
    { name: "Houston", slug: "houston", stateCode: "TX", stateName: "Texas", countryId: us!.id, latitude: 29.7604, longitude: -95.3698 },
    { name: "Phoenix", slug: "phoenix", stateCode: "AZ", stateName: "Arizona", countryId: us!.id, latitude: 33.4484, longitude: -112.0740 },
  ];

  for (const city of cities) {
    await prisma.city.upsert({ where: { slug_countryId: { slug: city.slug, countryId: city.countryId } }, create: city, update: {} });
  }
  console.log("✅ Cities seeded");

  // Brands
  const brands = [
    "Toyota", "Ford", "Chevrolet", "Honda", "Nissan", "BMW", "Mercedes-Benz", "Audi",
    "Tesla", "Volkswagen", "Hyundai", "Kia", "Subaru", "Mazda", "Jeep", "Ram",
    "GMC", "Cadillac", "Lexus", "Infiniti", "Acura", "Volvo", "Land Rover",
    "Porsche", "Ferrari", "Lamborghini", "Maserati", "Jaguar", "Genesis", "Lincoln",
  ];

  for (let i = 0; i < brands.length; i++) {
    const name = brands[i];
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.brand.upsert({ where: { slug }, create: { name, slug, sortOrder: i }, update: {} });
  }
  console.log("✅ Brands seeded");

  // Super Admin
  const adminEmail = "admin@dealervoice.com";
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash("Admin@123!", 12),
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Admin user created: admin@dealervoice.com / Admin@123!");
  }

  // Sample dealership
  const city = await prisma.city.findFirst({ where: { slug: "los-angeles" } });
  const toyota = await prisma.brand.findUnique({ where: { slug: "toyota" } });

  const sampleDealer = await prisma.dealership.upsert({
    where: { slug: "sunrise-toyota-la" },
    create: {
      slug: "sunrise-toyota-la",
      name: "Sunrise Toyota of LA",
      description: "Los Angeles' premier Toyota dealership since 1985. Award-winning customer service and the largest Toyota inventory in SoCal.",
      category: "NEW_VEHICLE",
      status: "ACTIVE",
      countryId: us!.id,
      cityId: city?.id,
      cityName: "Los Angeles",
      stateName: "California",
      address: "1234 Sunset Blvd",
      phone: "+1 (310) 555-0100",
      website: "https://sunrisetoyota.example.com",
      latitude: 34.0522,
      longitude: -118.2437,
      overallRating: 4.6,
      totalReviews: 847,
      verifiedReviews: 612,
      reputationScore: 88,
      responseRate: 0.92,
      isFeatured: true,
      isVerified: true,
      claimedAt: new Date(),
      yearEstablished: 1985,
    },
    update: {},
  });

  if (toyota) {
    await prisma.dealerBrand.upsert({
      where: { dealershipId_brandId: { dealershipId: sampleDealer.id, brandId: toyota.id } },
      create: { dealershipId: sampleDealer.id, brandId: toyota.id, isPrimary: true },
      update: {},
    });
  }

  await prisma.dealerSubscription.upsert({
    where: { dealershipId: sampleDealer.id },
    create: { dealershipId: sampleDealer.id, plan: "PRO", status: "ACTIVE" },
    update: {},
  });

  console.log("✅ Sample dealership seeded");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
