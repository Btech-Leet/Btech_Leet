import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { CheckSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Editorial Policy | BTech LEET",
  description: "Learn about how we ensure high-quality, accurate, and unbiased content.",
};

export default function EditorialPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-gray-300 selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                <CheckSquare size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Editorial Policy</h1>
            </div>
            <p className="text-sm text-gray-500 mb-12">Effective Date: October 15, 2026</p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-8 text-base md:text-lg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">1. Our Commitment to Accuracy</h2>
              <p>
                At BTech LEET, we strive to provide the most accurate, reliable, and up-to-date information regarding lateral entry exams, college cutoffs, and admission procedures. 
                Our content is thoroughly researched by domain experts who have first-hand experience with the LEET admission process.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">2. Sourcing of Information</h2>
              <p>We source our data primarily from official government notifications, university brochures, and state counselling body websites (e.g., HSTES, IPU CET). We clearly cite official sources where applicable.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">3. Corrections Policy</h2>
              <p>
                If you spot an error in our data or articles, please contact us immediately at corrections@btechleet.com. 
                We will investigate the claim and update the article with a correction notice if necessary within 48 hours.
              </p>
            </section>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
