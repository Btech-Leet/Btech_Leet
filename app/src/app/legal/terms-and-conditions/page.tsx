import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions | BTech LEET",
  description: "Terms and Conditions for using BTech LEET services.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-gray-300 selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-600/10 text-purple-500 rounded-xl border border-purple-500/20">
                <FileText size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Terms & Conditions</h1>
            </div>
            <p className="text-sm text-gray-500 mb-12">Last Updated: October 15, 2025</p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-8 text-base md:text-lg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using BTech LEET (the "Website"), you accept and agree to be bound by the terms and provision of this agreement. 
                In addition, when using this Website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">2. Premium Subscriptions</h2>
              <p>
                Certain features of the Website are available only through premium subscriptions. By purchasing a subscription, you agree to our pricing, payment, and billing policies. 
                All fees are non-refundable unless explicitly stated in our Refund Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">3. User Conduct</h2>
              <p>You agree to use the Website only for lawful purposes. You are prohibited from any use of the Website that would constitute a violation of any applicable law, regulation, rule or ordinance of any nationality, state, or locality or of any international law or treaty.</p>
            </section>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
