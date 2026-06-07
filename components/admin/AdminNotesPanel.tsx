"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Note {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
}

export function AdminNotesPanel({
  targetType,
  targetId,
}: {
  targetType: "user" | "dealership";
  targetId: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/notes?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => r.json())
      .then((d) => setNotes(d.data ?? []));
  }, [targetType, targetId]);

  async function addNote() {
    if (body.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, body }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setNotes((n) => [data, ...n]);
        setBody("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-amber-900">Internal notes (team only)</p>
      <Textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Called May 7, awaiting docs…" />
      <Button size="sm" disabled={busy} onClick={addNote}>
        Add note
      </Button>
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {notes.map((n) => (
          <li key={n.id} className="text-xs text-amber-900 bg-white/60 rounded p-2">
            <span className="font-medium">{n.author.name}</span> · {new Date(n.createdAt).toLocaleString()}
            <p className="mt-0.5">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
