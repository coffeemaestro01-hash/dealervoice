import type { Metadata } from "next";
import { Suspense } from "react";
import { DealerSearchPage } from "@/components/dealership/DealerSearchPage";

export const metadata: Metadata = {
  title: "Find Car Dealerships Worldwide",
  description: "Search and compare car dealerships worldwide. Filter by brand, location, rating, and more.",
};

export default function DealersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense>
      <DealerSearchPage searchParams={searchParams} />
    </Suspense>
  );
}
