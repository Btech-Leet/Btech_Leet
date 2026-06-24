import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function CounsellingSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
      {/* Ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left - Content */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full w-max border border-orange-500/20 dark:border-orange-500/30">
            <Sparkles size={14} />
            <span className="text-[11px] uppercase tracking-wider font-black text-orange-700 dark:text-orange-400">Expert Guidance</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Navigate Admissions with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Confidence</span>
          </h2>

          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            The seat allocation process can be overwhelming. Our seasoned counsellors provide personalized strategies to maximize your chances of securing admission in top-tier institutions.
          </p>

          <ul className="flex flex-col gap-4 mt-2">
            {[
              "Personalized college preference lists",
              "Document verification assistance",
              "Spot round and sliding phase strategies",
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/30 shrink-0">
                  <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/counselling"
            className="group relative mt-4 inline-flex items-center justify-center gap-2 w-max px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
            <span className="relative z-10">Get Expert Guidance</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right - Image */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent rounded-[32px] blur-2xl -z-10" />
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl aspect-video">
            <Image
              alt="Students getting counselling"
              className="object-cover"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Floating stats card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-orange-500">98%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Success Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-500">500+</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Students Placed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-500">50+</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Partner Colleges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
