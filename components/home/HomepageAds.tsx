import { headers } from "next/headers";
import { AutomotiveAdBanner } from "@/components/ads/AutomotiveAdBanner";
import { resolveAdCountry } from "@/lib/geo/market";

export async function HomepageAds() {
  const h = await headers();
  const countryCode = resolveAdCountry(h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry"));

  return (
    <section className="py-10 bg-night border-t border-white/5" aria-label="Sponsored automotive offers">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <AutomotiveAdBanner type="Tier2_OEM_Offer" slot="homepage_financing" countryCode={countryCode} />
        <AutomotiveAdBanner type="Sponsored_Local_Dealer" slot="homepage_dealer" countryCode={countryCode} />
        <AutomotiveAdBanner type="Auto_Ecosystem_Partner" slot="homepage_insurance" countryCode={countryCode} />
      </div>
    </section>
  );
}
