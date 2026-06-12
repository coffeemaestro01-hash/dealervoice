import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { DealerInventoryManager } from "@/components/dashboard/DealerInventoryManager";
import { isDealerPremiumClaimed } from "@/lib/dealer/premium";

async function getDealerData(userId: string) {
  return prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    include: {
      dealership: {
        include: {
          country: true,
          subscription: { select: { plan: true, status: true } },
          vehicleListings: { where: { isActive: true }, orderBy: { listedAt: "desc" } },
        },
      },
    },
  });
}

export default async function DealerInventoryPage() {
  const user = await requireAuth();
  const staff = await getDealerData(user.id);

  if (!staff?.dealership) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No dealership linked</h1>
        <p className="text-gray-600 mb-4">Claim a profile first to manage inventory.</p>
        <Link href="/claim" className="text-gold-700 font-medium hover:underline">
          Claim your profile →
        </Link>
      </div>
    );
  }

  const dealer = staff.dealership;
  const isPremium = isDealerPremiumClaimed(dealer);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500 mt-1">
          Add vehicles buyers can browse on your profile and{" "}
          <Link href={`/dealers/${dealer.country.code.toLowerCase()}/inventory`} className="text-gold-700 hover:underline">
            {dealer.country.name} inventory
          </Link>
          .
        </p>
      </div>

      {!isPremium && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Pro tip:</strong> Pro dealers also get a prominent inventory link and no competitor ads.{" "}
          <Link href="/dashboard/dealer/billing" className="font-medium underline">
            Upgrade plans
          </Link>
        </div>
      )}

      <DealerInventoryManager
        dealershipId={dealer.id}
        dealershipName={dealer.name}
        currency={dealer.country.currency ?? "USD"}
        listings={dealer.vehicleListings}
      />
    </div>
  );
}
