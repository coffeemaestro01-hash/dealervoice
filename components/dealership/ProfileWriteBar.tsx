"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProfileWriteBar({ dealershipId, highlight }: { dealershipId: string; highlight?: boolean }) {
  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur-sm p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] ${
        highlight ? "border-gold-400 ring-2 ring-gold-400/30" : "border-gray-200"
      }`}
    >
      <Link href={`/write-review/${dealershipId}`} className="block">
        <Button className="w-full h-11 bg-gold-600 hover:bg-gold-700 text-white font-semibold gap-2">
          <PenLine size={16} />
          Write a review
        </Button>
      </Link>
    </div>
  );
}
