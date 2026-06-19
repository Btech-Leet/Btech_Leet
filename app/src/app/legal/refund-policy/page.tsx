import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | BTech LEET",
  description: "Read our refund and cancellation policy for premium subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-gray-950 text-gray-300 selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-red-600/10 text-red-500 rounded-xl border border-red-500/20">
                <RefreshCcw size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Refund Policy</h1>
            </div>
            <p className="text-sm text-gray-500 mb-12">Effective Date: October 15, 2026</p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-8 text-base md:text-lg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">1. Subscription Cancellations</h2>
              <p>
                You may cancel your premium subscription at any time via your Billing Dashboard. 
                However, please note that we do not offer prorated refunds for cancelled subscriptions. You will continue to have premium access until the end of your current billing cycle.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">2. Refund Eligibility</h2>
              <p>Refunds are only granted under the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Double or duplicate charges for the same subscription period.</li>
                <li>Technical issues preventing you from accessing premium features for more than 48 hours consecutively, which our support team could not resolve.</li>
                <li>A refund request made within 24 hours of initial purchase, provided you have not attempted any premium mock tests.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white border-b border-gray-800 pb-2">3. How to Request a Refund</h2>
              <p>
                To request a refund, please navigate to your Dashboard &gt; Billing &gt; Request Refund, or email us at support@btechleet.com with your transaction ID. 
                Approved refunds are processed back to the original payment method within 5-7 business days via Razorpay.
              </p>
            </section>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
