import Link from "next/link";
import { MapPin, Mail, Building2, Star } from "lucide-react";
import prisma from "@/lib/db";
import { INDIA_STATES, INDIA_LAUNCH_STATES, findIndiaState } from "@/lib/geo/india";
import { stateHref } from "@/lib/geo";

async function getIndiaStats() {
  const country = await prisma.country.findUnique({ where: { code: "IN" }, select: { id: true } });
  if (!country) return { dealers: 0, states: 0, districts: 0, emails: 0, reviews: 0, topStates: [] as { name: string; count: number }[] };

  const [dealers, emails, reviews, districtRows, stateRows] = await Promise.all([
    prisma.dealership.count({ where: { countryId: country.id, deletedAt: null } }),
    prisma.dealership.count({
      where: { countryId: country.id, deletedAt: null, email: { not: null }, NOT: { email: "" } },
    }),
    prisma.review.count({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        dealership: { countryId: country.id },
      },
    }),
    prisma.dealership.groupBy({
      by: ["districtName"],
      where: { countryId: country.id, deletedAt: null, districtName: { not: null } },
      _count: { id: true },
    }),
    prisma.dealership.groupBy({
      by: ["stateName"],
      where: { countryId: country.id, deletedAt: null, stateName: { not: null } },
      _count: { id: true },
    }),
  ]);

  return {
    dealers,
    states: stateRows.length,
    districts: districtRows.length,
    emails,
    reviews,
    topStates: stateRows
      .filter((r): r is typeof r & { stateName: string } => !!r.stateName)
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 8)
      .map((r) => ({ name: r.stateName, count: r._count.id })),
  };
}

export async function IndiaCoverageSection() {
  const stats = await getIndiaStats();

  const launchStates = INDIA_LAUNCH_STATES.map((slug) => findIndiaState(slug)).filter(
    (s): s is NonNullable<ReturnType<typeof findIndiaState>> => !!s
  );

  const displayStates =
    stats.topStates.length > 0
      ? stats.topStates
      : INDIA_STATES.slice(0, 6).map((s) => ({ name: s.name, count: 0 }));

  return (
    <section className="py-14 bg-night border-t border-white/5" aria-labelledby="india-coverage-heading">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">India first</p>
            <h2 id="india-coverage-heading" className="font-display text-2xl md:text-3xl font-bold text-white">
              Car dealership coverage across India
            </h2>
            <p className="text-gray-400 mt-2 max-w-xl">
              We&apos;re building the most comprehensive dealership directory for Indian buyers — state by state, district by district.
            </p>
          </div>
          <Link
            href="/dealers/in"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-semibold text-sm"
          >
            <MapPin size={16} />
            Browse all India dealers →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { icon: Building2, value: stats.dealers.toLocaleString(), label: "Dealerships" },
            { icon: MapPin, value: `${stats.states || INDIA_STATES.length}`, label: "States & UTs" },
            { icon: MapPin, value: stats.districts.toLocaleString(), label: "Districts" },
            { icon: Mail, value: stats.emails.toLocaleString(), label: "Public emails" },
            { icon: Star, value: stats.reviews > 0 ? stats.reviews.toLocaleString() : "Growing", label: "Reviews" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 card-dark p-4 text-center">
              <s.icon className="mx-auto text-gold-500 mb-2" size={20} />
              <p className="text-xl md:text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Launch states</h3>
            <div className="flex flex-wrap gap-2">
              {launchStates.map((s) => (
                <Link
                  key={s.slug}
                  href={stateHref("in", s.code.split("-")[1], s.name) ?? "/dealers/in"}
                  className="px-3 py-1.5 rounded-full border border-gold/30 text-gold-300 text-sm hover:bg-gold-500/10 transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Top states by listings</h3>
            <div className="flex flex-wrap gap-2">
              {displayStates.map((s) => (
                  <Link
                    key={s.name}
                    href={stateHref("in", null, s.name) ?? "/dealers/in"}
                    className="px-3 py-1.5 rounded-full border border-white/10 text-gray-300 text-sm hover:border-gold/30 hover:text-gold-300 transition-colors"
                  >
                    {s.name}
                    {s.count > 0 && <span className="ml-1.5 text-gray-500 text-xs">{s.count}</span>}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
