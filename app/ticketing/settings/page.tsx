"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Clock, Loader2, Mail, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { INBOX_BASE_PATH } from "@/lib/inbox/constants";

type Connection = {
  id: string;
  label: string;
  address: string | null;
  provider: string;
  status: string;
  lastError: string | null;
  connectedAt: string | null;
};

type SettingsData = {
  connection: Connection | null;
  onboardingComplete: boolean;
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
  CONNECTED: {
    icon: CheckCircle2,
    label: "Connected",
    className: "text-primary bg-primary/10 border-primary/20",
  },
  PENDING: {
    icon: Clock,
    label: "Pending",
    className: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  ERROR: {
    icon: AlertCircle,
    label: "Error",
    className: "text-destructive bg-destructive/10 border-destructive/20",
  },
  DISCONNECTED: {
    icon: AlertCircle,
    label: "Disconnected",
    className: "text-muted-foreground bg-muted border-border",
  },
};

export default function InboxSettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/inbox/connection"), fetch("/api/inbox/onboarding")])
      .then(async ([connRes, onboardRes]) => {
        const connPayload = await connRes.json();
        const onboardPayload = await onboardRes.json();
        const connection = connPayload.data ?? null;
        const session = onboardPayload.data ?? null;
        setSettings({
          connection,
          onboardingComplete: connection?.status === "CONNECTED" || Boolean(session?.completedAt),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading settings…
      </div>
    );
  }

  const conn = settings?.connection;
  const statusKey = conn?.status ?? "DISCONNECTED";
  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.DISCONNECTED;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Email connection and inbox configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            Email connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {conn ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("gap-1.5", statusCfg.className)}>
                  <StatusIcon size={12} />
                  {statusCfg.label}
                </Badge>
                <Badge variant="outline">{conn.provider.replace(/_/g, " ")}</Badge>
              </div>

              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Label</dt>
                  <dd className="font-medium text-foreground">{conn.label}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="font-medium text-foreground">{conn.address ?? "Not set"}</dd>
                </div>
              </dl>

              {conn.lastError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {conn.lastError}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No email connection configured yet.</p>
          )}

          <Button asChild variant="outline" className="gap-2">
            <Link href={`${INBOX_BASE_PATH}/onboarding`}>
              <Sparkles size={16} />
              {conn ? "Re-run setup assistant" : "Set up email connection"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {!settings?.onboardingComplete && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">Complete onboarding</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your support inbox to start receiving customer tickets.
              </p>
            </div>
            <Button asChild>
              <Link href={`${INBOX_BASE_PATH}/onboarding`}>Start onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
