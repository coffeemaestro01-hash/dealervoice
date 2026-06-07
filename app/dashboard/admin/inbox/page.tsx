import { requireAdminPage } from "@/lib/admin/require-admin-page";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  await requireAdminPage("/dashboard/admin/inbox", "SUPER_ADMIN", "SUPPORT", "MODERATOR");

  const prisma = (await import("@/lib/db")).default;
  const [claims, reports, leads, flaggedReviews, dsrOpen] = await Promise.all([
    prisma.dealerClaim.findMany({
      where: { status: { in: ["PENDING", "DOCUMENTS_REQUIRED"] } },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { dealership: { select: { name: true } }, submittedBy: { select: { name: true } } },
    }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { reportedBy: { select: { name: true } }, review: { select: { title: true } } },
    }),
    prisma.lead.findMany({
      where: { status: "NEW" },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { dealership: { select: { name: true } } },
    }),
    prisma.review.findMany({
      where: { status: "FLAGGED" },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { dealership: { select: { name: true } }, author: { select: { name: true } } },
    }),
    prisma.dsrRequest.findMany({
      where: { status: { in: ["submitted", "verifying", "in_progress"] } },
      take: 15,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Unified inbox</h1>
      <p className="text-sm text-gray-500">Claims, leads, reports, flagged reviews, and privacy requests in one queue.</p>

      <InboxSection title="Pending claims" count={claims.length} href="/dashboard/admin/claims">
        {claims.map((c) => (
          <Item key={c.id} title={c.dealership.name} sub={`${c.submittedBy.name} · ${c.status}`} />
        ))}
      </InboxSection>

      <InboxSection title="New leads" count={leads.length} href="/dashboard/admin/leads">
        {leads.map((l) => (
          <Item key={l.id} title={l.name} sub={`${l.dealership.name} · ${l.email}`} />
        ))}
      </InboxSection>

      <InboxSection title="Open reports" count={reports.length} href="/dashboard/admin/moderation">
        {reports.map((r) => (
          <Item key={r.id} title={r.review?.title ?? "Report"} sub={r.reportedBy.name} />
        ))}
      </InboxSection>

      <InboxSection title="Flagged reviews" count={flaggedReviews.length} href="/dashboard/admin/reviews?status=FLAGGED">
        {flaggedReviews.map((r) => (
          <Item key={r.id} title={r.dealership.name} sub={r.author.name} />
        ))}
      </InboxSection>

      <InboxSection title="Privacy requests" count={dsrOpen.length} href="/dashboard/admin/dsr">
        {dsrOpen.map((d) => (
          <Item key={d.id} title={d.user.name} sub={`${d.kind} · ${d.status}`} />
        ))}
      </InboxSection>
    </div>
  );
}

function InboxSection({ title, count, href, children }: { title: string; count: number; href: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="font-semibold">{title} <Badge className="ml-2">{count}</Badge></h2>
        <Link href={href} className="text-sm text-gold-700 hover:underline">View all →</Link>
      </div>
      <div className="divide-y">{children}</div>
    </section>
  );
}

function Item({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="px-4 py-3">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  );
}
