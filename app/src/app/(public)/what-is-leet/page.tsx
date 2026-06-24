import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";
import { BookOpen, GraduationCap, Building2, TrendingUp } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "What is LEET? Complete Lateral Entry Exam Guide 2026",
    description: "Everything you need to know about BTech Lateral Entry Entrance Test (LEET). Eligibility, syllabus, process, and state-wise exam details.",
  };
  return mergeSeoMetadata("/what-is-leet", fallback);
}

export default function WhatIsLeetPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "What is LEET", item: "/what-is-leet" }]} />
      
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <BookOpen size={14} className="text-rose-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Complete Guide</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            What is <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">LEET Exam?</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The Ultimate Guide to BTech Lateral Entry Entrance Test (LEET) for Diploma and B.Sc Graduates in India.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        
        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-h2:text-2xl prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-strong:text-slate-900 dark:prose-strong:text-white">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="text-rose-500" size={24} />
              </div>
              <h2 className="!mb-0 !border-none !pb-0">Introduction to Lateral Entry (LEET)</h2>
            </div>
            <p><strong>LEET</strong> stands for Lateral Entry Entrance Test. It is a state-level or university-level entrance examination conducted across India for admission directly into the second year (third semester) of B.Tech/B.E. degree programs. This provides a fast-track route for eligible candidates to earn their engineering degree.</p>

            <div className="flex items-center gap-4 mb-6 mt-12">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="text-amber-500" size={24} />
              </div>
              <h2 className="!mb-0 !border-none !pb-0">Who is Eligible for LEET?</h2>
            </div>
            <p>To be eligible for LEET 2026, candidates must typically fulfill the following criteria:</p>
            <ul className="space-y-2">
              <li>Passed a <strong>3-year Diploma</strong> in Engineering/Technology from an AICTE-approved institution with at least 45% marks (40% for reserved categories).</li>
              <li>OR passed <strong>B.Sc. Degree</strong> from a recognized university with at least 45% marks and passed 10+2 with Mathematics.</li>
              <li>Some states may have specific domicile requirements or age limits depending on the university.</li>
            </ul>

            <div className="flex items-center gap-4 mb-6 mt-12">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-blue-500" size={24} />
              </div>
              <h2 className="!mb-0 !border-none !pb-0">Popular State LEET Exams</h2>
            </div>
            <ul className="space-y-4">
              <li className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl list-none ml-0 border border-slate-100 dark:border-slate-800">
                <strong className="text-lg block mb-1">Haryana LEET (HSTES)</strong>
                For admission to top government and private colleges in Haryana like YMCA Faridabad, DCRUST Murthal.
              </li>
              <li className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl list-none ml-0 border border-slate-100 dark:border-slate-800">
                <strong className="text-lg block mb-1">Punjab LEET (PTU)</strong>
                For admission to colleges under IKGPTU and other universities in Punjab.
              </li>
              <li className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl list-none ml-0 border border-slate-100 dark:border-slate-800">
                <strong className="text-lg block mb-1">IPU CET Lateral Entry</strong>
                For admission to GGSIPU and its affiliated top-tier colleges in New Delhi.
              </li>
              <li className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl list-none ml-0 border border-slate-100 dark:border-slate-800">
                <strong className="text-lg block mb-1">UPTU/AKTU Lateral Entry</strong>
                Conducted via CUET for hundreds of engineering colleges across Uttar Pradesh.
              </li>
            </ul>

            <div className="flex items-center gap-4 mb-6 mt-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-emerald-500" size={24} />
              </div>
              <h2 className="!mb-0 !border-none !pb-0">Why Choose Lateral Entry?</h2>
            </div>
            <p>Diploma students have a strong practical foundation. Lateral entry saves one entire academic year, allowing you to graduate with a full engineering degree in 3 years instead of 4. Earning a B.Tech significantly boosts your career scope, job opportunities, and salary potential compared to holding a diploma alone. You are treated exactly the same as regular 4-year B.Tech students during campus placements.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-rose-500/20 rounded-full blur-[50px] -z-10" />
          
          <div className="mb-8 relative z-10 text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400">Common questions about the LEET exam and process.</p>
          </div>
          
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <FAQSection pageUrl="/what-is-leet" />
          </div>
        </div>

      </div>
    </div>
  );
}
