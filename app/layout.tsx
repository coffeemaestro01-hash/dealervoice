import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layouts/Providers";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { getAdSenseClientId } from "@/lib/ads/adsense";
import { SupportChat } from "@/components/support/SupportChat";
import { GoogleAnalyticsScripts } from "@/components/analytics/GoogleAnalyticsScripts";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io"),
  title: {
    default: "DealerVoice — Find Trusted Car Dealership Reviews Worldwide",
    template: "%s | DealerVoice",
  },
  description:
    "Search car dealerships worldwide, read verified buyer reviews, and compare reputation scores before you buy or service your vehicle.",
  keywords: ["car dealership reviews", "auto dealer ratings", "vehicle dealer reviews", "dealership ratings"],
  authors: [{ name: "DealerVoice" }],
  creator: "DealerVoice",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DealerVoice",
    title: "DealerVoice - Trusted Dealership Reviews Worldwide",
    description: "Find honest, verified reviews for car dealerships worldwide.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DealerVoice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealerVoice - Trusted Dealership Reviews Worldwide",
    description: "Find honest, verified reviews for car dealerships worldwide.",
    images: ["/og-image.png"],
    creator: "@dealervoice_io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  manifest: "/manifest.json",
  other: {
    "verify-admitad": "51daf7bf5c",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = getAdSenseClientId();

  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <head>
        <GoogleAnalyticsScripts />
        {adsenseClient ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
        <CookieBanner />
        <SupportChat />
      </body>
    </html>
  );
}
