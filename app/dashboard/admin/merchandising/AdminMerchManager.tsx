"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminMerchManager({
  dealers,
  pinned,
}: {
  dealers: { id: string; name: string }[];
  pinned: { id: string; name: string; homepagePinOrder: number | null }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(dealers[0]?.id ?? "");
  const [pin, setPin] = useState("1");

  async function save() {
    await fetch("/api/admin/merchandising", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealershipId: selected, homepagePinOrder: Number(pin) }),
    });
    router.refresh();
  }

  async function unpin(id: string) {
    await fetch("/api/admin/merchandising", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealershipId: id, homepagePinOrder: null }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border p-5 flex flex-wrap gap-2 items-end max-w-lg">
        <select className="border rounded-md px-3 h-10 text-sm flex-1" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <Input type="number" min={1} max={20} className="w-20" value={pin} onChange={(e) => setPin(e.target.value)} />
        <Button onClick={save}>Pin to homepage</Button>
      </div>
      <div className="bg-card rounded-xl border divide-y">
        {pinned.map((p) => (
          <div key={p.id} className="px-4 py-3 flex justify-between">
            <span>#{p.homepagePinOrder} {p.name}</span>
            <Button size="sm" variant="outline" onClick={() => unpin(p.id)}>Unpin</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
