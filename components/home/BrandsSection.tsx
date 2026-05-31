import Link from "next/link";
import prisma from "@/lib/db";

async function getTopBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 16,
    select: { name: true, slug: true, logoUrl: true },
  });
}

export async function BrandsSection() {
  let brands: Awaited<ReturnType<typeof getTopBrands>> = [];
  try { brands = await getTopBrands(); } catch { return null; }
  if (brands.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="container">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
          Find dealers by brand
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/dealers?brand=${brand.slug}`}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gold-50 hover:border-gold/50 hover:text-gold-700 transition-colors"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
