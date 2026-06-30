"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Template = {
  id: string;
  title: string;
  body: string;
  shortcut: string | null;
  category: string | null;
  isActive: boolean;
};

const EMPTY_FORM = { title: "", body: "", shortcut: "", category: "" };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function loadTemplates() {
    setLoading(true);
    fetch("/api/inbox/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function startEdit(t: Template) {
    setEditingId(t.id);
    setCreating(false);
    setForm({
      title: t.title,
      body: t.body,
      shortcut: t.shortcut ?? "",
      category: t.category ?? "",
    });
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      shortcut: form.shortcut.trim() || null,
      category: form.category.trim() || null,
    };

    const res = editingId
      ? await fetch(`/api/inbox/templates/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/inbox/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (res.ok) {
      cancelForm();
      loadTemplates();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading templates…
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground mt-1">Canned responses for common customer inquiries.</p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus size={16} />
          New template
        </Button>
      </div>

      {(creating || editingId) && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{editingId ? "Edit template" : "New template"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Service appointment confirmation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortcut">Shortcut</Label>
                <Input
                  id="shortcut"
                  value={form.shortcut}
                  onChange={(e) => setForm((f) => ({ ...f, shortcut: e.target.value }))}
                  placeholder="svc-appt"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Service"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={8}
                placeholder="Hello {{customer_name}}, …"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </Button>
              <Button variant="outline" onClick={cancelForm} className="gap-2">
                <X size={14} />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center text-center">
            <FileText className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No templates yet. Create your first canned response.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{t.title}</h3>
                      {t.category && (
                        <Badge variant="outline" className="text-xs">
                          {t.category}
                        </Badge>
                      )}
                      {t.shortcut && (
                        <Badge variant="outline" className="text-xs font-mono">
                          /{t.shortcut}
                        </Badge>
                      )}
                      {!t.isActive && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{t.body}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => startEdit(t)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
