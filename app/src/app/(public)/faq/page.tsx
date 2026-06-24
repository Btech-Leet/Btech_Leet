import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FaqList } from "./faq-list";
import { FaqForm } from "./faq-form";
import { prisma } from "@/lib/prisma";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "BTech LEET Frequently Asked Questions (FAQ) 2026",
    description: "Get answers to the top 20 most frequently asked questions about the BTech Lateral Entry (LEET) exam, eligibility, counselling, and colleges.",
  };
  return mergeSeoMetadata("/faq", fallback);
}

// Top 20 predefined FAQs
export const mainFaqs = [
  { question: "What is the BTech LEET exam?", answer: "LEET (Lateral Entry Entrance Test) is a state-level exam that allows diploma holders and B.Sc graduates to get direct admission into the second year (3rd semester) of BTech/B.E programs." },
  { question: "Who is eligible for LEET?", answer: "Candidates with a 3-year diploma in engineering/technology or a B.Sc degree (with mathematics in 12th) with a minimum of 45% aggregate (40% for reserved categories) are eligible." },
  { question: "Can I change my branch in BTech after a diploma?", answer: "Yes, in most states you can choose a different branch in BTech than what you studied in your diploma. However, staying in the same branch is often recommended." },
  { question: "Which states conduct their own LEET exams?", answer: "States like Haryana (HSTES), Punjab (PTU), UP (CUET/UPSEE), Delhi (IPU CET), and West Bengal (JELET) conduct their own specific LEET exams." },
  { question: "Is there any negative marking in LEET?", answer: "It depends on the specific state exam. For example, IPU CET and JELET generally have negative marking, while HSTES LEET usually does not. Check the specific brochure." },
  { question: "What is the syllabus for LEET?", answer: "The syllabus typically covers Physics, Chemistry, Mathematics (10+2 or Diploma level), Basics of Electrical/Mechanical/Civil Engineering, and Communication Skills." },
  { question: "Can regular 12th pass students apply for LEET?", answer: "No, LEET is strictly for Diploma holders or B.Sc graduates. 12th pass students must appear for JEE Main or state CETs for 1st-year admission." },
  { question: "How many years does it take to complete BTech via LEET?", answer: "It takes exactly 3 years (6 semesters) to complete BTech through lateral entry, saving one academic year." },
  { question: "Are LEET students eligible for campus placements?", answer: "Yes, absolutely. LEET students sit for the exact same campus placements as regular 4-year BTech students and get the same opportunities." },
  { question: "Is the degree different for LEET students?", answer: "No. The final B.Tech degree awarded by the university is exactly the same for both regular and lateral entry students." },
  { question: "How to apply for Haryana LEET (HSTES)?", answer: "You need to apply online at the official HSTES website (techadmissionshry.gov.in) when the notification is released, usually in June." },
  { question: "What are the top colleges for LEET in Delhi?", answer: "Top colleges include USICT (IPU), MAIT, MSIT, and BPIBS (Delhi Skill and Entrepreneurship University)." },
  { question: "What is the fee structure for LEET colleges?", answer: "Fees vary from ₹40,000/year for government colleges up to ₹2,00,000/year for top private institutions." },
  { question: "Can I prepare for LEET without coaching?", answer: "Yes, self-study using standard diploma books and solving previous year question papers is often sufficient to secure a good rank." },
  { question: "Is there an age limit for LEET?", answer: "Most state LEET exams do not have a strict upper age limit, but some specific universities might have their own criteria." },
  { question: "What documents are required for LEET counselling?", answer: "Diploma mark sheets, 10th certificate, category certificate, domicile certificate, income certificate (for TFW), and LEET scorecard/admit card." },
  { question: "What is TFW (Tuition Fee Waiver) scheme in LEET?", answer: "TFW scheme waives the tuition fee for students whose family income is below ₹8 lakhs per annum. 5% supernumerary seats are reserved for TFW." },
  { question: "Can I get a scholarship after lateral entry?", answer: "Yes, state government and national scholarships (like NSP) are available for lateral entry students just like regular students." },
  { question: "Are BTech books different for LEET students?", answer: "No, LEET students follow the exact same syllabus, subjects, and books as the regular 2nd-year BTech students." },
  { question: "Is it difficult to cope up with 2nd-year BTech subjects?", answer: "Initially, Mathematics might feel challenging, but diploma students usually find core engineering subjects easier than regular students due to their practical background." }
];

export default async function FaqPage() {
  // Fetch active general FAQs
  const generalFaqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  const combinedFaqs = [...mainFaqs, ...generalFaqs];

  // Fetch approved user questions
  const userQuestions = await prisma.userQuestion.findMany({
    where: { displayOnSite: true, status: "ANSWERED" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "FAQ", item: "/faq" }]} />
      
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <HelpCircle size={14} className="text-sky-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Questions</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about LEET, eligibility, counselling, and colleges, answered by our experts.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        {combinedFaqs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <HelpCircle size={20} className="text-blue-500" />
              </span>
              Top LEET Exam FAQs
            </h2>
            <FaqList faqs={combinedFaqs} />
          </div>
        )}

        {userQuestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <MessageCircleQuestion size={20} className="text-indigo-500" />
              </span>
              Community Questions
            </h2>
            <FaqList faqs={userQuestions.map(q => ({ question: q.question, answer: q.answer! }))} />
          </div>
        )}

        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] -z-10" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] -z-10" />
          
          <div className="mb-8 relative z-10 text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-3">Still have questions?</h2>
            <p className="text-slate-400">Can't find what you're looking for? Submit your question below and our experts will answer it directly.</p>
          </div>
          
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <FaqForm />
          </div>
        </div>
      </div>
    </div>
  );
}
