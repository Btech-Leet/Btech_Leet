"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";

export function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-violet-700" aria-labelledby="subscribe-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="text-white" size={28} aria-hidden="true" />
        </div>

        <h2 id="subscribe-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Get LEET Updates in Your Inbox
        </h2>
        <p className="text-blue-100 text-lg mb-8">
          Subscribe for exam notifications, application alerts, and counselling updates delivered directly to your email.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 text-white">
            <CheckCircle size={24} aria-hidden="true" />
            <p className="text-lg font-semibold">You&apos;re subscribed! We&apos;ll keep you updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" role="form" aria-label="Email subscription form">
            <div className="flex-1">
              <label htmlFor="subscribe-email" className="sr-only">Email address</label>
              <input
                id="subscribe-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                aria-describedby={error ? "subscribe-error" : undefined}
              />
            </div>
            <Button
              type="submit"
              loading={status === "loading"}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shrink-0 px-6"
              aria-label="Subscribe to updates"
            >
              Subscribe
            </Button>
          </form>
        )}

        {error && (
          <p id="subscribe-error" className="text-red-200 text-sm mt-3" role="alert">{error}</p>
        )}

        <p className="text-blue-200/70 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
