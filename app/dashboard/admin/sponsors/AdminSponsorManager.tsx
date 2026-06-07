"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminSponsorManager({
  dealers,
}: {
  dealers: { id: string; name: string; slug: string; cityName: string | null }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(dealers[0]?.id ?? "");
  const [label, setLabel] = useState("Sponsored");
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(sponsored: boolean) {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch("/api/admin/sponsors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId: selected,
          isSponsored: sponsored,
          sponsorLabel: label,
          sponsoredUntil: until ? new Date(until).toISOString() : null,
        }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border p-5 space-y-3 max-w-lg">
      <h2 className="font-semibold">Add / update sponsor</h2>
      <select className="w-full h-10 border rounded-md px-3 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
        {dealers.map((d) => (
          <option key={d.id} value={d.id}>{d.name} · {d.cityName}</option>
        ))}
      </select>
      <Input placeholder="Badge label" value={label} onChange={(e) => setLabel(e.target.value)} />
      <Input type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => save(true)} className="bg-gold-gradient text-night-900 font-semibold border-0">
          Enable sponsor
        </Button>
        <Button disabled={busy} variant="outline" onClick={() => save(false)}>Remove</Button>
      </div>
    </div>
  );
}
