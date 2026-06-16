"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Bookmark,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReviewStatus = "PENDING" | "PUBLISHED" | "FLAGGED" | "REMOVED" | "UNDER_REVIEW";
type LeadType = "QUOTE" | "TEST_DRIVE" | "GENERAL" | "FINANCE";
type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";
type VerificationStatus = "UNVERIFIED" | "VERIFIED_PURCHASE" | "VERIFIED_SERVICE" | "PENDING";

interface DealerMini {
  id: string;
  name: string;
  slug: string;
  cityName: string | null;
  logoUrl: string | null;
  stateName?: string | null;
  overallRating?: number;
  totalReviews?: number;
}

interface ReviewItem {
  id: string;
  title: string;
  overallRating: number;
  status: ReviewStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  dealership: DealerMini;
}

interface LeadItem {
  id: string;
  type: LeadType;
  status: LeadStatus;
  vehicle: string | null;
  createdAt: string;
  dealership: DealerMini;
}

interface SavedDealerItem {
  id: string;
  createdAt: string;
  dealership: DealerMini & { overallRating: number; totalReviews: number };
}

interface Props {
  user: { id: string; name: string; email: string };
  reviews: ReviewItem[];
  leads: LeadItem[];
  savedDealers: SavedDealerItem[];
}

type Tab = "reviews" | "quotes" | "saved";

const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; icon: React.ElementType; className: string }> = {
  PUBLISHED: { label: "Published", icon: CheckCircle2, className: "text-primary bg-muted border-primary/20" },
  PENDING: { label: "Pending", icon: Clock, className: "text-primary bg-primary/10 border-primary/20" },
  UNDER_REVIEW: { label: "Under Review", icon: Clock, className: "text-primary bg-muted border-primary/20" },
  FLAGGED: { label: "Flagged", icon: XCircle, className: "text-primary bg-muted border-primary/20" },
  REMOVED: { label: "Removed", icon: XCircle, className: "text-destructive bg-destructive/10 border-primary/20" },
};

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: "Awaiting response", className: "text-primary bg-muted border-primary/20" },
  CONTACTED: { label: "Dealer contacted you", className: "text-primary bg-primary/10 border-primary/20" },
  CONVERTED: { label: "Completed", className: "text-primary bg-muted border-primary/20" },
  CLOSED: { label: "Closed", className: "text-muted-foreground bg-muted border-border" },
};

const LEAD_TYPE_LABEL: Record<LeadType, string> = {
  QUOTE: "Price Request",
  TEST_DRIVE: "Test Drive",
  GENERAL: "General Enquiry",
  FINANCE: "Finance Enquiry",
};

