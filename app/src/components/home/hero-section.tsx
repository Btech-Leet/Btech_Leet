"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, BookOpen, FileText, Bell, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/exams?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 pt-16">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.3) 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          India&apos;s #1 LEET Exam Portal
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
          Your Complete Guide to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            BTech Lateral Entry
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Access state-wise LEET exam information, previous year question papers, mock tests, counselling schedules, and real-time notifications — all in one platform.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex max-w-xl mx-auto mb-10" role="search" aria-label="Search exams">
          <div className="flex flex-1 items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-l-xl px-4">
            <Search size={18} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exams by state or name..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-3 py-3 text-sm focus:outline-none"
              aria-label="Search exams"
            />
          </div>
          <Button type="submit" className="rounded-l-none rounded-r-xl px-6 shrink-0">
            Search
          </Button>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { href: "/exams", label: "Browse Exams", icon: BookOpen },
            { href: "/papers", label: "Previous Papers", icon: FileText },
            { href: "/notifications", label: "Notifications", icon: Bell },
            { href: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-medium transition-all duration-150 group"
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-150" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" aria-hidden="true" />
    </section>
  );
}
