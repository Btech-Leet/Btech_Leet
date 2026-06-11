import Link from "next/link";
import { CheckCircle2, PhoneCall, Users, GraduationCap, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CounsellingPage() {
  return (
    <main className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Admissions Open 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white font-display leading-tight mb-6">
            Expert <span className="text-blue-600">Counselling</span> for LEET Admissions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Get personalized guidance to secure your admission in top engineering colleges through lateral entry. We help you navigate the complex counselling process of HSTES, UPTU, IPU, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#book"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <PhoneCall size={18} />
              Book Free Consultation
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Students Placed", value: "500+" },
            { label: "Top Colleges", value: "50+" },
            { label: "Success Rate", value: "98%" },
            { label: "States Covered", value: "8+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Choice Filling Strategy</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We analyze your rank and preferences to create a perfectly optimized choice filling list that maximizes your chances of getting a top college.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Document Verification</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Never get rejected due to wrong documents. Our experts verify all your certificates, migration, and domicile documents before submission.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">24/7 Priority Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Counselling rounds happen fast. Get instant WhatsApp and call support during crucial choice locking and seat allotment windows.
            </p>
          </div>
        </div>

        {/* CTA / Form Section */}
        <div id="book" className="bg-gray-900 rounded-3xl overflow-hidden relative border border-gray-800">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-20" />
          
          <div className="relative z-10 grid md:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to secure your seat?
              </h2>
              <p className="text-gray-400 mb-8">
                Leave your details below and our expert counsellors will get back to you within 24 hours to discuss your rank and options.
              </p>
              
              <ul className="space-y-4">
                {['Personalized Rank Analysis', 'State-wise Admission Guidance', 'Direct Admission Support'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="text-blue-500" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-10 md:p-16 bg-gray-950/50 border-l border-gray-800">
              <form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LEET Exam & Rank</label>
                  <input type="text" placeholder="e.g. Haryana LEET - Rank 452" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <button type="button" className="w-full py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-4">
                  Request Callback <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
