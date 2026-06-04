"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function act(status: "APPROVED" | "REJECTED") {
    setError("");
    setBusy(status === "APPROVED" ? "approve" : "reject");
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "REJECTED" ? { rejectionReason: reason } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Action failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (rejecting) {
    return (
      <div className="w-full space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (shown to the applicant)"
          rows={2}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={busy !== null || reason.trim().length < 3}
            onClick={() => act("REJECTED")}
            className="bg-red-600 text-white hover:bg-red-700 border-0"
          >
            {busy === "reject" ? <Loader2 size={14} className="animate-spin" /> : "Confirm rejection"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setRejecting(false); setError(""); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        disabled={busy !== null}
        onClick={() => act("APPROVED")}
        className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"
      >
        {busy === "approve" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={15} className="mr-1" />}
        Approve &amp; grant ownership
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => setRejecting(true)}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        <X size={15} className="mr-1" /> Reject
      </Button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
