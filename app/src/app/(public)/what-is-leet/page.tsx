import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "What is LEET? Complete Lateral Entry Exam Guide 2026",
    description: "Everything you need to know about BTech Lateral Entry Entrance Test (LEET). Eligibility, syllabus, process, and state-wise exam details.",
  };
  return mergeSeoMetadata("/what-is-leet", fallback);
}

export default function WhatIsLeetPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "What is LEET", item: "/what-is-leet" }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white">What is LEET Exam?</h1>
        <p className="mt-4 text-lg text-gray-500">The Ultimate Guide to BTech Lateral Entry Entrance Test</p>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none">
        <h2>Introduction to Lateral Entry (LEET)</h2>
        <p><strong>LEET</strong> stands for Lateral Entry Entrance Test. It is a state-level or university-level entrance examination conducted across India for admission directly into the second year (third semester) of B.Tech/B.E. degree programs.</p>

        <h2>Who is Eligible for LEET?</h2>
        <p>To be eligible for LEET 2026, candidates must fulfill the following criteria:</p>
        <ul>
          <li>Passed a 3-year Diploma in Engineering/Technology from an AICTE-approved institution with at least 45% marks (40% for reserved categories).</li>
          <li>OR passed B.Sc. Degree from a recognized university with at least 45% marks and passed 10+2 with Mathematics.</li>
          <li>Some states may have specific domicile requirements or age limits.</li>
        </ul>

        <h2>Popular State LEET Exams</h2>
        <ul>
          <li><strong>Haryana LEET (HSTES):</strong> For admission to colleges in Haryana like YMCA Faridabad, DCRUST Murthal.</li>
          <li><strong>Punjab LEET (PTU):</strong> For admission to colleges under IKGPTU.</li>
          <li><strong>IPU CET Lateral Entry:</strong> For admission to GGSIPU, New Delhi.</li>
          <li><strong>UPTU/AKTU Lateral Entry:</strong> Conducted via CUET for Uttar Pradesh colleges.</li>
        </ul>

        <h2>Why Choose Lateral Entry?</h2>
        <p>Diploma students have a strong practical foundation. Lateral entry saves one academic year, allowing you to graduate with a degree in 3 years instead of 4. It significantly boosts your career scope and salary potential compared to a diploma alone.</p>
      </div>

      <div className="mt-16">
        <FAQSection pageUrl="/what-is-leet" />
      </div>
    </div>
  );
}
