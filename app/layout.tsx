import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.io"),
  title: {
    default: "DealerVoice - Trusted Dealership Reviews Worldwide",
    template: "%s | DealerVoice",
  },
  description:
    "Find honest, verified reviews for car dealerships worldwide. Compare ratings, read customer experiences, and choose the best dealer with confidence.",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
        <CookieBanner />
        <SupportChat />
      </body>
    </html>
  );
}
