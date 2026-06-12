import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { DealershipRoute } from "@/components/dealership/DealershipRoute";
import { buildDealershipMetadata } from "@/lib/dealers/load-dealership";
import { dealerCanonicalPath } from "@/lib/dealers/seo-url";
import { getDealershipBySlug } from "@/lib/dealers/load-dealership";

interface Props {
  params: Promise<{ country: string; city: string; slug: string }>;
  searchParams: Promise<{ page?: string; write?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildDealershipMetadata(slug);
}

export default async function DealerGeoProfilePage({ params, searchParams }: Props) {
  const { country, city, slug } = await params;
  const { page: pageParam, write } = await searchParams;

  const dealer = await getDealershipBySlug(slug);
  if (!dealer) notFound();

  const canonical = dealerCanonicalPath(dealer);
  const currentPath = `/dealers/${country}/${city}/${slug}`;

  if (canonical !== currentPath) {
    permanentRedirect(canonical);
  }

  return (
    <DealershipRoute
      slug={slug}
      page={Number(pageParam ?? 1)}
      highlightWrite={write === "1"}
    />
  );
}
