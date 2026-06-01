"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Something went wrong."); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid link</h1>
        <p className="text-gray-600 mb-6">This password reset link is missing or malformed. Please request a new one.</p>
        <Link href="/forgot-password"><Button className="bg-gold-gradient text-night-900 font-semibold border-0">Request new link</Button></Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h1>
        <p className="text-gray-600 mb-6">Your password has been updated. Redirecting you to sign in…</p>
        <Link href="/login"><Button variant="outline" className="border-gold/50 text-gold-700 hover:bg-gold-50">Sign in now</Button></Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose a new password</h1>
      <p className="text-gray-600 mb-6">Enter a new password for your account.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <div className="relative mt-1">
            <Input id="password" type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
          {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Updating…</> : "Reset password"}
        </Button>
      </form>
      <p className="text-center mt-6">
        <Link href="/login" className="text-sm text-gold-700 hover:underline inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to sign in</Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-night-gradient px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><div className="flex justify-center mb-4"><Logo variant="full" height={34} /></div></div>
        <div className="bg-white rounded-2xl border border-gold/20 shadow-gold p-8">
          <Suspense fallback={<div className="text-center text-gray-500">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
