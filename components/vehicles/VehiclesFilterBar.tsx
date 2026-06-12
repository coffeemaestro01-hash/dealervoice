"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COUNTRIES = [
  { code: "", label: "All regions" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "AE", label: "UAE" },
];

const CONDITIONS = [
  { value: "", label: "Any condition" },
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "CERTIFIED", label: "Certified" },
];

export function VehiclesFilterBar({ makes }: { makes: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    const country = String(form.get("country") ?? "");
    const make = String(form.get("make") ?? "");
    const condition = String(form.get("condition") ?? "");
    const q = String(form.get("q") ?? "").trim();
    if (country) next.set("country", country);
    if (make) next.set("make", make);
    if (condition) next.set("condition", condition);
    if (q) next.set("q", q);
    router.push(`/vehicles?${next.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row flex-wrap gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Search make or model…"
          className="pl-9 bg-white"
        />
      </div>
      <select
        name="country"
        defaultValue={params.get("country") ?? ""}
        className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code || "all"} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        name="make"
        defaultValue={params.get("make") ?? ""}
        className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 min-w-[140px]"
      >
        <option value="">Any make</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        name="condition"
        defaultValue={params.get("condition") ?? ""}
        className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
      >
        {CONDITIONS.map((c) => (
          <option key={c.value || "any"} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <Button type="submit" className="bg-gold-800 hover:bg-gold-900">
        Filter
      </Button>
    </form>
  );
}