function DealerLogo({ dealer }: { dealer: DealerMini }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
      {dealer.logoUrl ? (
        <Image src={dealer.logoUrl} alt={dealer.name} width={40} height={40} className="object-contain p-0.5" />
      ) : (
        <span className="text-base font-bold text-muted-foreground">{dealer.name[0]}</span>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export function CustomerDashboard({ user, reviews, leads, savedDealers }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [localSaved, setLocalSaved] = useState(savedDealers);

  async function unsaveDealer(dealershipId: string, entryId: string) {
    setRemovingId(entryId);
    try {
      await fetch(`/api/saved-dealers?dealershipId=${dealershipId}`, { method: "DELETE" });
      setLocalSaved((prev) => prev.filter((s) => s.id !== entryId));
    } finally {
      setRemovingId(null);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "reviews", label: "My Reviews", icon: MessageSquare, count: reviews.length },
    { id: "quotes", label: "My Quotes", icon: Mail, count: leads.length },
    { id: "saved", label: "Saved Dealers", icon: Bookmark, count: localSaved.length },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-pearl text-foreground">
        <div className="container py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 grid place-items-center">
              <Star size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="text-sm text-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Reviews", value: reviews.length, icon: MessageSquare },
              { label: "Quotes", value: leads.length, icon: Mail },
              { label: "Saved", value: localSaved.length, icon: Bookmark },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-xl p-3 border border-border text-center">
                <Icon size={16} className="text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-xl border border-border shadow-sm p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[20px] text-center",
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* My Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No reviews yet"
                description="Share your dealership experience and help other buyers."
                cta={{ label: "Write a Review", href: "/write-review" }}
              />
            ) : (
              reviews.map((review) => {
                const statusCfg = REVIEW_STATUS_CONFIG[review.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={review.id} className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-start gap-3">
                    <DealerLogo dealer={review.dealership} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/dealership/${review.dealership.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm block truncate">
                            {review.dealership.name}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate">{review.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < review.overallRating ? "fill-primary text-primary" : "text-muted-foreground"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border", statusCfg.className)}>
                          <StatusIcon size={10} />
                          {statusCfg.label}
                        </span>
                        {review.verificationStatus === "PENDING" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border text-primary bg-muted border-primary/20">
                            <Clock size={10} />
                            Verification pending
                          </span>
                        )}
                        {(review.verificationStatus === "VERIFIED_PURCHASE" || review.verificationStatus === "VERIFIED_SERVICE") && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border text-primary bg-muted border-primary/20">
                            <ShieldCheck size={10} />
                            Verified Buyer
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <Link href={`/dealership/${review.dealership.slug}`} className="text-muted-foreground hover:text-primary shrink-0">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* My Quotes */}
        {activeTab === "quotes" && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="No enquiries yet"
                description="Request a price quote or book a test drive from any dealership."
                cta={{ label: "Find Dealers", href: "/dealers" }}
              />
            ) : (
              leads.map((lead) => {
                const statusCfg = LEAD_STATUS_CONFIG[lead.status];
                return (
                  <div key={lead.id} className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-start gap-3">
                    <DealerLogo dealer={lead.dealership} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/dealership/${lead.dealership.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm block truncate">
                            {lead.dealership.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {LEAD_TYPE_LABEL[lead.type]}
                            {lead.vehicle && ` · ${lead.vehicle}`}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-medium border shrink-0", statusCfg.className)}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">{formatDate(lead.createdAt)}</p>
                    </div>
                    <Link href={`/dealership/${lead.dealership.slug}`} className="text-muted-foreground hover:text-primary shrink-0">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Saved Dealers */}
        {activeTab === "saved" && (
          <div className="space-y-3">
            {localSaved.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved dealers"
                description="Save dealers you're interested in to keep track of them here."
                cta={{ label: "Browse Dealers", href: "/dealers" }}
              />
            ) : (
              localSaved.map((entry) => (
                <div key={entry.id} className="bg-card rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">
                  <DealerLogo dealer={entry.dealership} />
                  <div className="flex-1 min-w-0">
                    <Link href={`/dealership/${entry.dealership.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm block truncate">
                      {entry.dealership.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {entry.dealership.totalReviews > 0 && (
                        <div className="flex items-center gap-1">
                          <Star size={11} className="fill-primary text-primary" />
                          <span className="text-xs font-semibold text-foreground">
                            {entry.dealership.overallRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">({entry.dealership.totalReviews})</span>
                        </div>
                      )}
                      {entry.dealership.cityName && (
                        <span className="text-xs text-muted-foreground">{entry.dealership.cityName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dealership/${entry.dealership.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
                        View
                      </Button>
                    </Link>
                    <button
                      onClick={() => unsaveDealer(entry.dealership.id, entry.id)}
                      disabled={removingId === entry.id}
                      className="text-muted-foreground hover:text-destructive transition-colors text-xs px-2 py-1 rounded"
                      aria-label="Remove from saved"
                    >
                      {removingId === entry.id ? "…" : "✕"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-8 bg-pearl rounded-xl p-5 text-foreground flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold">Looking for your next car?</p>
            <p className="text-sm text-foreground mt-0.5">Search verified dealers and read honest reviews.</p>
          </div>
          <Link href="/dealers">
            <Button className="bg-primary hover:bg-primary/90 text-foreground border-0 shrink-0">
              <Car size={15} className="mr-1.5" />
              Browse Dealers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
        <Icon size={22} className="text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{description}</p>
      <Link href={cta.href}>
        <Button size="sm" className="mt-4 bg-primary hover:bg-primary/90">
          {cta.label}
        </Button>
      </Link>
    </div>
  );
}
