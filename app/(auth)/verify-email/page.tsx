"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FooterBrand } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

function VerifyInner() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setState("error"); setMessage("This verification link is missing its token."); return; }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (res.ok) { setState("ok"); setMessage(json.message); }
        else { setState("error"); setMessage(json.error ?? "Verification failed."); }
      } catch {
        setState("error"); setMessage("Something went wrong. Please try again.");
      }
    })();
  }, [token]);

  return (
    <div className="text-center">
      {state === "loading" && (
        <>
          <Loader2 className="mx-auto text-primary animate-spin mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground mb-2">Verifying your email…</h1>
          <p className="text-muted-foreground">One moment.</p>
        </>
      )}
      {state === "ok" && (
        <>
          <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground mb-2">Email verified! 🎉</h1>
          <p className="text-muted-foreground mb-6">Your account is now active. You can sign in and start exploring.</p>
          <Link href="/login"><Button className="bg-primary text-primary-foreground font-semibold border-0 hover:opacity-90">Sign in</Button></Link>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="mx-auto text-destructive mb-4" size={48} />
          <h1 className="text-2xl font-bold text-foreground mb-2">Verification failed</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link href="/register"><Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">Back to register</Button></Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-showroom px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8"><div className="flex justify-center mb-4"><FooterBrand height={34} /></div></div>
        <div className="bg-card rounded-2xl border border-primary/30 shadow-ember p-8">
          <Suspense fallback={<div className="text-center text-muted-foreground">Loading…</div>}>
            <VerifyInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
