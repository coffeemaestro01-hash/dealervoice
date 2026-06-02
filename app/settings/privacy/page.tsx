"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, PencilLine, Trash2, UserPlus, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { Button } from "@/components/ui/button";

interface DsrRow { id: string; kind: string; status: string; slaDueAt: string; createdAt: string }

export default function PrivacySettingsPage() {
  const [requests, setRequests] = useState<DsrRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: string; text: string } | null>(null);

  const load = () => fetch("/api/dsr").then((r) => r.ok ? r.json() : { requests: [] }).then((d) => setRequests(d.requests ?? [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const openOf = (kind: string) => requests.find((r) => r.kind === kind && ["submitted", "verifying", "in_progress"].includes(r.status));

  const submit = async (kind: string, payload?: any) => {
    setBusy(kind); setMsg(null);
    try {
      const res = await fetch("/api/dsr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, payload }) });
      const json = await res.json();
      if (!res.ok) { setMsg({ kind, text: json.error ?? "Something went wrong." }); return; }
      setMsg({ kind, text: "Request received — we'll email you and complete it within 30 days." });
      load();
    } finally { setBusy(null); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="container max-w-4xl py-12">
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy &amp; Your Data</h1>
          <p className="text-gray-600 mt-2 mb-8">
            Exercise your rights under the Digital Personal Data Protection Act, 2023 (§11–14). Requests are completed within 30 days.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* 1. Download */}
            <Card icon={Download} title="Download my data" desc="Get a copy of the personal data we hold about you (DPDP §11).">
              <div className="flex flex-wrap gap-2">
                <a href="/api/dsr/export">
                  <Button size="sm" className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90"><Download size={14} className="mr-1" /> Download now (JSON)</Button>
                </a>
                <Button size="sm" variant="outline" disabled={busy === "access"} onClick={() => submit("access")} className="border-gold/50 text-gold-700 hover:bg-gold-50">
                  {busy === "access" ? <Loader2 size={14} className="animate-spin" /> : "Log a formal request"}
                </Button>
              </div>
              <Status kind="access" msg={msg} open={openOf("access")} />
            </Card>

            {/* 2. Correct */}
            <CorrectionCard busy={busy} submit={submit} msg={msg} open={openOf("correction")} />

            {/* 3. Delete */}
            <DeleteCard busy={busy} submit={submit} msg={msg} open={openOf("erasure")} />

            {/* 4. Nominate */}
            <NominateCard busy={busy} submit={submit} msg={msg} open={openOf("nominate")} />

            {/* 5. Grievance */}
            <Card icon={ShieldAlert} title="Raise a grievance" desc="For privacy, content, payment, or account issues.">
              <Link href="/grievance"><Button size="sm" variant="outline" className="border-gold/50 text-gold-700 hover:bg-gold-50">Open grievance channel</Button></Link>
            </Card>
          </div>

          {requests.length > 0 && (
            <div className="mt-10">
              <h2 className="font-semibold text-gray-900 mb-3">Your requests</h2>
              <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="capitalize text-gray-800">{r.kind}</span>
                    <span className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === "completed" ? "bg-green-50 text-green-700" : "bg-gold-50 text-gold-700"}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Card({ icon: Icon, title, desc, children }: any) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-gold-50 text-gold-600 shrink-0"><Icon size={18} /></span>
        <div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-sm text-gray-500">{desc}</p></div>
      </div>
      {children}
    </div>
  );
}

function Status({ kind, msg, open }: any) {
  if (msg?.kind === kind) return <p className="text-sm text-green-600 mt-3 flex items-center gap-1"><CheckCircle2 size={14} />{msg.text}</p>;
  if (open) return <p className="text-xs text-gold-700 mt-3">Pending · due {new Date(open.slaDueAt).toLocaleDateString()}</p>;
  return null;
}

function CorrectionCard({ busy, submit, msg, open }: any) {
  const [field, setField] = useState(""); const [value, setValue] = useState("");
  return (
    <Card icon={PencilLine} title="Correct my data" desc="Tell us what to fix in your profile or a review (DPDP §12).">
      <div className="space-y-2">
        <input value={field} onChange={(e) => setField(e.target.value)} placeholder="What's wrong? (e.g. my display name)" className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Correct value" className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" />
        <Button size="sm" disabled={busy === "correction" || !field} onClick={() => submit("correction", { field, value })} className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
          {busy === "correction" ? <Loader2 size={14} className="animate-spin" /> : "Request correction"}
        </Button>
      </div>
      <Status kind="correction" msg={msg} open={open} />
    </Card>
  );
}

function DeleteCard({ busy, submit, msg, open }: any) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Card icon={Trash2} title="Delete my account & data" desc="Erase your account (DPDP §13). 14-day cooling-off; review text is anonymised, not deleted.">
      {!confirm ? (
        <Button size="sm" variant="outline" onClick={() => setConfirm(true)} className="border-red-200 text-red-600 hover:bg-red-50">Start deletion</Button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">This schedules deletion after a 14-day cooling-off window. You can cancel anytime before then.</p>
          <div className="flex gap-2">
            <Button size="sm" disabled={busy === "erasure"} onClick={() => submit("erasure")} className="bg-red-600 text-white hover:bg-red-700 border-0">
              {busy === "erasure" ? <Loader2 size={14} className="animate-spin" /> : "Confirm deletion"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <Status kind="erasure" msg={msg} open={open} />
    </Card>
  );
}

function NominateCard({ busy, submit, msg, open }: any) {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  return (
    <Card icon={UserPlus} title="Nominate a representative" desc="Nominate someone to exercise your rights if you can't (DPDP §14).">
      <div className="space-y-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nominee name" className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Nominee email" className="w-full h-9 rounded-md border border-gray-200 px-3 text-sm" />
        <Button size="sm" disabled={busy === "nominate" || !name || !email} onClick={() => submit("nominate", { name, email })} className="bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
          {busy === "nominate" ? <Loader2 size={14} className="animate-spin" /> : "Add nominee"}
        </Button>
      </div>
      <Status kind="nominate" msg={msg} open={open} />
    </Card>
  );
}
