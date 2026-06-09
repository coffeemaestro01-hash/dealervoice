import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { formatIncomeMinor } from "@/lib/income/ledger";
import type { VehicleCondition } from "@prisma/client";

const CONDITION_STYLES: Record<VehicleCondition, string> = {
  NEW: "bg-green-50 text-green-700 border-green-200",
  USED: "bg-gray-50 text-gray-600 border-gray-200",
  CERTIFIED: "bg-gold-50 text-gold-800 border-gold-200",
};

export type VehicleListingCardData = {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number | null;
  mileageKm: number | null;
  fuelType: string | null;
  condition: VehicleCondition;
  priceMinor: number | null;
  priceLabel: string | null;
  currency: string;
  photos: string[];
  countryCode: string;
  dealership: {
    name: string;
    slug: string;
    cityName: string | null;
    stateName: string | null;
    overallRating: number;
    totalReviews: number;
  };
};

function formatPrice(v: VehicleListingCardData) {
  if (v.priceLabel) return v.priceLabel;
  if (v.priceMinor == null) return "Price on request";
  return formatIncomeMinor(v.priceMinor, v.currency);
}

export function VehicleListingCard({ vehicle }: { vehicle: VehicleListingCardData }) {
  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const location = [vehicle.dealership.cityName, vehicle.dealership.stateName].filter(Boolean).join(", ");
  const photo = vehicle.photos[0];

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-gold/40 hover:shadow-md transition-all"
    >
      <div className="relative h-44 bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 text-sm font-medium">
            {vehicle.make} {vehicle.model}
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CONDITION_STYLES[vehicle.condition]}`}
        >
          {vehicle.condition === "CERTIFIED" ? "Certified" : vehicle.condition}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-lg font-bold text-gray-900 group-hover:text-gold-800 transition-colors">{title}</p>
        {vehicle.trim && <p className="text-sm text-gray-500">{vehicle.trim}</p>}
        <p className="text-base font-semibold text-gold-800 mt-2">{formatPrice(vehicle)}</p>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          {[vehicle.mileageKm != null ? `${vehicle.mileageKm.toLocaleString()} km` : null, vehicle.fuelType]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{vehicle.dealership.name}</p>
            {location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                {location}
              </p>
            )}
          </div>
          {vehicle.dealership.totalReviews > 0 && (
            <span className="text-xs text-gray-500 shrink-0 flex items-center gap-0.5">
              <ShieldCheck size={10} className="text-gold-600" />
              {vehicle.dealership.overallRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
