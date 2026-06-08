export interface GarageDealerRow {
  name: string;
  cityName: string;
  stateName: string;
  address: string;
  phone: string | null;
  mobile: string | null;
  email: string | null;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;

/**
 * Parse Cashless Garages PDF text (pdftotext -layout).
 * Most rows lack dealer email; mobile numbers are used for outreach queue.
 */
export function parseCashlessGaragesPdf(text: string): GarageDealerRow[] {
  const records: GarageDealerRow[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.replace(/\f/g, "").trim();
    if (!line || line.startsWith("SR NO") || line.startsWith("CHENNAI\n") || /^RO-/i.test(line)) continue;

    // Numbered dealer rows: "1             AIE CARS MARUTI ..."
    const m = line.match(/^(\d+)\s+(.+?)\s{2,}(.+?)\s{2,}([A-Z][A-Z\s]+?)\s{2,}([A-Z][A-Z\s]+?)\s{2,}(.*)$/);
    if (!m) continue;

    const name = m[2].trim();
    const address = m[3].trim();
    const cityName = m[4].trim();
    const stateName = m[5].trim();
    const tail = m[6];

    if (!name || name.length < 3 || cityName.length < 2) continue;

    const emails = (tail.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()).filter((e) => e !== "na");
    const mobiles = tail.match(/\b[6-9]\d{9}\b/g) ?? [];
    const phones = tail.match(/\b0\d{9,11}\b/g) ?? [];

    records.push({
      name,
      address,
      cityName,
      stateName: stateName === "TAMILNADU" ? "Tamil Nadu" : stateName === "MAHARASHTRA" ? "Maharashtra" : stateName,
      phone: phones[0] ?? null,
      mobile: mobiles[0] ?? null,
      email: emails[0] ?? null,
    });
  }

  return records;
}
