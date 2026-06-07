import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layouts/Providers";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { SupportChat } from "@/components/support/SupportChat";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.com"),
  title: {
    default: "DealerVoice — AI Voice Intelligence for Automotive Dealerships",
    template: "%s | DealerVoice",
  },
  description:
    "The AI voice platform built to rule automotive retail. Turn missed calls into booked appointments — 24/7, integrated with your DMS & CRM.",
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
    creator: "@dealervoice",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
        <CookieBanner />
        <SupportChat />
      </body>
    </html>
  );
}
