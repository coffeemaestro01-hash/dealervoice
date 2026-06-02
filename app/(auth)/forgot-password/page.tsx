"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { FooterBrand } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-night-gradient px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><FooterBrand height={34} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-gold/20 shadow-gold p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-gray-600 mb-6">
                If an account exists for <span className="font-medium">{email}</span>, we&apos;ve sent a password reset link. It expires in 1 hour.
              </p>
              <Link href="/login"><Button variant="outline" className="border-gold/50 text-gold-700 hover:bg-gold-50"><ArrowLeft size={16} className="mr-1" /> Back to sign in</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
              <p className="text-gray-600 mb-6">Enter your email and we&apos;ll send you a link to reset it.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="you@email.com" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gold-gradient text-night-900 font-semibold border-0 hover:opacity-90">
                  {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Sending…</> : "Send reset link"}
                </Button>
              </form>
              <p className="text-center mt-6">
                <Link href="/login" className="text-sm text-gold-700 hover:underline inline-flex items-center gap-1"><ArrowLeft size={14} /> Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
