import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "LEET Counselling Guide 2026 – Process & Choice Filling",
    description: "Step-by-step LEET counselling guide for 2026. Learn about registration, document verification, choice filling, and seat allotment for state LEET exams.",
  };
  return mergeSeoMetadata("/leet-counselling-guide", fallback);
}

export default function LeetCounsellingGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "LEET Counselling Guide", item: "/leet-counselling-guide" }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white">LEET Counselling Guide 2026</h1>
        <p className="mt-4 text-lg text-gray-500">Master the Choice Filling and Seat Allotment Process</p>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none">
        <h2>Understanding the LEET Counselling Process</h2>
        <p>Counselling is the final and most crucial step in securing a seat in a good engineering college through LEET. The process is generally conducted online and consists of several stages.</p>

        <h3>1. Registration and Fee Payment</h3>
        <p>After the LEET results are declared, candidates must register on the official counselling portal (e.g., HSTES for Haryana, PTU for Punjab) and pay the non-refundable counselling participation fee.</p>

        <h3>2. Document Verification</h3>
        <p>Upload your essential documents, including your diploma mark sheets, category certificate (if applicable), domicile certificate, and LEET scorecard. Some states require physical verification at designated centers.</p>

        <h3>3. Choice Filling and Locking</h3>
        <p>This is where you select your preferred colleges and branches. <strong>Pro Tip:</strong> Always list colleges in the order of your true preference, regardless of your rank. The system will automatically allocate the best possible college based on your rank and choices.</p>

        <h3>4. Seat Allotment Result</h3>
        <p>The counselling authority publishes the seat allotment result. If you are allotted a seat, you usually have the option to <strong>Freeze</strong> (accept the seat) or <strong>Float</strong> (participate in the next round for an upgrade).</p>

        <h3>5. Reporting to College</h3>
        <p>Once you accept a seat, you must pay the token admission fee online and physically report to the allotted college with original documents to confirm your admission.</p>
      </div>

      <div className="mt-16">
        <FAQSection pageUrl="/leet-counselling-guide" />
      </div>
    </div>
  );
}
