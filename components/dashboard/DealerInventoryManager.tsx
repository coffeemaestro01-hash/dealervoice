"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { VehicleListing } from "@prisma/client";

interface Props {
  dealershipId: string;
  dealershipName: string;
  currency: string;
  listings: VehicleListing[];
}

const EMPTY = {
  make: "",
  model: "",
  trim: "",
  year: "",
  mileageKm: "",
  fuelType: "",
  transmission: "",
  condition: "USED" as const,
  priceInr: "",
  priceLabel: "",
  color: "",
  affiliateUrl: "",
};

function formatPrice(priceMinor: number | null, priceLabel: string | null, currency: string) {
  if (priceLabel) return priceLabel;
  if (priceMinor == null) return "—";
  const major = priceMinor / 100;
  return currency === "USD"
    ? `$${major.toLocaleString("en-US")}`
    : `${currency} ${major.toLocaleString("en-US")}`;
}

export function DealerInventoryManager({ dealershipId, dealershipName, currency, listings }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      toast({ title: "Make and model required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const priceMinor = form.priceInr ? Math.round(parseFloat(form.priceInr) * 100) : undefined;
      const res = await fetch(`/api/dealerships/${dealershipId}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: form.make.trim(),
          model: form.model.trim(),
          trim: form.trim || undefined,
          year: form.year ? parseInt(form.year, 10) : undefined,
          mileageKm: form.mileageKm ? parseInt(form.mileageKm, 10) : undefined,
          fuelType: form.fuelType || undefined,
          transmission: form.transmission || undefined,
          condition: form.condition,
          priceMinor,
          priceLabel: form.priceLabel || undefined,
          color: form.color || undefined,
          currency,
          affiliateUrl: form.affiliateUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? json.error ?? "Failed to add vehicle");
      toast({ title: "Vehicle listed", description: "It now appears on your public profile." });
      setForm(EMPTY);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeListing(listingId: string) {
    setRemoving(listingId);
    try {
      const res = await fetch(`/api/dealerships/${dealershipId}/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Listing removed" });
      router.refresh();
    } catch {
      toast({ title: "Could not remove", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          List vehicles on your DealerVoice profile and <strong>{dealershipName}</strong>&apos;s country inventory page.
        </p>
        <Button onClick={() => setOpen((o) => !o)} className="bg-gold-800 hover:bg-gold-900 gap-2">
          <Plus size={16} />
          {open ? "Cancel" : "Add vehicle"}
        </Button>
      </div>

      {open && (
        <form onSubmit={addVehicle} className="rounded-xl border border-gold/30 bg-gold-50/50 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Car size={18} className="text-gold-700" /> New listing
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Make *</Label>
              <Input value={form.make} onChange={set("make")} placeholder="Hyundai" required />
            </div>
            <div>
              <Label>Model *</Label>
              <Input value={form.model} onChange={set("model")} placeholder="Creta" required />
            </div>
            <div>
              <Label>Trim</Label>
              <Input value={form.trim} onChange={set("trim")} placeholder="SX(O) Diesel" />
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={set("year")} placeholder="2023" />
            </div>
            <div>
              <Label>Price ({currency === "USD" ? "$" : currency})</Label>
              <Input type="number" step="0.01" value={form.priceInr} onChange={set("priceInr")} placeholder="1299000" />
            </div>
            <div>
              <Label>Or price label</Label>
              <Input value={form.priceLabel} onChange={set("priceLabel")} placeholder="POA / Negotiable" />
            </div>
            <div>
              <Label>Mileage (km)</Label>
              <Input type="number" value={form.mileageKm} onChange={set("mileageKm")} />
            </div>
            <div>
              <Label>Condition</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.condition}
                onChange={set("condition")}
              >
                <option value="NEW">New</option>
                <option value="USED">Used</option>
                <option value="CERTIFIED">Certified pre-owned</option>
              </select>
            </div>
            <div>
              <Label>Fuel</Label>
              <Input value={form.fuelType} onChange={set("fuelType")} placeholder="Petrol / Diesel / EV" />
            </div>
            <div>
              <Label>Transmission</Label>
              <Input value={form.transmission} onChange={set("transmission")} placeholder="Automatic" />
            </div>
            <div className="sm:col-span-2">
              <Label>External link (optional)</Label>
              <Input value={form.affiliateUrl} onChange={set("affiliateUrl")} placeholder="https://..." type="url" />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="bg-gold-800 hover:bg-gold-900">
            {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Publish listing
          </Button>
        </form>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-500 text-sm">
          No vehicles listed yet. Add your first car to appear in search and on your profile.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white overflow-hidden">
          {listings.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">
                  {[v.year, v.make, v.model, v.trim].filter(Boolean).join(" ")}
                </p>
                <p className="text-sm text-gold-800 font-semibold mt-0.5">
                  {formatPrice(v.priceMinor, v.priceLabel, v.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {v.condition}
                  {v.mileageKm != null ? ` · ${v.mileageKm.toLocaleString()} km` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {v.affiliateUrl && (
                  <a href={v.affiliateUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-700">
                    <ExternalLink size={16} />
                  </a>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={removing === v.id}
                  onClick={() => removeListing(v.id)}
                >
                  {removing === v.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
