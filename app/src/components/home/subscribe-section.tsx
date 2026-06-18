"use client";

import { useState } from "react";
import Link from "next/link";

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
    <section
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
      aria-labelledby="subscribe-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            sm:rounded-[32px]
            border
            border-slate-200 dark:border-white/10
            bg-gradient-to-r
            from-slate-100 via-slate-50 to-white
            dark:from-[#132544]
            dark:via-[#162742]
            dark:to-[#1d2333]
            p-5
            sm:p-8
            md:p-12
            lg:p-14
            transition-colors duration-300
          "
        >
          {/* Glow Effects */}
          <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -right-32 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="w-full">
              <h2
                id="subscribe-heading"
                className="
                  text-3xl
                  sm:text-4xl
                  md:text-5xl
                  lg:text-6xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-900 dark:text-white
                "
              >
                Sign up for our{" "}
                <span className="text-orange-500">
                  newsletter
                </span>
              </h2>

              <div className="mt-5 flex items-start gap-3">
                <span className="text-orange-500 text-lg shrink-0">
                  →
                </span>

                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300">
                    Stay in the loop with everything you need to know.
                  </p>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full">
              {status === "success" ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-white dark:bg-slate-900/50 p-5 backdrop-blur-xl">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    You're subscribed!
                  </p>

                  <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
                    We'll keep you updated with the latest alerts.
                  </p>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <input
                      id="subscribe-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="
                        w-full
                        h-12
                        sm:h-14
                        rounded-full
                        border
                        border-slate-200 dark:border-white/10
                        bg-white dark:bg-slate-900/40
                        px-5
                        text-slate-900 dark:text-white
                        placeholder:text-slate-400 dark:placeholder:text-slate-500
                        backdrop-blur-xl
                        focus:outline-none
                        focus:border-orange-500
                      "
                    />

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="
                        w-full
                        h-12
                        sm:h-14
                        rounded-full
                        bg-orange-600
                        hover:bg-orange-500
                        disabled:opacity-70
                        text-white
                        font-semibold
                        transition-all
                        flex
                        items-center
                        justify-center
                        gap-2
                        cursor-pointer
                      "
                    >
                      {status === "loading"
                        ? "Subscribing..."
                        : "Subscribe"}

                      <span>›</span>
                    </button>
                  </form>

                  {error && (
                    <p className="mt-3 text-sm text-red-400">
                      {error}
                    </p>
                  )}

                  <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    We care about your data in our{" "}
                    <Link
                      href="/privacy"
                      className="text-orange-500 hover:underline"
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