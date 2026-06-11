import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ExamsSection } from "@/components/home/exams-section";
import { NotificationsSection } from "@/components/home/notifications-section";
import { SubscribeSection } from "@/components/home/subscribe-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BTech LEET – Lateral Entry Exam Portal for Diploma Students in India",
  description:
    "India's most comprehensive BTech Lateral Entry Exam (LEET) portal. Access state-wise exam details, previous year question papers, mock tests, counselling schedules, college listings, and real-time notifications.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ExamsSection />
        <NotificationsSection />
        <SubscribeSection />
      </main>
      <Footer />
    </>
  );
}
