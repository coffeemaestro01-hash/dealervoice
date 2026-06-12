"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, MapPin, Car, Fuel, Gauge, Palette, Hash, CalendarDays, Settings2, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FinanceCalculator } from "./FinanceCalculator";
import type { VehicleCondition } from "@prisma/client";

interface DealerMini {
  id: string;
  slug: string;
  name: string;
  cityName: string | null;
  stateName: string | null;
  overallRating: number;
  totalReviews: number;
  logoUrl: string | null;
}

interface VehicleDetailProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    trim: string | null;
    year: number | null;
    mileageKm: number | null;
    fuelType: string | null;
    transmission: string | null;
    condition: VehicleCondition;
    priceMinor: number | null;
    priceLabel: string | null;
    currency: string;
    color: string | null;
    vin: string | null;
    stockId: string | null;
    photos: string[];
    description: string | null;
    affiliateUrl: string | null;
    dealership: DealerMini;
  };
  formattedPrice: string;
}

const CONDITION_LABEL: Record<VehicleCondition, string> = {
  NEW: "New",
  USED: "Used",
  CERTIFIED: "Certified Pre-Owned",
};

export function VehicleDetailView({ vehicle, formattedPrice }: VehicleDetailProps) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);

  const photos = vehicle.photos.length > 0 ? vehicle.photos : [];
  const hasPhotos = photos.length > 0;

  function prev() { setPhotoIdx((i) => (i === 0 ? photos.length - 1 : i - 1)); }
  function next() { setPhotoIdx((i) => (i === photos.length - 1 ? 0 : i + 1)); }

  const specs = [
    vehicle.year ? { icon: CalendarDays, label: "Year", value: String(vehicle.year) } : null,
    vehicle.mileageKm != null ? { icon: Gauge, label: "Mileage", value: `${vehicle.mileageKm.toLocaleString("en-US")} km` } : null,
    vehicle.fuelType ? { icon: Fuel, label: "Fuel", value: vehicle.fuelType } : null,
    vehicle.transmission ? { icon: Settings2, label: "Transmission", value: vehicle.transmission } : null,
    vehicle.color ? { icon: Palette, label: "Color", value: vehicle.color } : null,
    vehicle.vin ? { icon: Hash, label: "VIN", value: vehicle.vin } : null,
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/vehicles" className="hover:text-gold-700">Vehicles</Link>
          <span>/</span>
          <Link href={`/dealership/${vehicle.dealership.slug}`} className="hover:text-gold-700">{vehicle.dealership.name}</Link>
          <span>/</span>
          <span className="text-gray-700">{[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Photos + Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Photo Carousel */}
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm">
              {hasPhotos ? (
                <div className="relative aspect-[16/9] bg-gray-100">
                  <Image
                    src={photos[photoIdx]}
                    alt={`${vehicle.make} ${vehicle.model} photo ${photoIdx + 1}`}
                    fill
                    className="object-cover"
                    priority={photoIdx === 0}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors grid place-items-center"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={next}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors grid place-items-center"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                        {photoIdx + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gray-100 grid place-items-center">
                  <Car size={48} className="text-gray-300" />
                </div>
              )}

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={cn(
                        "shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all",
                        i === photoIdx ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image src={src} alt={`Thumb ${i + 1}`} width={64} height={48} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + Price */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ")}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <ShieldCheck size={11} className="mr-1 text-green-600" />
                      {CONDITION_LABEL[vehicle.condition]}
                    </Badge>
                    {vehicle.stockId && (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Stock #{vehicle.stockId}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold-800">{formattedPrice}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ex-showroom</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1 bg-gold-800 hover:bg-gold-900 h-11"
                  onClick={() => setQuoteOpen(true)}
                >
                  Request Price
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gold-300 text-gold-800 hover:bg-gold-50 h-11"
                  onClick={() => setTestDriveOpen(true)}
                >
                  Book Test Drive
                </Button>
                {vehicle.affiliateUrl && (
                  <a href={vehicle.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
                      <ExternalLink size={16} />
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* Specs Grid */}
            {specs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Vehicle Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-gold-50 border border-gold-100 grid place-items-center shrink-0">
                        <Icon size={15} className="text-gold-700" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-3">About This Vehicle</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Right: Dealer + Finance */}
          <div className="space-y-5">
            {/* Dealer Mini Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Listed by</h3>
              <Link href={`/dealership/${vehicle.dealership.slug}`} className="group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {vehicle.dealership.logoUrl ? (
                      <Image
                        src={vehicle.dealership.logoUrl}
                        alt={vehicle.dealership.name}
                        width={48}
                        height={48}
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-300">{vehicle.dealership.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-gold-700 transition-colors truncate">
                      {vehicle.dealership.name}
                    </p>
                    {(vehicle.dealership.cityName || vehicle.dealership.stateName) && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {[vehicle.dealership.cityName, vehicle.dealership.stateName].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {vehicle.dealership.totalReviews > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-gray-700">
                          {vehicle.dealership.overallRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({vehicle.dealership.totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-xs border-gold-200 text-gold-800 hover:bg-gold-50">
                  View Dealer Profile
                </Button>
              </Link>
            </div>

            {/* Finance Calculator */}
            <FinanceCalculator
              defaultPrice={vehicle.priceMinor ?? 0}
              currency={vehicle.currency}
            />
          </div>
        </div>
      </div>

      {/* Lead Modals */}
      {(quoteOpen || testDriveOpen) && (
        <VehicleLeadModal
          type={quoteOpen ? "QUOTE" : "TEST_DRIVE"}
          dealershipId={vehicle.dealership.id}
          vehicleLabel={[vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ")}
          onClose={() => { setQuoteOpen(false); setTestDriveOpen(false); }}
        />
      )}
    </div>
  );
}

// Inline lead modal (keeps dependency count low)
function VehicleLeadModal({
  type,
  dealershipId,
  vehicleLabel,
  onClose,
}: {
  type: "QUOTE" | "TEST_DRIVE";
  dealershipId: string;
  vehicleLabel: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealershipId,
          name,
          email,
          phone,
          vehicle: vehicleLabel,
          message,
          type,
          source: `/vehicles`,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to send");
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {type === "QUOTE" ? "Request Price" : "Book Test Drive"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {sent ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 grid place-items-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">Request Sent!</p>
            <p className="text-sm text-gray-500">The dealership will contact you shortly.</p>
            <Button className="mt-4 w-full" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
              Vehicle: <span className="font-medium text-gray-800">{vehicleLabel}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-gold-400" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-gold-400" placeholder="+1 (312) 555-0100" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Email *</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:border-gold-400" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400 resize-none" placeholder={type === "QUOTE" ? "Any specific requirements?" : "Preferred date/time for test drive"} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" disabled={sending} className="w-full bg-gold-800 hover:bg-gold-900 h-10">
              {sending ? "Sending…" : type === "QUOTE" ? "Send Price Request" : "Book Test Drive"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
