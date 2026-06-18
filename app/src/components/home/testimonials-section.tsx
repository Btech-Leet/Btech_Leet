"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  const [paused, setPaused] = useState(false);

  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      role: "DTU Lateral Entry 2023",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVCwFMkYTqyTHGZtLTCsOqkY5YQJlkthPCudDJaZhQVCqNBKmpx7fXIkzMxnWW-2jAzx77Sv4y1HTz9Ocayx8hlUGKuxM8ac38AXhj0T6S5RixP8qeRWldbifEkJI1wZ5fYLD2Gwk1YC8v6BSMdi4MaqAyY9X-zCk9163PXw0G2Lc65PWRicMHHyNvA1VSSPAvEh1E22SnzgPsI1k5pGRWU4C2fDS8IV2ktnMk4yZdIyoOJOs9rgAwkoIHTgSsc8ThG5TyR5UFrNzV",
      quote:
        "The curated papers and mock tests were exactly what I needed. I secured admission to DTU thanks to the structured approach here.",
    },
    {
      id: 2,
      name: "Priya Verma",
      role: "NSUT Lateral Entry 2023",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCvvF60C8mapzF2o0LYEaDtscC9hoHoawS2RgWOPQrLlqrA2Os9dpYaPh60OvsKuCgcJzTAGkP4X9fBNbuDXoFwAP5y3WIPDsvk6LdwAclVIM1c6MHJCcoclkeV0iQ2kay6xUVPKsKIGm_LW_LFCchQIs6zcRqQb9lrOgKXfmg_WA8D7S_L7x8XrBqdCuR6_ePqF7WxCBZ4ibY1u8m0eVQP-hzOYo-KOaN_CpxqKGbq8iUQVqRl7CmAIQRhtr3pdQN_sY1BNpDQC4Bh",
      quote:
        "The counselling guidance was a lifesaver. I was confused about the seat allocation process, but the experts here made it seamless.",
    },
    {
      id: 3,
      name: "Amit Singh",
      role: "YMCA Lateral Entry 2023",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAdEj_keIjWAdoOIcgoseYxUTJEx_GWMPGSejH8l8M0Uizx8uuzKzFfMpFLJQ4rBrxtvPZrrvVg6nOiSqPS197qJGz8kFhzPKJgpRuzHPrX-VaVqiiAeizgMFiij7JYH8QCa2zcu7aSXSIc3ZluqCyLn3kFyTyNRFXhvdUV4Xb_dmYUyoAyszzThT-S0nsT1h1dAjn9JzpE1qpyxiBHQyueQzouTVr2YfqxabAlyasdc3HxWP9A4YRSGB8uE4K6EZxxvbgP8hQb_lZW",
      quote:
        "Best resource for Haryana LEET. The syllabus breakdown and previous year papers are very well organized. Highly recommended!",
    },
  ]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        const first = next.shift();
        next.push(first!);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [paused]);

  const positions = [
    {
      scale: 1,
      rotate: 0,
      y: 0,
      opacity: 1,
      zIndex: 30,
    },
    {
      scale: 0.94,
      rotate: -5,
      y: -10,
      opacity: 0.75,
      zIndex: 20,
    },
    {
      scale: 0.88,
      rotate: 5,
      y: -20,
      opacity: 0.55,
      zIndex: 10,
    },
  ];

  return (
    <section
      className="py-24 bg-slate-100/50 dark:bg-slate-900/50 px-6 md:px-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 transition-colors duration-300"
          >
            Success Stories
          </h2>

          <p className="text-lg text-slate-655 dark:text-slate-400 transition-colors duration-300">
            Hear from diploma engineers who successfully transitioned to top
            BTech programs using our platform.
          </p>
        </div>

        <div
          className="relative flex items-center justify-center h-[340px] sm:h-[380px] md:h-[420px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              animate={positions[index]}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="absolute w-[92%] sm:w-[85%] md:w-[700px]"
            >
              <div
                className="
                  rounded-3xl
                  border border-slate-200 dark:border-white/10
                  bg-white/80 dark:bg-slate-800/60
                  backdrop-blur-xl
                  shadow-[0_20px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                  p-5 sm:p-8 md:p-10
                  transition-colors duration-300
                "
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-200 dark:border-slate-700 overflow-hidden mb-5 transition-colors duration-300">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p
                    className="
                      text-sm
                      sm:text-lg
                      md:text-xl
                      italic
                      text-slate-800 dark:text-white/90
                      leading-relaxed
                      max-w-2xl
                    "
                  >
                    "{card.quote}"
                  </p>

                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg transition-colors duration-300">
                      {card.name}
                    </h3>

                    <p className="text-slate-655 dark:text-slate-400 text-xs sm:text-sm transition-colors duration-300">
                      {card.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}