import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db";
import { TeamManagement } from "@/components/dashboard/TeamManagement";

async function getTeamData(userId: string) {
  const staffRecord = await prisma.dealerStaff.findFirst({
    where: { userId, isActive: true },
    include: {
      dealership: {
        include: {
          teamMembers: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!staffRecord) return null;
  return {
    dealershipId: staffRecord.dealershipId,
    teamMembers: staffRecord.dealership.teamMembers,
  };
}

export default async function TeamPage() {
  const user = await requireAuth();
  const data = await getTeamData(user.id);

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Dealership Found</h1>
        <p>You are not associated with any dealership.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500 mt-1">
          Manage your dealership&apos;s staff profiles. Drag to reorder.
        </p>
      </div>

      <TeamManagement
        dealershipId={data.dealershipId}
        initialMembers={data.teamMembers}
      />
    </div>
  );
}
