"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface Props {
  dealershipId: string;
  variant?: "default" | "compact";
}

export function SaveButton({ dealershipId, variant = "default" }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/saved-dealers?dealershipId=${dealershipId}`)
      .then((r) => r.json())
      .then((j) => setSaved(j.saved ?? false))
      .catch(() => {});
  }, [session, dealershipId]);

  if (!session?.user) return null;

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const prev = saved;
    setSaved(!prev);
    try {
      const method = prev ? "DELETE" : "POST";
      const url = prev
        ? `/api/saved-dealers?dealershipId=${dealershipId}`
        : `/api/saved-dealers`;
      const body = prev ? undefined : JSON.stringify({ dealershipId });
      const res = await fetch(url, {
        method,
        headers: prev ? undefined : { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) setSaved(prev);
    } catch {
      setSaved(prev);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        aria-label={saved ? "Remove from saved dealers" : "Save dealer"}
        className={cn(
          "w-9 h-9 rounded-full border grid place-items-center transition-all",
          saved
            ? "border-gold-300 bg-gold-50 text-gold-700"
            : "border-gray-200 bg-white text-gray-500 hover:border-gold-300 hover:text-gold-600"
        )}
      >
        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "gap-1.5 transition-all",
        saved
          ? "border-gold-300 bg-gold-50 text-gold-800 hover:bg-gold-100"
          : "border-gray-200 text-gray-700 hover:border-gold-300 hover:text-gold-700"
      )}
    >
      {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
