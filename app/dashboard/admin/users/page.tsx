import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "./AdminUserActions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const q = (sp.q ?? "").trim();
  const perPage = 30;

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        totalReviews: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suspend, ban, or remove accounts. Only super admins can permanently remove users.
          </p>
        </div>
        <form className="flex gap-2" action="/dashboard/admin/users" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email or name…"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-56"
          />
          <button type="submit" className="px-4 py-2 bg-gold-800 text-white rounded-lg text-sm font-medium">
            Search
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No users found{q ? ` for “${q}”` : ""}.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        u.status === "BANNED"
                          ? "bg-red-100 text-red-800"
                          : u.status === "SUSPENDED"
                            ? "bg-amber-100 text-amber-800"
                            : ""
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.totalReviews}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <AdminUserActions
                      id={u.id}
                      email={u.email}
                      status={u.status}
                      role={u.role}
                      actorRole={user.role}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        {total} users total · page {page}
        {q ? ` · filtered by “${q}”` : ""}
      </p>
    </div>
  );
}
