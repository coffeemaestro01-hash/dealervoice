"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminDsrActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function update(s: string) {
    await fetch(`/api/admin/dsr/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    router.refresh();
  }

  if (status === "completed") return null;

  return (
    <div className="flex gap-1">
      {status === "submitted" && (
        <Button size="sm" variant="outline" onClick={() => update("in_progress")}>Start</Button>
      )}
      <Button size="sm" onClick={() => update("completed")}>Complete</Button>
    </div>
  );
}
