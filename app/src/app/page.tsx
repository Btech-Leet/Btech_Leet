import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ExamsSection } from "@/components/home/exams-section";
import { NotificationsSection } from "@/components/home/notifications-section";
import { CounsellingSection } from "@/components/home/counselling-section";
import { BooksSection } from "@/components/home/books-section";
import { BlogSection } from "@/components/home/blog-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQSection } from "@/components/ui/faq-section";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-orange-500/30 selection:text-white transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ExamsSection />
        <CounsellingSection />
        <BooksSection />
        <BlogSection />
        <NotificationsSection />
        <TestimonialsSection />
        <FAQSection pageUrl="/" />
        <SubscribeSection />
      </main>
      <Footer />
    </div>
  );
}
