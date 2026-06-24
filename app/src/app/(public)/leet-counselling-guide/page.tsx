import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { FAQSection } from "@/components/ui/faq-section";
import { GraduationCap, Landmark, FileCheck, CheckSquare, Send } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "LEET Counselling Guide 2026 – Process & Choice Filling",
    description: "Step-by-step LEET counselling guide for 2026. Learn about registration, document verification, choice filling, and seat allotment for state LEET exams.",
  };
  return mergeSeoMetadata("/leet-counselling-guide", fallback);
}

export default function LeetCounsellingGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "LEET Counselling Guide", item: "/leet-counselling-guide" }]} />
      
      {/* Premium Header */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] -z-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <GraduationCap size={14} className="text-purple-400" />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Counselling</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Counselling <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Guide 2026</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Master the Choice Filling and Seat Allotment Process to secure admission in top B.Tech colleges.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12">
        
        {/* Guide Steps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          
          <div className="text-center mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Understanding the LEET Counselling Process</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Counselling is the final and most crucial step in securing a seat in a good engineering college through LEET. The process is generally conducted online and consists of several stages.</p>
          </div>

          <div className="space-y-10">
            {/* Step 1 */}
            <div className="relative pl-10 md:pl-0">
              <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl items-center justify-center font-black text-xl z-10 border border-purple-100 dark:border-purple-500/20">1</div>
              <div className="md:ml-20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="md:hidden w-8 h-8 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center font-bold text-sm">1</span>
                  Registration and Fee Payment
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  After the LEET results are declared, candidates must register on the official counselling portal (e.g., HSTES for Haryana, PTU for Punjab) and pay the non-refundable counselling participation fee. Ensure your details match your LEET application.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-10 md:pl-0">
              <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl items-center justify-center font-black text-xl z-10 border border-sky-100 dark:border-sky-500/20">2</div>
              <div className="md:ml-20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="md:hidden w-8 h-8 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-lg flex items-center justify-center font-bold text-sm">2</span>
                  Document Verification
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  Upload your essential documents, including your diploma mark sheets, category certificate (if applicable), domicile certificate, and LEET scorecard. Some states require physical verification at designated centers while others process it online.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-10 md:pl-0">
              <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl items-center justify-center font-black text-xl z-10 border border-emerald-100 dark:border-emerald-500/20">3</div>
              <div className="md:ml-20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="md:hidden w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold text-sm">3</span>
                  Choice Filling and Locking
                </h3>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    This is where you select your preferred colleges and branches. 
                  </p>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800/50 flex gap-3">
                    <CheckSquare className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-slate-800 dark:text-slate-200"><strong className="text-emerald-600 dark:text-emerald-400">Pro Tip:</strong> Always list colleges in the order of your true preference, regardless of your rank. The system will automatically allocate the best possible college based on your rank and choices.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pl-10 md:pl-0">
              <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl items-center justify-center font-black text-xl z-10 border border-amber-100 dark:border-amber-500/20">4</div>
              <div className="md:ml-20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="md:hidden w-8 h-8 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center font-bold text-sm">4</span>
                  Seat Allotment Result
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  The counselling authority publishes the seat allotment result based on rank and preferences. If you are allotted a seat, you usually have the option to <strong className="text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Freeze</strong> (accept the seat) or <strong className="text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Float</strong> (participate in the next round for an upgrade).
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative pl-10 md:pl-0">
              <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl items-center justify-center font-black text-xl z-10 border border-rose-100 dark:border-rose-500/20">5</div>
              <div className="md:ml-20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-3">
                  <span className="md:hidden w-8 h-8 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center font-bold text-sm">5</span>
                  Reporting to College
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  Once you accept a seat, you must pay the token admission fee online and physically report to the allotted college with original documents and admission letter to confirm your admission. Failure to report leads to cancellation of the allotted seat.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FAQs */}
        <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px] -z-10" />
          
          <div className="mb-8 relative z-10 text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-400">Common questions about counselling, cutoffs, and admissions.</p>
          </div>
          
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <FAQSection pageUrl="/leet-counselling-guide" />
          </div>
        </div>

      </div>
    </div>
  );
}
