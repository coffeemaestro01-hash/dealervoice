import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import { DealershipRoute } from "@/components/dealership/DealershipRoute";
import { buildDealershipMetadata, getDealershipBySlug } from "@/lib/dealers/load-dealership";
import { dealerCanonicalPath } from "@/lib/dealers/seo-url";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; write?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return buildDealershipMetadata(slug);
}

export default async function DealershipPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam, write } = await searchParams;

  const dealer = await getDealershipBySlug(slug);
  if (!dealer) notFound();

  const canonical = dealerCanonicalPath(dealer);
  if (canonical !== `/dealership/${slug}`) {
    const qs = new URLSearchParams();
    if (pageParam) qs.set("page", pageParam);
    if (write === "1") qs.set("write", "1");
    const suffix = qs.toString() ? `?${qs}` : "";
    permanentRedirect(`${canonical}${suffix}`);
  }

  return (
    <DealershipRoute
      slug={slug}
      page={Number(pageParam ?? 1)}
      highlightWrite={write === "1"}
    />
  );
}
