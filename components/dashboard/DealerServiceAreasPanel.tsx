"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Loader2, Building2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface ServiceArea {
  id: string;
  cityName: string;
  stateName: string | null;
  stateCode: string | null;
}

interface EnterpriseLink {
  id: string;
  linked: { id: string; name: string; slug: string; cityName: string | null };
}

export function DealerServiceAreasPanel() {
  const { toast } = useToast();
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [limit, setLimit] = useState(5);
  const [plan, setPlan] = useState("FREE");
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [links, setLinks] = useState<EnterpriseLink[]>([]);
  const [linkLimit, setLinkLimit] = useState(5);
  const [linkDealerId, setLinkDealerId] = useState("");
  const [linkSaving, setLinkSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [areasRes, linksRes] = await Promise.all([
        fetch("/api/dealer/service-areas"),
        fetch("/api/dealer/enterprise-links"),
      ]);
      const areasData = await areasRes.json();
      const linksData = await linksRes.json();
      if (areasRes.ok) {
        setAreas(areasData.areas ?? []);
        setLimit(areasData.limit ?? 5);
        setPlan(areasData.plan ?? "FREE");
      }
      if (linksRes.ok) {
        setLinks(linksData.links ?? []);
        setLinkLimit(linksData.limit ?? 5);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addArea(e: React.FormEvent) {
    e.preventDefault();
    if (!cityName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dealer/service-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName, stateName: stateName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      setCityName("");
      setStateName("");
      await load();
      toast({ title: "Service area added", description: `${data.area.cityName} is now on your profile.` });
    } catch (err) {
      toast({
        title: "Could not add area",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeArea(id: string) {
    const res = await fetch(`/api/dealer/service-areas?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setAreas((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Removed" });
    }
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkDealerId.trim()) return;
    setLinkSaving(true);
    try {
      const res = await fetch("/api/dealer/enterprise-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedDealershipId: linkDealerId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link");
      setLinkDealerId("");
      await load();
      toast({ title: "Location linked", description: data.link?.linked?.name });
    } catch (err) {
      toast({
        title: "Could not link location",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLinkSaving(false);
    }
  }

  async function removeLink(id: string) {
    const res = await fetch(`/api/dealer/enterprise-links?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Unlinked" });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Areas you serve
          </CardTitle>
          <CardDescription>
            Add cities and towns around your dealership where you actively serve buyers. Your profile appears in
            directory searches for those locations.{" "}
            <span className="text-primary font-medium">
              {areas.length} / {limit} on {plan}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {areas.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <li
                  key={area.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <MapPin size={12} className="text-primary shrink-0" />
                  {area.cityName}
                  {area.stateName ? `, ${area.stateName}` : ""}
                  <button
                    type="button"
                    onClick={() => removeArea(area.id)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                    aria-label={`Remove ${area.cityName}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {areas.length < limit ? (
            <form onSubmit={addArea} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="serviceCity">City or town name</Label>
                <Input
                  id="serviceCity"
                  placeholder="e.g. Naperville, Schaumburg"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serviceState">State (optional)</Label>
                <Input
                  id="serviceState"
                  placeholder="Illinois"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving || !cityName.trim()} className="sm:col-span-3 w-fit">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add service area
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              You&apos;ve reached your plan limit.{" "}
              <a href="/dashboard/dealer/billing" className="text-primary hover:underline">
                Upgrade for more service areas
              </a>
              .
            </p>
          )}
        </CardContent>
      </Card>

      {plan === "ENTERPRISE" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Linked dealership locations
            </CardTitle>
            <CardDescription>
              Link up to {linkLimit} same-owner dealership profiles under this Enterprise account.{" "}
              <span className="text-primary font-medium">
                {links.length} / {linkLimit} linked
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {links.length > 0 && (
              <ul className="space-y-2">
                {links.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                  >
                    <span>
                      <Link2 size={14} className="inline mr-2 text-primary" />
                      {link.linked.name}
                      {link.linked.cityName ? ` · ${link.linked.cityName}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {links.length < linkLimit && (
              <form onSubmit={addLink} className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Linked dealership ID"
                  value={linkDealerId}
                  onChange={(e) => setLinkDealerId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={linkSaving || !linkDealerId.trim()}>
                  Link location
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
