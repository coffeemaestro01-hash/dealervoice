"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AutomationRule = {
  id: string;
  name: string;
  trigger: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  isActive: boolean;
  runCount: number;
  createdAt: string;
};

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inbox/automations")
      .then((r) => r.json())
      .then((d) => setRules(d.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading automations…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Automations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rules that run automatically when tickets are created or updated.
        </p>
      </div>

      {rules.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No automation rules configured yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{rule.name}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          rule.isActive
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "text-muted-foreground"
                        )}
                      >
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trigger: <span className="font-mono text-foreground">{rule.trigger}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ran {rule.runCount} time{rule.runCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
