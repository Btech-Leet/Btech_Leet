import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – BTech LEET",
  description: "Read the Terms of Service for using the BTech LEET platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 15, 2026</p>

        <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BTech LEET (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Description of Service</h2>
            <p>
              BTech LEET provides users with access to exam preparation materials, previous year question papers, mock tests, and educational resources. We reserve the right to modify or discontinue any part of the service at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. User Accounts</h2>
            <p>
              To access certain features of the Platform, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Intellectual Property</h2>
            <p>
              All content and materials available on the Platform, including but not limited to text, graphics, logos, and software, are the property of BTech LEET or its content suppliers and are protected by applicable intellectual property laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Limitation of Liability</h2>
            <p>
              BTech LEET is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or availability of the materials and shall not be liable for any damages arising from your use of the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the Platform after any changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
