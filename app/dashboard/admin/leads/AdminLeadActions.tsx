"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLeadActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function setStatus(s: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {status !== "CONTACTED" && (
        <Button size="sm" variant="outline" onClick={() => setStatus("CONTACTED")}>
          Contacted
        </Button>
      )}
      {status !== "CONVERTED" && (
        <Button size="sm" onClick={() => setStatus("CONVERTED")}>
          Converted
        </Button>
      )}
    </div>
  );
}
