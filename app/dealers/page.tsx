import type { Metadata } from "next";
import { Suspense } from "react";
import { DealerSearchPage } from "@/components/dealership/DealerSearchPage";

export const metadata: Metadata = {
  title: "Find Car Dealerships Worldwide",
  description: "Search and compare car dealerships worldwide. Filter by brand, location, rating, and more.",
};

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  return (
    <Suspense>
      <DealerSearchPage searchParams={resolvedParams} />
    </Suspense>
  );
}
