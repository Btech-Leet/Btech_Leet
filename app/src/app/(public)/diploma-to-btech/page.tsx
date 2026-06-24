import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "Diploma to BTech: Admission Guide & Process 2026",
    description: "Can diploma students get admission to BTech 2nd year? Yes! Learn about the lateral entry process, exams, eligibility, and top colleges.",
  };
  return mergeSeoMetadata("/diploma-to-btech", fallback);
}

export default function DiplomaToBtechPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "Diploma to BTech", item: "/diploma-to-btech" }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white">Diploma to BTech Admission Guide</h1>
        <p className="mt-4 text-lg text-gray-500">How to transition from Polytechnic to Engineering Degree</p>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none">
        <h2>Can Diploma Students Get Admission to BTech 2nd Year?</h2>
        <p>Yes, absolutely. This process is officially known as <strong>Lateral Entry</strong>. Students who have completed a 3-year polytechnic diploma are eligible to skip the first year of engineering and join directly in the 2nd year (3rd semester) of a B.Tech or B.E. program.</p>

        <h2>Steps for Diploma to Degree Admission</h2>
        <ol>
          <li><strong>Complete your Diploma:</strong> Ensure you have at least 45% aggregate marks (40% for reserved categories).</li>
          <li><strong>Appear for LEET Exam:</strong> Apply and appear for the Lateral Entry Entrance Test (LEET) for your target state or university.</li>
          <li><strong>Participate in Counselling:</strong> Based on your LEET rank, participate in the online choice-filling and counselling process.</li>
          <li><strong>Seat Allotment & Admission:</strong> Report to the allotted college for document verification and fee payment.</li>
        </ol>

        <h2>Is BTech after Diploma Worth It?</h2>
        <p>A B.Tech degree opens up significantly more career opportunities, higher salary packages, and eligibility for top-tier companies and government exams like GATE or IES compared to a diploma alone. The strong practical knowledge from the diploma gives you an edge over regular B.Tech students in core engineering subjects.</p>
      </div>

      <div className="mt-16">
        <FAQSection pageUrl="/diploma-to-btech" />
      </div>
    </div>
  );
}
