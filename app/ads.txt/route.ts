import { getAdSensePublisherId } from "@/lib/ads/adsense";

export const dynamic = "force-static";

export async function GET() {
  const publisherId = getAdSensePublisherId();
  if (!publisherId) {
    return new Response("# AdSense publisher ID not configured\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const body = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
