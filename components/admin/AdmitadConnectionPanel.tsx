"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

type Program = { id: number; name: string; status: string; siteUrl: string };

export function AdmitadConnectionPanel() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/ads/admitad")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(d.configured);
        setPrograms(d.programs ?? []);
        setMessage(d.message ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-20 rounded-xl bg-gray-50 animate-pulse" />;
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        configured && programs.length > 0
          ? "bg-green-50 border-green-200"
          : configured
            ? "bg-amber-50 border-amber-200"
            : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {configured && programs.length > 0 ? (
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
        ) : (
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">
            Admitad API {configured ? (programs.length > 0 ? "connected" : "configured — join programs") : "not configured"}
          </p>
          {!configured && (
            <p className="text-sm text-gray-600 mt-1">
              Add <code className="text-xs bg-white px-1 rounded">ADMITAD_CLIENT_ID</code> and{" "}
              <code className="text-xs bg-white px-1 rounded">ADMITAD_CLIENT_SECRET</code> to Vercel env vars.
            </p>
          )}
          {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
          {programs.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Approved programs — paste <strong>ID</strong> into Affiliate ref, set Param to <code>admitad</code>:
              </p>
              <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                {programs.slice(0, 15).map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-gray-700">
                    <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">{p.id}</span>
                    <span className="truncate">{p.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <a
            href="https://www.admitad.com/en/webmaster/websites/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gold-700 hover:underline mt-2"
          >
            Open Admitad dashboard <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
