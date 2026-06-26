/** Chicagoland metro — counties & cities for geo targeting. */
export const CHICAGOLAND_BBOX = {
  south: 41.35,
  west: -88.65,
  north: 42.55,
  east: -87.35,
} as const;

export const CHICAGOLAND_CITIES = [
  "Chicago",
  "Evanston",
  "Skokie",
  "Niles",
  "Park Ridge",
  "Des Plaines",
  "Rosemont",
  "Oak Park",
  "Berwyn",
  "Cicero",
  "Oak Lawn",
  "Orland Park",
  "Tinley Park",
  "Palos Hills",
  "Calumet City",
  "Hammond",
  "Gary",
  "Naperville",
  "Aurora",
  "Elgin",
  "Schaumburg",
  "Arlington Heights",
  "Palatine",
  "Mount Prospect",
  "Wheaton",
  "Downers Grove",
  "Lombard",
  "Elmhurst",
  "Glenview",
  "Northbrook",
  "Waukegan",
  "Gurnee",
  "Joliet",
  "Bolingbrook",
  "St Charles",
  "Geneva",
  "Rockford",
  "Springfield",
] as const;

export function chicagolandCityWhere() {
  return {
    OR: CHICAGOLAND_CITIES.map((city) => ({
      cityName: { contains: city, mode: "insensitive" as const },
    })),
  };
}
