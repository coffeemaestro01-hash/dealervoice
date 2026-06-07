"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

export interface BlogPostFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  category: string;
  isPublished: boolean;
  metaTitle: string;
  metaDesc: string;
}

interface Props {
  initial: BlogPostFormData;
  isNew?: boolean;
}

export function BlogPostEditor({ initial, isNew }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof BlogPostFormData, value: string | boolean) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "title" && isNew && typeof value === "string") {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function save(publish?: boolean) {
    setError("");
    setBusy(true);
    const payload = { ...form, isPublished: publish ?? form.isPublished };
    try {
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${form.id}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Save failed");
        return;
      }
      router.push("/dashboard/admin/cms");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!form.id || !confirm("Delete this post permanently?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${form.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/admin/cms");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="grid gap-3">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Author</Label>
            <Input value={form.authorName} onChange={(e) => update("authorName", e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Buyer Guide" />
          </div>
        </div>
        <div>
          <Label>Excerpt</Label>
          <Textarea rows={2} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} />
        </div>
        <div>
          <Label>Content (Markdown or HTML)</Label>
          <Textarea rows={14} value={form.content} onChange={(e) => update("content", e.target.value)} className="font-mono text-sm" />
        </div>
        <div>
          <Label>Cover image URL</Label>
          <Input value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} placeholder="https://" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Meta title</Label>
            <Input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
          </div>
          <div>
            <Label>Meta description</Label>
            <Input value={form.metaDesc} onChange={(e) => update("metaDesc", e.target.value)} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button disabled={busy} onClick={() => save(false)} variant="outline">
          {busy ? <Loader2 className="animate-spin" size={16} /> : "Save draft"}
        </Button>
        <Button disabled={busy} onClick={() => save(true)} className="bg-gold-gradient text-night-900 font-semibold border-0">
          {busy ? <Loader2 className="animate-spin" size={16} /> : "Publish"}
        </Button>
        {!isNew && (
          <Button disabled={busy} variant="destructive" onClick={remove} className="ml-auto">
            <Trash2 size={16} className="mr-1" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
