"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface ReviewFormProps {
  pageUrl?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ pageUrl, onSuccess }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Required Field",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    if (text.trim().length < 10) {
      toast({
        title: "Too Short",
        description: "Your review must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          rating,
          text: text.trim(),
          pageUrl: pageUrl || window.location.pathname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setIsSubmitted(true);
      toast({
        title: "Review Submitted",
        description: "Thank you! Your review is pending moderation.",
      });
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-emerald-500" size={40} />
        <h3 className="font-bold text-gray-900 dark:text-white">Review Submitted!</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Thank you for sharing your experience. Your review will be visible once approved by an admin.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setName("");
            setEmail("");
            setText("");
            setRating(5);
          }}
          className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Submit another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
        Leave a Review
      </h3>

      {/* Star Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Your Rating</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="focus:outline-none transition-transform duration-100 active:scale-95"
            >
              <Star
                size={24}
                className={`transition-colors duration-155 ${
                  star <= (hoverRating ?? rating)
                    ? "fill-amber-400 text-amber-400 scale-105"
                    : "text-gray-300 dark:text-gray-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label htmlFor="review-name" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Your Name
          </label>
          <input
            id="review-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isLoading}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="review-email" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            Email (Optional)
          </label>
          <input
            id="review-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={isLoading}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-1">
        <label htmlFor="review-text" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          Your Review
        </label>
        <textarea
          id="review-text"
          required
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this study material or exam prep..."
          disabled={isLoading}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
