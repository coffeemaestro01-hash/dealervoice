"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  id: string;
  plan: string;
  status: string;
}

export function AdminSubscriptionActions({ id, plan, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Update failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (busy) return <Loader2 size={16} className="animate-spin text-gray-400" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {plan !== "PRO" && (
          <DropdownMenuItem onClick={() => patch({ plan: "PRO", status: "ACTIVE" })}>
            Upgrade to Pro
          </DropdownMenuItem>
        )}
        {plan !== "ENTERPRISE" && (
          <DropdownMenuItem onClick={() => patch({ plan: "ENTERPRISE", status: "ACTIVE" })}>
            Upgrade to Enterprise
          </DropdownMenuItem>
        )}
        {plan !== "FREE" && (
          <DropdownMenuItem onClick={() => patch({ plan: "FREE", status: "ACTIVE" })}>
            Downgrade to Free
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {status !== "CANCELED" && (
          <DropdownMenuItem onClick={() => patch({ status: "CANCELED" })} className="text-red-600">
            Cancel subscription
          </DropdownMenuItem>
        )}
        {status === "CANCELED" && (
          <DropdownMenuItem onClick={() => patch({ status: "ACTIVE" })}>Reactivate</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
