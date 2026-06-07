"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, FileQuestion, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "actions" | "reject" | "docs";

export function AdminClaimActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | "docs" | null>(null);
  const [mode, setMode] = useState<Mode>("actions");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function act(status: "APPROVED" | "REJECTED" | "DOCUMENTS_REQUIRED") {
    setError("");
    setBusy(status === "APPROVED" ? "approve" : status === "REJECTED" ? "reject" : "docs");
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === "REJECTED" ? { rejectionReason: reason } : {}),
          ...(status === "DOCUMENTS_REQUIRED" ? { documentRequestNote: reason } : {}),
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

  if (mode === "reject" || mode === "docs") {
    return (
      <div className="w-full space-y-2">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            mode === "docs"
              ? "Tell the applicant what documents to upload (e.g. business license matching address)"
              : "Reason for rejection (shown to the applicant)"
          }
          rows={3}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={busy !== null || reason.trim().length < 10}
            onClick={() => act(mode === "docs" ? "DOCUMENTS_REQUIRED" : "REJECTED")}
            className={
              mode === "docs"
                ? "bg-amber-600 text-white hover:bg-amber-700 border-0"
                : "bg-red-600 text-white hover:bg-red-700 border-0"
            }
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : mode === "docs" ? "Send request" : "Confirm rejection"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setMode("actions"); setError(""); setReason(""); }}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        disabled={busy !== null}
        onClick={() => act("APPROVED")}
        className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"
      >
        {busy === "approve" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={15} className="mr-1" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => setMode("docs")}
        className="border-amber-300 text-amber-800 hover:bg-amber-50"
      >
        <FileQuestion size={15} className="mr-1" /> Request docs
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={busy !== null}
        onClick={() => setMode("reject")}
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        <X size={15} className="mr-1" /> Reject
      </Button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
