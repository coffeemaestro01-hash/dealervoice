"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Flag, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  status: string;
}

export function AdminReviewActions({ id, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function patch(key: string, data: { status?: string; verificationStatus?: string }) {
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {status !== "PUBLISHED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => patch("publish", { status: "PUBLISHED" })}
          title="Publish"
        >
          {busy === "publish" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        </Button>
      )}
      {status !== "FLAGGED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => patch("flag", { status: "FLAGGED" })}
          title="Flag"
        >
          {busy === "flag" ? <Loader2 size={13} className="animate-spin" /> : <Flag size={13} />}
        </Button>
      )}
      {status !== "REMOVED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={() => patch("remove", { status: "REMOVED" })}
          className="border-red-200 text-red-600 hover:bg-red-50"
          title="Remove"
        >
          {busy === "remove" ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => patch("verify", { verificationStatus: "VERIFIED_PURCHASE" })}
        title="Mark verified purchase"
        className="text-green-700 border-green-200"
      >
        {busy === "verify" ? <Loader2 size={13} className="animate-spin" /> : "✓"}
      </Button>
    </div>
  );
}
