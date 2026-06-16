import { requireAuth } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, MapPin } from "lucide-react";
import { AdminDealerActions } from "./AdminDealerActions";
import { AdminCreateDealerDialog } from "./AdminCreateDealerDialog";

export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export default async function AdminDealershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const user = await requireAuth();
  if (user.role !== "SUPER_ADMIN" && user.role !== "MODERATOR") redirect("/dashboard");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = sp.status ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  const where: any = { deletedAt: null };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { cityName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  // Sequential (small connection pool)
  const total = await prisma.dealership.count({ where });
  const dealers = await prisma.dealership.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { totalReviews: "desc" }, { name: "asc" }],
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
    select: {
      id: true, slug: true, name: true, cityName: true, stateName: true, status: true,
      isFeatured: true, isVerified: true, totalReviews: true, claimedAt: true,
      country: { select: { name: true, flagEmoji: true } },
    },
  });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });

  const qs = (overrides: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    Object.entries(overrides).forEach(([k, v]) => p.set(k, String(v)));
    return `?${p.toString()}`;
  };

  const STATUSES = ["", "ACTIVE", "CLAIMED", "PENDING_CLAIM", "SUSPENDED", "INACTIVE"];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dealerships</h1>
          <p className="text-muted-foreground mt-1">{total.toLocaleString()} listings · create, feature, verify, suspend, or remove.</p>
        </div>
        {user.role === "SUPER_ADMIN" && <AdminCreateDealerDialog countries={countries} />}
      </div>

      {/* Search + filters */}
      <form className="flex flex-col sm:flex-row gap-3" action="/dashboard/admin/dealerships">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input name="q" defaultValue={q} placeholder="Search by name or city" className="w-full h-10 pl-9 pr-3 rounded-md border border-border text-sm" />
        </div>
        <select name="status" defaultValue={status} className="h-10 rounded-md border border-border px-3 text-sm">
          {STATUSES.map((s) => <option key={s || "all"} value={s}>{s || "All statuses"}</option>)}
        </select>
        <Button type="submit" className="bg-ember text-night-900 font-semibold border-0">Search</Button>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Dealership</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Location</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Reviews</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dealers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No dealerships match your filters.</td></tr>
            ) : dealers.map((d) => (
              <tr key={d.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <Link href={`/dealership/${d.slug}`} target="_blank" className="font-medium text-foreground hover:text-primary inline-flex items-center gap-1">
                    {d.name} <ExternalLink size={12} className="text-muted-foreground" />
                  </Link>
                  <Link href={`/dashboard/admin/dealerships/${d.id}/preview`} className="text-[10px] text-primary hover:underline block mt-0.5">
                    Support preview
                  </Link>
                  <div className="flex gap-1.5 mt-1">
                    {d.isFeatured && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">Featured</Badge>}
                    {d.isVerified && <Badge variant="outline" className="bg-muted text-primary border-primary/20 text-[10px]">Verified</Badge>}
                    {d.claimedAt && <Badge variant="outline" className="bg-muted text-primary border-primary/20 text-[10px]">Claimed</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  <span className="inline-flex items-center gap-1"><MapPin size={12} />{[d.cityName, d.country?.name].filter(Boolean).join(", ")}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    d.status === "SUSPENDED" ? "bg-destructive/10 text-destructive border-primary/20" :
                    d.status === "ACTIVE" || d.status === "CLAIMED" ? "bg-muted text-primary border-primary/20" :
                    "bg-muted text-muted-foreground"
                  }>{d.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.totalReviews}</td>
                <td className="px-4 py-3"><div className="flex justify-end"><AdminDealerActions id={d.id} name={d.name} status={d.status} isFeatured={d.isFeatured} isVerified={d.isVerified} canDelete={user.role === "SUPER_ADMIN"} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={qs({ page: page - 1 })}><Button variant="outline" size="sm">Previous</Button></Link>}
          {page < totalPages && <Link href={qs({ page: page + 1 })}><Button variant="outline" size="sm">Next</Button></Link>}
        </div>
      </div>
    </div>
  );
}
