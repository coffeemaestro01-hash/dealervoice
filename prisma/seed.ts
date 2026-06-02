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

  // ───────── Sample dealerships ─────────
  const la = await prisma.city.findFirst({ where: { slug: "los-angeles" } });
  const ny = await prisma.city.findFirst({ where: { slug: "new-york" } });
  const chi = await prisma.city.findFirst({ where: { slug: "chicago" } });
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  const brandBySlug = async (slug: string) => prisma.brand.findUnique({ where: { slug } });

  const SAMPLE_DEALERS = [
    {
      slug: "sunrise-toyota-la", name: "Sunrise Toyota of LA", brand: "toyota",
      description: "Los Angeles' premier Toyota dealership since 1985. Award-winning service and the largest Toyota inventory in SoCal.",
      city: la, cityName: "Los Angeles", stateName: "California", address: "1234 Sunset Blvd",
      phone: "+1 (310) 555-0100", lat: 34.0522, lng: -118.2437,
      rating: 4.6, reviews: 847, verified: 612, score: 88, year: 1985,
    },
    {
      slug: "metropolitan-bmw-ny", name: "Metropolitan BMW", brand: "bmw",
      description: "New York's flagship BMW center. Luxury sales, certified service, and an exceptional ownership experience.",
      city: ny, cityName: "New York", stateName: "New York", address: "880 Park Avenue",
      phone: "+1 (212) 555-0142", lat: 40.7128, lng: -74.006,
      rating: 4.8, reviews: 1203, verified: 905, score: 94, year: 1992,
    },
    {
      slug: "windy-city-tesla", name: "Windy City Tesla", brand: "tesla",
      description: "Chicago's dedicated Tesla sales and service hub. Test drive the latest Model S, 3, X, and Y.",
      city: chi, cityName: "Chicago", stateName: "Illinois", address: "500 N Michigan Ave",
      phone: "+1 (312) 555-0188", lat: 41.8781, lng: -87.6298,
      rating: 4.5, reviews: 634, verified: 488, score: 85, year: 2016,
    },
    {
      slug: "liberty-ford-chicago", name: "Liberty Ford", brand: "ford",
      description: "Family-owned Ford dealership serving Chicagoland for three generations. Trucks, SUVs, and EVs.",
      city: chi, cityName: "Chicago", stateName: "Illinois", address: "2200 S Wabash Ave",
      phone: "+1 (312) 555-0210", lat: 41.8531, lng: -87.6258,
      rating: 4.3, reviews: 512, verified: 367, score: 79, year: 1978,
    },
    {
      slug: "empire-mercedes-ny", name: "Empire Mercedes-Benz", brand: "mercedes-benz",
      description: "Authorized Mercedes-Benz dealer in Manhattan. Premium sedans, SUVs, and AMG performance models.",
      city: ny, cityName: "New York", stateName: "New York", address: "1500 Broadway",
      phone: "+1 (212) 555-0167", lat: 40.7589, lng: -73.9851,
      rating: 4.7, reviews: 978, verified: 741, score: 91, year: 1988,
    },
    {
      slug: "pacific-honda-la", name: "Pacific Honda", brand: "honda",
      description: "Trusted Honda sales and service in West LA. Civics, Accords, CR-Vs, and certified pre-owned vehicles.",
      city: la, cityName: "Los Angeles", stateName: "California", address: "3400 Olympic Blvd",
      phone: "+1 (310) 555-0233", lat: 34.0488, lng: -118.299,
      rating: 4.4, reviews: 689, verified: 503, score: 82, year: 1995,
    },
  ];

  // NOTE: Per FTC 16 CFR Part 465 + BIS IS 19000:2022, we never seed fake
  // reviews or fabricated ratings. Sample dealers are created as honest,
  // unrated listings (0 reviews) - real reviews come only from real users.
  void admin;
  for (const d of SAMPLE_DEALERS) {
    const brand = await brandBySlug(d.brand);
    const dealer = await prisma.dealership.upsert({
      where: { slug: d.slug },
      create: {
        slug: d.slug, name: d.name, description: d.description,
        category: "NEW_VEHICLE", status: "ACTIVE",
        countryId: us!.id, cityId: d.city?.id, cityName: d.cityName, stateName: d.stateName,
        address: d.address, phone: d.phone, latitude: d.lat, longitude: d.lng,
        overallRating: 0, totalReviews: 0, verifiedReviews: 0,
        reputationScore: 0, responseRate: 0, isFeatured: false, isVerified: false,
        yearEstablished: d.year,
      },
      update: {},
    });

    if (brand) {
      await prisma.dealerBrand.upsert({
        where: { dealershipId_brandId: { dealershipId: dealer.id, brandId: brand.id } },
        create: { dealershipId: dealer.id, brandId: brand.id, isPrimary: true },
        update: {},
      });
    }
  }
  console.log(`✅ ${SAMPLE_DEALERS.length} sample dealerships seeded (no fake reviews/ratings)`);
  console.log("✅ Database seeded successfully!");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
