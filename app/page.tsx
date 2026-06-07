import type { Metadata } from "next";
import prisma from "@/lib/db";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { VoiceHeroSection } from "@/components/voice/VoiceHeroSection";
import { ProblemSolutionSection } from "@/components/voice/ProblemSolutionSection";
import { RoiCalculator } from "@/components/voice/RoiCalculator";
import { CallRecordingsSection } from "@/components/voice/CallRecordingsSection";
import { RoiStoriesSection } from "@/components/voice/RoiStoriesSection";
import { IntegrationsSection } from "@/components/voice/IntegrationsSection";
import { TrustSecuritySection } from "@/components/voice/TrustSecuritySection";
import { ReviewsDirectoryTeaser } from "@/components/voice/ReviewsDirectoryTeaser";
import { DemoCtaSection } from "@/components/voice/DemoCtaSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DealerVoice - Turn Missed Calls Into Booked Appointments",
  description:
    "AI voice automation for car dealerships. Answer service and sales calls 24/7, book appointments automatically, and recover lost revenue.",
  openGraph: {
    title: "DealerVoice - Revenue Recovery for Dealerships",
    description: "Turn missed calls into booked service appointments with AI voice automation.",
  },
};

async function getStats() {
  try {
    const [dealers, reviews] = await Promise.all([
      prisma.dealership.count({ where: { deletedAt: null } }),
      prisma.review.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    ]);
    return { dealers, reviews };
  } catch {
    return { dealers: 0, reviews: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col min-h-screen bg-night">
      <Navbar />
      <main className="flex-1">
        <VoiceHeroSection />
        <ProblemSolutionSection />
        <RoiCalculator />
        <CallRecordingsSection />
        <RoiStoriesSection />
        <IntegrationsSection />
        <TrustSecuritySection />
        <ReviewsDirectoryTeaser dealers={stats.dealers} reviews={stats.reviews} />
        <DemoCtaSection />
      </main>
      <Footer />
    </div>
  );
}
