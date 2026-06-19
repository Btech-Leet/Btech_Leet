import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer | BTech LEET",
  description: "Official disclaimer regarding the content and predictions on BTech LEET.",
};

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-gray-300 selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-600/10 text-amber-500 rounded-xl border border-amber-500/20">
                <AlertTriangle size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Disclaimer</h1>
            </div>
            <p className="text-sm text-gray-500 mb-12">Last Updated: October 15, 2026</p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-8 text-base md:text-lg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">1. Educational Purposes Only</h2>
              <p>
                The information provided by BTech LEET on https://btechleet.com is for general informational and educational purposes only. 
                All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, or completeness of any information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">2. Rank & Admission Predictors</h2>
              <p>
                The Rank Predictor, College Predictor, and Admission Chance Calculator tools available on our website use historical data and AI-driven algorithms. 
                These are strictly <strong className="text-white">estimates</strong> and do not guarantee admission into any college or university. Official cutoffs are determined by the respective state counselling boards.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">3. External Links</h2>
              <p>
                The Site may contain links to other websites or content belonging to or originating from third parties. 
                Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.
              </p>
            </section>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
