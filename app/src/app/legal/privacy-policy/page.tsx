import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | BTech LEET",
  description: "Learn how BTech LEET collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 transition-colors duration-300 selection:bg-orange-500/30 selection:text-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-600/10 text-blue-500 rounded-xl border border-blue-500/20">
                <Shield size={28} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-12">Last Updated: October 15, 2026</p>
          </FadeIn>

          <FadeIn delay={0.1} className="space-y-8 text-base md:text-lg leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">1. Introduction</h2>
              <p>
                Welcome to BTech LEET ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
                If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@btechleet.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong className="text-slate-800 dark:text-slate-200">Personal Data:</strong> Name, email address, phone number, college details, and academic targets.</li>
                <li><strong className="text-slate-800 dark:text-slate-200">Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by Razorpay.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">3. How We Use Your Information</h2>
              <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
                <li>To facilitate account creation and logon process.</li>
                <li>To post testimonials with your consent.</li>
                <li>To manage user accounts and provide personalized LEET rank predictions.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">4. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our Website is at your own risk.
              </p>
            </section>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
