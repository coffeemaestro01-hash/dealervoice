import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { DealerSettingsForm } from "@/components/dashboard/DealerSettingsForm";

async function getDealerData(userId: string) {
  const staffRecord = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    include: {
      dealership: {
        include: {
          country: true,
          city: true,
        },
      },
    },
  });

  if (!staffRecord) return null;
  return staffRecord.dealership;
}

export default async function DealerSettingsPage() {
  const user = await requireAuth();
  const dealership = await getDealerData(user.id);

  if (!dealership) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Dealership Found</h1>
        <p>You are not associated with any dealership.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dealership Settings</h1>
        <p className="text-gray-500 mt-1">Manage your dealership's public profile and contact information.</p>
      </div>

      <DealerSettingsForm dealership={dealership} />
    </div>
  );
}
