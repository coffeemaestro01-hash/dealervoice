"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reportedBy: { name: string; email: string };
  review: { id: string; title: string } | null;
  dealership: { name: string; slug: string } | null;
}

export function AdminReportsPanel() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/moderation/reports?status=PENDING")
      .then((r) => r.json())
      .then((d) => setReports(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function resolve(id: string, status: "REVIEWED" | "DISMISSED") {
    const res = await fetch(`/api/moderation/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading reports…</p>;
  if (reports.length === 0) return <p className="text-sm text-muted-foreground p-6">No open reports.</p>;

  return (
    <div className="divide-y divide-border">
      {reports.map((r) => (
        <div key={r.id} className="px-4 py-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.reason.replace(/_/g, " ")}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
              </div>
              {r.review && <p className="font-medium text-foreground mt-1">Review: {r.review.title}</p>}
              {r.dealership && (
                <p className="text-sm text-muted-foreground">
                  Dealer:{" "}
                  <Link href={`/dealership/${r.dealership.slug}`} className="text-primary hover:underline">
                    {r.dealership.name}
                  </Link>
                </p>
              )}
              {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
              <p className="text-xs text-muted-foreground">Reported by {r.reportedBy.name}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {r.review && (
                <Link href={`/dashboard/admin/reviews?status=FLAGGED`}>
                  <Button size="sm" variant="outline">
                    View reviews
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="outline" onClick={() => resolve(r.id, "DISMISSED")}>
                Dismiss
              </Button>
              <Button size="sm" onClick={() => resolve(r.id, "REVIEWED")}>
                Mark reviewed
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
