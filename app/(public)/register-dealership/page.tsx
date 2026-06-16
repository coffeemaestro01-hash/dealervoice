import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { RegisterDealershipForm } from "@/components/dealership/RegisterDealershipForm";
import { COMPANY } from "@/lib/constants/company";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "List Your Dealership",
  description:
    "Can't find your dealership on DealerVoice? Register your own listing free and start collecting verified reviews.",
};

export const dynamic = "force-dynamic";

export default async function RegisterDealershipPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; city?: string; state?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
  const us = countries.find((c) => c.code === "US");

  return (
    <div className="bg-muted min-h-[70vh]">
      <section className="border-b border-border bg-card">
        <div className="container py-12 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <Store size={14} /> Free listing · {COMPANY.hqCity}-based platform
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            List your <span className="text-primary">dealership</span>
          </h1>
          <p className="text-muted-foreground">
            Not in our directory yet? Add your dealership in minutes, claim your profile, and start building trust with car buyers worldwide.
          </p>
        </div>
      </section>
      <section className="container py-10">
        <RegisterDealershipForm
          countries={countries}
          defaultCountryId={us?.id}
          prefilledName={params.name ?? ""}
          prefilledCity={params.city ?? ""}
          prefilledState={params.state ?? ""}
          isAuthenticated={!!session?.user}
        />
      </section>
    </div>
  );
}
