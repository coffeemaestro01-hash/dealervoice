"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DealerLeadActions({ leadId, status }: { leadId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "CONVERTED" || status === "CLOSED") return null;

  return (
    <div className="flex gap-2 mt-2">
      {status === "NEW" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("CONTACTED")}>
          Mark contacted
        </Button>
      )}
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={loading}
        onClick={() => setStatus("CONVERTED")}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : "Mark sold / converted"}
      </Button>
    </div>
  );
}
