"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center pt-32 pb-24 overflow-hidden px-margin-mobile md:px-margin-desktop">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWnV4GIl35WTVJUuNIeDkemK2H73o1Fguj5PRw0nzfYYG0wXGQfk31sq2s-oJj8cS8zvy7JHXgju7Aeat8rRj4bzWs2cAnvGL9IO_uLTyI6o0mY6H16vIA8vsfH_lwQKdSUNqsQ4uzyL76YPoDRehCRoLM8oYKssHkD_85vcePPTVk-mXYcHvJIATgz-0BP-Hays5u2dk6vxZy6YMNe3ZHC2DB4JCnGIB3JvzsEHLKP-MdwFWoGP8gOMYMLkRLESLqxPTd_ywZHy3o"
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-[2px] transition-colors duration-300"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent transition-colors duration-300"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-lg">
        <div className="inline-flex items-center gap-2 bg-slate-100/85 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 shadow-sm mb-4 transition-colors duration-300">
          <span className="bg-orange-500 w-2 h-2 rounded-full animate-pulse"></span>
          <span className="text-label-md font-label-md text-slate-700 dark:text-slate-200">New 2024 Exam Patterns Available</span>
        </div>
        <h1 className="text-[48px] leading-[1.1] md:text-[72px] md:leading-[1.1] font-bold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
          Cracking <span className="text-orange-600 dark:text-orange-500">BTech LEET</span> Made Simple.
        </h1>
        <p className="text-body-lg font-body-lg md:text-[20px] md:leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl transition-colors duration-300">
          Your definitive, academically rigorous platform for mastering the Lateral Entry Entrance Test. Access curated papers, authoritative college directories, and precision mock tests designed for high-achieving diploma engineers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-md pt-sm">
          <Link
            href="/exams"
            className="bg-orange-700 text-white px-8 py-4 rounded-full text-label-md font-label-md shadow-[0_4px_14px_0_rgba(154,52,18,0.39)] hover:shadow-[0_6px_20px_rgba(154,52,18,0.23)] hover:bg-orange-600 transition-all duration-200 flex items-center gap-2"
          >
            Start Preparation
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            href="/colleges"
            className="bg-slate-200 dark:bg-white text-slate-900 hover:bg-slate-300 dark:hover:bg-slate-100 px-8 py-4 rounded-full text-label-md font-label-md transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            View Colleges
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4 mt-8 pt-8">
          <div className="flex -space-x-3">
            <img
              alt="Student avatar"
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-900 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVCwFMkYTqyTHGZtLTCsOqkY5YQJlkthPCudDJaZhQVCqNBKmpx7fXIkzMxnWW-2jAzx77Sv4y1HTz9Ocayx8hlUGKuxM8ac38AXhj0T6S5RixP8qeRWldbifEkJI1wZ5fYLD2Gwk1YC8v6BSMdi4MaqAyY9X-zCk9163PXw0G2Lc65PWRicMHHyNvA1VSSPAvEh1E22SnzgPsI1k5pGRWU4C2fDS8IV2ktnMk4yZdIyoOJOs9rgAwkoIHTgSsc8ThG5TyR5UFrNzV"
            />
            <img
              alt="Student avatar"
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-900 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvvF60C8mapzF2o0LYEaDtscC9hoHoawS2RgWOPQrLlqrA2Os9dpYaPh60OvsKuCgcJzTAGkP4X9fBNbuDXoFwAP5y3WIPDsvk6LdwAclVIM1c6MHJCcoclkeV0iQ2kay6xUVPKsKIGm_LW_LFCchQIs6zcRqQb9lrOgKXfmg_WA8D7S_L7x8XrBqdCuR6_ePqF7WxCBZ4ibY1u8m0eVQP-hzOYo-KOaN_CpxqKGbq8iUQVqRl7CmAIQRhtr3pdQN_sY1BNpDQC4Bh"
            />
            <img
              alt="Student avatar"
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-900 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdEj_keIjWAdoOIcgoseYxUTJEx_GWMPGSejH8l8M0Uizx8uuzKzFfMpFLJQ4rBrxtvPZrrvVg6nOiSqPS197qJGz8kFhzPKJgpRuzHPrX-VaVqiiAeizgMFiij7JYH8QCa2zcu7aSXSIc3ZluqCyLn3kFyTyNRFXhvdUV4Xb_dmYUyoAyszzThT-S0nsT1h1dAjn9JzpE1qpyxiBHQyueQzouTVr2YfqxabAlyasdc3HxWP9A4YRSGB8uE4K6EZxxvbgP8hQb_lZW"
            />
          </div>
          <p className="text-body-md font-body-md text-slate-650 dark:text-slate-300 transition-colors duration-300">
            Trusted by <span className="font-bold text-slate-900 dark:text-white">10,000+</span> diploma engineers.
          </p>
        </div>
      </div>
    </section>
  );
}
