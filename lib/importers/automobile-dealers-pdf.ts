export interface PdfDealerRow {
  name: string;
  cityName: string;
  stateName: string;
  address: string;
  postalCode: string;
  email: string | null;
  phone: string | null;
}

const STATE_RE =
  /(Uttar Pradesh|Maharashtra|Gujarat|Karnataka|Tamil Nadu|Bihar|Orissa|Odisha|Jharkhand|Madhya Pradesh|Rajasthan|West Bengal|Haryana|Punjab|Kerala|Andhra Pradesh|Telangana|Assam|Nagaland|Chhattisgarh|Goa|Himachal Pradesh|Jammu and Kashmir|Uttarakhand|Delhi|Pondichery|Pondicherry)/;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/** Parse layout text extracted via `pdftotext -layout` from Automobile-Dealers.pdf */
export function parseAutomobileDealersPdf(text: string): PdfDealerRow[] {
  const records: PdfDealerRow[] = [];
  let current: PdfDealerRow | null = null;

  for (const raw of text.split("\n")) {
    const line = raw.replace(/\f/g, "").trimEnd();
    if (!line.trim() || line.startsWith("CITY ")) continue;

    const rowMatch = line.match(new RegExp(`^(.+?)\\s+${STATE_RE.source}\\s+(\\d{6})\\s+(.+)$`));
    if (rowMatch) {
      if (current) records.push(current);

      const left = rowMatch[1].trim();
      const stateName = rowMatch[2];
      const postalCode = rowMatch[3];
      const rest = rowMatch[4];

      const emails = (rest.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase());
      const phones = (rest.replace(/,/g, " ").match(/\d{10,}/g) ?? []);

      const parts = left
        .split(/\s{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

      let cityName = "";
      let name = "";
      let address = "";

      if (parts.length >= 3) {
        cityName = parts[0];
        name = parts[1];
        address = parts.slice(2).join(" ");
      } else if (parts.length === 2) {
        [cityName, name] = parts;
      } else {
        const words = left.split(/\s+/);
        cityName = words[0] ?? "";
        name = words.slice(1, 4).join(" ");
        address = words.slice(4).join(" ");
      }

      current = {
        cityName,
        name,
        address,
        stateName: stateName === "Orissa" ? "Odisha" : stateName,
        postalCode,
        email: emails[0] ?? null,
        phone: phones[0] ?? null,
      };
    } else if (current) {
      const extra = line.trim();
      if (extra) current.address = `${current.address} ${extra}`.trim();
    }
  }

  if (current) records.push(current);
  return records.filter((r) => r.name && r.postalCode);
}
