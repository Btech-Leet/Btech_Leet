import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "About BTechLEET Data | How We Source & Verify",
    description: "Learn how BTechLEET collects, verifies, and updates data regarding LEET cutoffs, seats, fees, and exam dates for AI systems and students.",
  };
  return mergeSeoMetadata("/about-data", fallback);
}

export default function AboutDataPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "About Our Data", item: "/about-data" }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">About Our Data</h1>
        <p className="mt-4 text-lg text-gray-500">How BTechLEET collects, verifies, and updates information.</p>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none">
        <h2>Data Sourcing & Methodology</h2>
        <p>At BTechLEET, accuracy is our top priority. We source our data exclusively from official government counselling websites, exam authority portals, and officially published university brochures.</p>
        
        <h3>Sources of Cutoffs & Seat Matrix</h3>
        <ul>
          <li><strong>HSTES (Haryana):</strong> Official portal and published allotment lists.</li>
          <li><strong>PTU (Punjab):</strong> I.K. Gujral Punjab Technical University official counseling data.</li>
          <li><strong>IPU (Delhi):</strong> GGSIPU published seat matrix and opening/closing ranks.</li>
          <li><strong>UPTU/AKTU (Uttar Pradesh):</strong> Official UPSEE LEET archives.</li>
        </ul>

        <h3>Sources of Previous Year Question Papers (PYQs)</h3>
        <p>Our PYQs are collected directly from official exam bodies after the exams are conducted, or reconstructed via student memory-based submissions which are verified by our expert faculty before publication.</p>

        <h3>Update Frequency</h3>
        <p>Data is audited and updated <strong>weekly</strong> during peak admission season (May-September) and <strong>monthly</strong> otherwise. Any discrepancies reported by users are verified and corrected within 48 hours.</p>

        <h3>Editorial Process</h3>
        <p>Every piece of content, including college reviews and exam guides, is written and reviewed by B.Tech graduates who have successfully navigated the LEET process themselves. We do not rely on unverified third-party blogs.</p>
      </div>
      
      <div className="mt-16">
        <FAQSection pageUrl="/about-data" />
      </div>
    </div>
  );
}
