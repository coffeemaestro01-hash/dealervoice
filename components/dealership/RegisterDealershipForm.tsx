"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORIES = [
  { value: "NEW_VEHICLE", label: "New vehicles" },
  { value: "USED_VEHICLE", label: "Used vehicles" },
  { value: "LUXURY", label: "Luxury" },
  { value: "MULTI_BRAND", label: "Multi-brand" },
  { value: "EV", label: "Electric vehicles" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
] as const;

type Country = { id: string; name: string; code: string };

interface Props {
  countries: Country[];
  defaultCountryId?: string;
  prefilledName?: string;
  prefilledCity?: string;
  prefilledState?: string;
  isAuthenticated: boolean;
}

export function RegisterDealershipForm({
  countries,
  defaultCountryId,
  prefilledName = "",
  prefilledCity = "",
  prefilledState = "",
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const usCountry = countries.find((c) => c.code === "US");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: prefilledName,
    category: "NEW_VEHICLE" as (typeof CATEGORIES)[number]["value"],
    countryId: defaultCountryId ?? usCountry?.id ?? countries[0]?.id ?? "",
    cityName: prefilledCity,
    stateName: prefilledState,
    email: "",
    phone: "",
    website: "",
    address: "",
    postalCode: "",
  });

  if (!isAuthenticated) {
    const returnTo = `/register-dealership${prefilledName ? `?name=${encodeURIComponent(prefilledName)}` : ""}`;
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center max-w-lg mx-auto">
        <Store className="mx-auto text-gold-600 mb-4" size={36} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Create a free account first</h2>
        <p className="text-gray-600 text-sm mb-6">
          Sign up or sign in, then list your dealership on DealerVoice in under two minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/register?callbackUrl=${encodeURIComponent(returnTo)}`}>
            <Button className="bg-gold-gradient text-night-900 font-semibold border-0 w-full sm:w-auto">
              Create account
            </Button>
          </Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(returnTo)}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/dealerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
          address: form.address || undefined,
          postalCode: form.postalCode || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not register dealership. Check your details and try again.");
        return;
      }
      router.push("/dashboard/dealer/settings?welcome=1");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-5 max-w-xl mx-auto">
      <div>
        <Label htmlFor="dealer-name">Dealership name *</Label>
        <Input
          id="dealer-name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="ABC Motors"
          className="mt-1"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <select
            id="country"
            required
            value={form.countryId}
            onChange={(e) => setForm({ ...form, countryId: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.cityName} onChange={(e) => setForm({ ...form, cityName: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="state">State / region</Label>
          <Input id="state" value={form.stateName} onChange={(e) => setForm({ ...form, stateName: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Street address</Label>
        <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Business email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input id="website" type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="mt-1" />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full bg-gold-gradient text-night-900 font-semibold border-0">
        {busy ? <><Loader2 size={16} className="animate-spin mr-2" />Creating listing…</> : "List my dealership"}
      </Button>
      <p className="text-xs text-gray-500 text-center">
        Free to list. You&apos;ll manage your profile from the dealer dashboard.
      </p>
    </form>
  );
}
