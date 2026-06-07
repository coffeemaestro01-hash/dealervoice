"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, RotateCcw, Trash2, UserCheck } from "lucide-react";
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
  email: string;
  status: string;
  role: string;
  actorRole: string;
}

export function AdminUserActions({ id, email, status, role, actorRole }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isSuperAdmin = actorRole === "SUPER_ADMIN";
  const protectedRole = role === "SUPER_ADMIN" || role === "MODERATOR";

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeUser() {
    if (
      !confirm(
        `Remove ${email}?\n\nThis soft-deletes the account, signs them out, and frees their email for re-registration. Reviews they wrote stay on record.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Remove failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
    return <Loader2 size={16} className="animate-spin text-gray-400" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Manage
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => patch({ status: "ACTIVE" })}>
            <UserCheck size={14} className="mr-2" />
            Restore (Active)
          </DropdownMenuItem>
        )}
        {status !== "SUSPENDED" && (
          <DropdownMenuItem onClick={() => patch({ status: "SUSPENDED" })}>
            <Ban size={14} className="mr-2" />
            Suspend
          </DropdownMenuItem>
        )}
        {status !== "BANNED" && (
          <DropdownMenuItem onClick={() => patch({ status: "BANNED" })} className="text-red-600">
            <Ban size={14} className="mr-2" />
            Ban
          </DropdownMenuItem>
        )}
        {isSuperAdmin && !protectedRole && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={removeUser} className="text-red-600">
              <Trash2 size={14} className="mr-2" />
              Remove user
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
