"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ShieldCheck, Ban, RotateCcw, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  name: string;
  status: string;
  isFeatured: boolean;
  isVerified: boolean;
  canDelete?: boolean;
}

export function AdminDealerActions({ id, name, status, isFeatured, isVerified, canDelete }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(key: string, data: Record<string, unknown>) {
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/dealerships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const suspended = status === "SUSPENDED";

  async function remove() {
    if (!confirm(`Remove "${name}" from the directory?\n\nThis soft-deletes the listing.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/dealerships/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const json = await res.json().catch(() => ({}));
        alert(json.error || "Delete failed");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm" variant="outline"
        disabled={busy !== null}
        onClick={() => patch("feature", { isFeatured: !isFeatured })}
        className={isFeatured ? "border-primary/30 text-primary bg-primary/10" : ""}
        title={isFeatured ? "Un-feature" : "Feature"}
      >
        {busy === "feature" ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} className={isFeatured ? "fill-gold-500 text-primary" : ""} />}
      </Button>
      <Button
        size="sm" variant="outline"
        disabled={busy !== null}
        onClick={() => patch("verify", { isVerified: !isVerified })}
        className={isVerified ? "border-primary/20 text-primary bg-muted" : ""}
        title={isVerified ? "Un-verify" : "Verify"}
      >
        {busy === "verify" ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
      </Button>
      <Button
        size="sm" variant="outline"
        disabled={busy !== null}
        onClick={() => patch("status", { status: suspended ? "ACTIVE" : "SUSPENDED" })}
        className={suspended ? "border-primary/20 text-primary" : "border-primary/20 text-destructive hover:bg-destructive/10"}
        title={suspended ? "Reactivate" : "Suspend"}
      >
        {busy === "status" ? <Loader2 size={13} className="animate-spin" /> : suspended ? <RotateCcw size={13} /> : <Ban size={13} />}
      </Button>
      {canDelete && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={remove}
          className="border-primary/20 text-destructive hover:bg-destructive/10"
          title="Remove listing"
        >
          {busy === "delete" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </Button>
      )}
    </div>
  );
}
