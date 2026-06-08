export interface ZigWheelsDealer {
  name: string;
  phone: string | null;
  email: string | null;
  address: string;
  postalCode: string | null;
  cityName: string;
  stateName: string;
}

function stripHtml(text: string) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractField(block: string, label: "Location" | "Email" | "Contact") {
  const re = new RegExp(
    `<span>${label}</span>\\s*([^<]+(?:<[^/][^>]*>[^<]*)*)`,
    "i",
  );
  const m = block.match(re);
  if (!m) return null;
  const value = stripHtml(m[1]);
  return value || null;
}

function extractPostal(address: string) {
  const m = address.match(/\b(\d{6})\b/);
  return m ? m[1] : null;
}

/** Parse dealer cards from a ZigWheels city dealers HTML page. */
export function parseZigWheelsDealers(html: string, cityName = "Mumbai"): ZigWheelsDealer[] {
  const cardRe =
    /<div class="zw-con pt-5 pb-5 pt-0 deal-crd">([\s\S]*?)<\/div>\s*<div class="clr"><\/div>/gi;
  const dealers: ZigWheelsDealer[] = [];
  let match: RegExpExecArray | null;

  while ((match = cardRe.exec(html)) !== null) {
    const block = match[1];
    const nameMatch = block.match(/<h3[^>]*>([^<]+)<\/h3>/i);
    if (!nameMatch) continue;

    const name = stripHtml(nameMatch[1]);
    const address = extractField(block, "Location");
    if (!name || !address) continue;

    const emailRaw = extractField(block, "Email");
    const email = emailRaw && emailRaw.includes("@") ? emailRaw.toLowerCase() : null;
    const phoneRaw = extractField(block, "Contact");
    const phone = phoneRaw ? phoneRaw.split(",")[0].trim() : null;

    dealers.push({
      name,
      phone,
      email,
      address,
      postalCode: extractPostal(address),
      cityName,
      stateName: "Maharashtra",
    });
  }

  return dealers;
}

export function normalizePhone(phone: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}
