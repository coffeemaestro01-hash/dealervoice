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
    <div className="bg-gray-50 min-h-[70vh]">
      <section className="border-b border-gray-100 bg-white">
        <div className="container py-12 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold/40 rounded-full px-4 py-1.5 text-sm text-gold-700 font-medium mb-5">
            <Store size={14} /> Free listing · {COMPANY.hqCity}-based platform
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            List your <span className="text-gold">dealership</span>
          </h1>
          <p className="text-gray-600">
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
