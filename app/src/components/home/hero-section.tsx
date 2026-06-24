"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-32 overflow-hidden px-4 md:px-8">
      {/* Dynamic Background with Gradients */}
      <div className="absolute inset-0 z-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Ambient glowing orbs */}
        <div className="absolute top-0 -left-1/4 w-[120%] sm:w-3/4 h-3/4 bg-orange-500/20 dark:bg-orange-600/15 rounded-full blur-[100px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-1/4 -right-1/4 w-[120%] sm:w-2/3 h-2/3 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-[100px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-[2000ms]"></div>
        <div className="absolute -bottom-1/4 left-1/4 w-[120%] sm:w-3/4 h-3/4 bg-rose-500/15 dark:bg-rose-800/15 rounded-full blur-[100px] sm:blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob delay-[4000ms]"></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
        {/* Modern Badge */}
        <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">New 2026 Exam Patterns Available</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] leading-[1.1] font-black text-slate-900 dark:text-white tracking-tight animate-fade-in-up delay-100 opacity-0">
          Cracking <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">BTech LEET</span> <br className="hidden sm:block" /> Made Simple.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed animate-fade-in-up delay-200 opacity-0">
          Your definitive, academically rigorous platform for mastering the Lateral Entry Entrance Test. Access curated papers, authoritative college directories, and precision mock tests.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300 opacity-0 w-full sm:w-auto">
          <Link
            href="/exams"
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
            <span className="relative z-10 text-base">Start Preparation</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/colleges"
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            View Colleges
          </Link>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-800/50 animate-fade-in-up delay-[400ms] opacity-0">
          <div className="flex -space-x-4">
            <Image src="https://i.pravatar.cc/100?img=1" alt="Student" width={48} height={48} className="rounded-full border-2 border-white dark:border-slate-950 object-cover shadow-sm" />
            <Image src="https://i.pravatar.cc/100?img=2" alt="Student" width={48} height={48} className="rounded-full border-2 border-white dark:border-slate-950 object-cover shadow-sm" />
            <Image src="https://i.pravatar.cc/100?img=3" alt="Student" width={48} height={48} className="rounded-full border-2 border-white dark:border-slate-950 object-cover shadow-sm" />
            <Image src="https://i.pravatar.cc/100?img=4" alt="Student" width={48} height={48} className="rounded-full border-2 border-white dark:border-slate-950 object-cover shadow-sm" />
          </div>
          <div className="text-left flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-1 text-amber-500 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Trusted by <span className="font-bold text-slate-900 dark:text-white">10,000+</span> diploma engineers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
