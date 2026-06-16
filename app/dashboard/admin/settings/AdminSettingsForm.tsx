"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const FLAG_LABELS: Record<string, string> = {
  CLAIM_AUTO_APPROVE_ALL: "Auto-approve all claims (override domain-match)",
  COMPETITOR_ADS_ENABLED: "Show competitor ads on free profiles",
  AI_FEATURES_ENABLED: "Enable AI features platform-wide",
  ADMIN_2FA_REQUIRED: "Require 2FA for admin accounts (enforce on next login)",
  SLACK_ALERTS_ENABLED: "Send Slack alerts for ops events",
};

export function AdminSettingsForm() {
  const [flags, setFlags] = useState<Record<string, boolean | string | number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setFlags(d.data?.flags ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key: string) {
    const next = !flags[key];
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: next }),
    });
    setFlags((f) => ({ ...f, [key]: next }));
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="bg-card rounded-xl border divide-y max-w-xl">
      {Object.entries(FLAG_LABELS).map(([key, label]) => (
        <div key={key} className="px-4 py-4 flex justify-between items-center gap-4">
          <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground font-mono">{key}</p>
          </div>
          <Button
            size="sm"
            variant={flags[key] ? "default" : "outline"}
            onClick={() => toggle(key)}
          >
            {flags[key] ? "On" : "Off"}
          </Button>
        </div>
      ))}
    </div>
  );
}
