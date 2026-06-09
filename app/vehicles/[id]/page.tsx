import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { VehicleDetailView } from "@/components/vehicles/VehicleDetailView";
import { formatIncomeMinor } from "@/lib/income/ledger";

interface Props {
  params: Promise<{ id: string }>;
}

async function getVehicle(id: string) {
  return prisma.vehicleListing.findUnique({
    where: { id, isActive: true },
    include: {
      dealership: {
        select: {
          id: true,
          slug: true,
          name: true,
          cityName: true,
          stateName: true,
          overallRating: true,
          totalReviews: true,
          logoUrl: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const v = await getVehicle(id);
  if (!v) return {};
  const title = [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
  const price = v.priceLabel ?? (v.priceMinor != null ? formatIncomeMinor(v.priceMinor, v.currency) : "Price on request");
  return {
    title: `${title} — ${v.dealership.name} | DealerVoice`,
    description: `${title} for sale at ${v.dealership.name}. ${price}. ${v.description?.slice(0, 120) ?? ""}`,
    openGraph: {
      images: v.photos[0] ? [{ url: v.photos[0] }] : [],
    },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  const formattedPrice =
    vehicle.priceLabel ??
    (vehicle.priceMinor != null
      ? formatIncomeMinor(vehicle.priceMinor, vehicle.currency)
      : "Price on request");

  return (
    <VehicleDetailView
      vehicle={vehicle}
      formattedPrice={formattedPrice}
    />
  );
}
