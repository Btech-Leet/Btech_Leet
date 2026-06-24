"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export const FaqForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !question.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question }),
      });

      if (!response.ok) throw new Error("Failed to submit question");
      
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="mx-auto text-green-500 mb-3" size={48} />
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Question Submitted!</h3>
        <p className="text-gray-500 text-sm mt-2">
          Thank you! We will review your question and publish an answer soon.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Ask Another Question
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="faq-name" className="text-xs font-bold text-gray-400 uppercase">Name *</label>
          <input
            id="faq-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="faq-email" className="text-xs font-bold text-gray-400 uppercase">Email *</label>
          <input
            id="faq-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Your email (kept private)"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <label htmlFor="faq-question" className="text-xs font-bold text-gray-400 uppercase">Question *</label>
        <textarea
          id="faq-question"
          required
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          placeholder="What do you want to know about LEET?"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isLoading ? "Submitting..." : "Submit Question"}
      </button>
    </form>
  );
};
