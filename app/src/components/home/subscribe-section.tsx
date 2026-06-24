"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle, ArrowRight } from "lucide-react";

export function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setError(data.message || "Failed to subscribe");
      }
    } catch {
      setStatus("error");
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-8 sm:p-12 md:p-16">
          {/* Ambient glow effects */}
          <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
          <div className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[120px]" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="w-full">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                Sign up for our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  newsletter
                </span>
              </h2>

              <div className="mt-5 flex items-start gap-3">
                <ArrowRight size={20} className="text-orange-500 shrink-0 mt-1" />
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
                  Stay in the loop with everything you need to know about LEET exams, deadlines, and new resources.
                </p>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full">
              {status === "success" ? (
                <div className="rounded-2xl border border-green-500/20 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-6 backdrop-blur-xl flex items-start gap-4">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      You&apos;re subscribed!
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
                      We&apos;ll keep you updated with the latest alerts and resources.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                    suppressHydrationWarning
                  >
                    <input
                      id="subscribe-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 px-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 backdrop-blur-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                      suppressHydrationWarning
                    />

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="group w-full h-14 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-70 text-white dark:text-slate-900 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98]"
                      suppressHydrationWarning
                    >
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Subscribing...
                        </span>
                      ) : (
                        <>
                          Subscribe
                          <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  {error && (
                    <p className="mt-3 text-sm text-red-500 dark:text-red-400 font-medium">
                      {error}
                    </p>
                  )}

                  <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    We care about your data in our{" "}
                    <Link
                      href="/privacy"
                      className="text-orange-500 hover:underline font-medium"
                    >
                      privacy policy
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}