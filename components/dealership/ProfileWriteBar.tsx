"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileWriteBar({ dealershipId, highlight }: { dealershipId: string; highlight?: boolean }) {
  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card backdrop-blur-sm p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${
        highlight ? "border-primary/30 ring-2 ring-primary/30" : "border-border"
      }`}
    >
      <Link href={`/write-review/${dealershipId}`} className="block">
        <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-foreground font-semibold gap-2">
          <PenLine size={16} />
          Write a review
        </Button>
      </Link>
    </div>
  );
}
