import Link from "next/link";
import { BookOpen, FileText, BellRing, Users } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-6 h-6 text-blue-500" />,
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/20 dark:border-blue-500/30",
    title: "Exam Directory",
    desc: "Detailed breakdown of state-wise and university-specific LEET exams, syllabus, and eligibility criteria.",
    href: "/exams",
    colSpan: "md:col-span-2",
  },
  {
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    border: "border-orange-500/20 dark:border-orange-500/30",
    title: "Previous Papers",
    desc: "Curated archive of previous year question papers.",
    href: "/papers",
    colSpan: "md:col-span-1",
  },
  {
    icon: <BellRing className="w-6 h-6 text-teal-500" />,
    bg: "bg-teal-500/10 dark:bg-teal-500/20",
    border: "border-teal-500/20 dark:border-teal-500/30",
    title: "Live Alerts",
    desc: "Real-time alerts for application deadlines and results.",
    href: "/notifications",
    colSpan: "md:col-span-1",
  },
  {
    icon: <Users className="w-6 h-6 text-purple-500" />,
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    border: "border-purple-500/20 dark:border-purple-500/30",
    title: "Counselling Guidance",
    desc: "Expert guidance through the complex seat allocation and admission process to secure your dream college.",
    href: "/counselling",
    colSpan: "md:col-span-2",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/50 dark:bg-slate-900/30 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Academic Toolkit</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need to systematically prepare, execute, and succeed in your BTech lateral entry exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              href={feature.href}
              key={feature.title}
              className={`group relative overflow-hidden rounded-3xl p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-xl ${feature.colSpan}`}
            >
              {/* Hover gradient backdrop */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${feature.bg} blur-xl`} />
              
              <div className="flex flex-col h-full justify-between z-10 relative">
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${feature.bg} ${feature.border} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:translate-x-1 transition-transform delay-75">
                    {feature.desc}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                  Explore Module
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
