"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  const [paused, setPaused] = useState(false);

  const [cards, setCards] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      role: "DTU Lateral Entry 2023",
      image: "https://i.pravatar.cc/150?img=11",
      quote:
        "The curated papers and mock tests were exactly what I needed. I secured admission to DTU thanks to the structured approach here.",
    },
    {
      id: 2,
      name: "Priya Verma",
      role: "NSUT Lateral Entry 2023",
      image: "https://i.pravatar.cc/150?img=5",
      quote:
        "The counselling guidance was a lifesaver. I was confused about the seat allocation process, but the experts here made it seamless.",
    },
    {
      id: 3,
      name: "Amit Singh",
      role: "YMCA Lateral Entry 2023",
      image: "https://i.pravatar.cc/150?img=12",
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
      rotate: -4,
      y: -12,
      opacity: 0.7,
      zIndex: 20,
    },
    {
      scale: 0.88,
      rotate: 4,
      y: -24,
      opacity: 0.45,
      zIndex: 10,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
      {/* Subtle ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Success <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Stories</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Hear from diploma engineers who successfully transitioned to top BTech programs using our platform.
          </p>
        </div>

        <div
          className="relative flex items-center justify-center h-[320px] sm:h-[360px] md:h-[400px]"
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
              className="absolute w-[92%] sm:w-[85%] md:w-[680px]"
            >
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.5)] p-6 sm:p-8 md:p-10">
                <div className="flex flex-col items-center text-center">
                  {/* Quote Icon */}
                  <Quote size={32} className="text-orange-500/30 dark:text-orange-500/20 mb-4 rotate-180" />

                  {/* Avatar */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-500/20 dark:border-orange-500/30 overflow-hidden mb-5 ring-4 ring-orange-500/10 dark:ring-orange-500/5">
                    <Image
                      src={card.image}
                      alt={card.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-sm sm:text-lg md:text-xl italic text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl">
                    &ldquo;{card.quote}&rdquo;
                  </p>

                  <div className="mt-6">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                      {card.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                      {card.role}
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-3 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                const idx = cards.findIndex((c) => c.id === card.id);
                if (idx === 0) return;
                setCards((prev) => {
                  const next = [...prev];
                  const item = next.splice(idx, 1)[0];
                  next.unshift(item);
                  return next;
                });
              }}
              className={`rounded-full transition-all duration-300 ${
                i === 0
                  ? "w-8 h-2 bg-orange-500"
                  : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
              }`}
              aria-label={`Show testimonial from ${card.name}`}
              suppressHydrationWarning
            />
          ))}
        </div>
      </div>
    </section>
  );
}