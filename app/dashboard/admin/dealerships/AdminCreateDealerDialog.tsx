"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Country {
  id: string;
  name: string;
  code: string;
}

export function AdminCreateDealerDialog({ countries }: { countries: Country[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    countryId: countries[0]?.id ?? "",
    cityName: "",
    stateName: "",
    email: "",
    phone: "",
    website: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/dealerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Failed to create dealership");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-ember text-night-900 font-semibold border-0">
          <Plus size={16} className="mr-1" /> Add dealership
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add dealership</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Country *</Label>
            <select
              required
              className="w-full h-10 rounded-md border border-border px-3 text-sm"
              value={form.countryId}
              onChange={(e) => setForm({ ...form, countryId: e.target.value })}
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>City</Label>
              <Input value={form.cityName} onChange={(e) => setForm({ ...form, cityName: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.stateName} onChange={(e) => setForm({ ...form, stateName: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Website</Label>
            <Input type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-ember text-night-900 font-semibold">
            {busy ? <Loader2 className="animate-spin" size={16} /> : "Create listing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
