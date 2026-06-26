import prisma from "@/lib/db";
import { CHICAGOLAND_BBOX } from "@/lib/geo/chicagoland";
import {
  bboxCarDealerQuery,
  fetchOverpass,
  illinoisCarDealerQuery,
  importDealerRecords,
  nodesToDealerRecords,
} from "@/lib/geo/osm-dealer-import";

/** Import Chicagoland + Illinois dealers from OSM (callable from admin API). */
export async function importChicagolandFromOsm() {
  const us = await prisma.country.findUnique({ where: { code: "US" }, select: { id: true } });
  if (!us) throw new Error("US country not found");

  const { south, west, north, east } = CHICAGOLAND_BBOX;
  const metroNodes = await fetchOverpass(bboxCarDealerQuery(south, west, north, east, 4000));
  const metroRecords = nodesToDealerRecords(metroNodes, "Illinois");
  const metro = await importDealerRecords(prisma, us.id, metroRecords, 1200);

  const ilNodes = await fetchOverpass(illinoisCarDealerQuery(3500));
  const ilRecords = nodesToDealerRecords(ilNodes, "Illinois");
  const il = await importDealerRecords(prisma, us.id, ilRecords, 800);

  const ilTotal = await prisma.dealership.count({
    where: {
      countryId: us.id,
      deletedAt: null,
      OR: [
        { stateName: { equals: "IL", mode: "insensitive" } },
        { stateName: { contains: "Illinois", mode: "insensitive" } },
      ],
    },
  });

  return { metro, il, ilTotal };
}
