"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function AdminDealerImport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/admin/dealers/import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      setResult(json.data);
      toast({ title: "Import complete", description: `${json.data.imported} dealers imported` });
    } catch (err) {
      toast({ title: "Import failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6 max-w-xl">
      <div className="rounded-lg bg-gray-50 border border-gray-100 p-4 text-xs text-gray-600 font-mono mb-4">
        name,state,city,district,phone,website,email,address
        <br />
        Maruti Arena Mumbai,Maharashtra,Mumbai,Mumbai Suburban,+91...,https://...,sales@example.com,Andheri West
      </div>
      <label className="block">
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} disabled={loading} />
        <Button asChild disabled={loading}>
          <span className="cursor-pointer gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload CSV
          </span>
        </Button>
      </label>
      {result && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 size={16} />
          {result.imported} imported · {result.skipped} skipped (duplicates)
        </div>
      )}
    </div>
  );
}
