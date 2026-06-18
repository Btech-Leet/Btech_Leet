import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – BTech LEET",
  description: "Read the Privacy Policy for using the BTech LEET platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: June 15, 2026</p>

        <div className="prose prose-blue dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
            <p>
              We collect personal information that you provide to us when registering an account, such as your name and email address. We may also collect details about your use of the Platform, including quiz results and mock test history.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
            <p>
              We use your information to provide, personalize, and improve our services, communicate with you, and ensure a secure experience. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to remember your preferences and keep you logged in. You can configure your browser to reject cookies, but some features of the Platform may not function correctly as a result.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to protect your personal data from unauthorized access, loss, or alteration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Third-Party Links</h2>
            <p>
              Our Platform may contain links to external sites that are not operated by us. We are not responsible for the privacy practices of those external sites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information stored with us. You can manage these settings directly through your profile page or by contacting our support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
