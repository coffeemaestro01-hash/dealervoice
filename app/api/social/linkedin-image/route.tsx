import { ImageResponse } from "next/og";

export const runtime = "edge";

const THEMES: Record<string, { title: string; subtitle: string; accent: string }> = {
  trust: {
    title: "Trust before you buy",
    subtitle: "Verified dealer reviews · Chicago & nationwide",
    accent: "#C9961E",
  },
  pro: {
    title: "DealerVoice Pro",
    subtitle: "Reputation tools for modern rooftops",
    accent: "#C9961E",
  },
  chicago: {
    title: "Built in Chicago",
    subtitle: "Illinois dealers · buyer reviews · transparent scores",
    accent: "#C9961E",
  },
  reviews: {
    title: "Real buyer reviews",
    subtitle: "2 minutes. No paywall. No anonymous hit jobs.",
    accent: "#C9961E",
  },
  growth: {
    title: "DealerVoice is growing",
    subtitle: "Marketplace for dealership trust",
    accent: "#C9961E",
  },
  badge: {
    title: "Featured dealer badge",
    subtitle: "Pro+ · Website backlink · More reviews",
    accent: "#C9961E",
  },
};

export async function GET(req: Request) {
  const theme = new URL(req.url).searchParams.get("theme") || "trust";
  const t = THEMES[theme] ?? THEMES.trust;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #FAF8F4 0%, #F5EDE0 50%, #EDE4D3 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a1510",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            DV
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#2a2118" }}>DealerVoice</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: "#2a2118", lineHeight: 1.1 }}>{t.title}</div>
          <div style={{ fontSize: 28, color: "#5c5348", maxWidth: 900 }}>{t.subtitle}</div>
        </div>
        <div style={{ fontSize: 22, color: t.accent, fontWeight: 600 }}>dealervoice.io</div>
      </div>
    ),
    { width: 1200, height: 627 }
  );
}
