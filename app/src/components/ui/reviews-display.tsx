"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, MessageSquare } from "lucide-react";
import ReviewForm from "./review-form";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  pageUrl: string | null;
  createdAt: string;
}

interface ReviewsDisplayProps {
  pageUrl?: string;
}

export default function ReviewsDisplay({ pageUrl }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEffectivePageUrl = useCallback(() => {
    if (pageUrl) return pageUrl;
    if (typeof window !== "undefined") return window.location.pathname;
    return "";
  }, [pageUrl]);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentPath = getEffectivePageUrl();
      const res = await fetch(`/api/reviews?pageUrl=${encodeURIComponent(currentPath)}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      } else {
        throw new Error(data.message || "Failed to load reviews");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong fetching reviews");
    } finally {
      setIsLoading(false);
    }
  }, [getEffectivePageUrl]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Breakdown counts
  const ratingsBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  // Generate Aggregate Rating and Reviews JSON-LD Schema
  const schemaJson = totalReviews > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "BTech LEET Preparation Resource",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": totalReviews,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.map((review) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "datePublished": review.createdAt.split("T")[0],
      "reviewBody": review.text,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      }
    }))
  } : null;

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
        />
      )}

      {/* Header / Aggregate Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm items-center">
        {/* Large average score */}
        <div className="text-center md:border-r border-gray-100 dark:border-gray-800 py-4 space-y-1">
          <span className="text-5xl font-extrabold text-gray-900 dark:text-white block">
            {averageRating > 0 ? averageRating : "0.0"}
          </span>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200 dark:text-gray-800"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Breakdown bar graph */}
        <div className="md:col-span-2 space-y-2">
          {ratingsBreakdown.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-xs">
              <span className="font-bold text-gray-500 w-3 text-right">{row.stars}</span>
              <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
              <span className="text-gray-400 dark:text-gray-500 w-8 text-right font-medium">
                {row.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-500" />
            User Reviews ({totalReviews})
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-850 w-24 rounded" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-850 w-full rounded" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-850 w-2/3 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/50 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <Star className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">No Reviews Yet</h3>
              <p className="text-xs text-gray-500 mt-1">Be the first to share your feedback by submitting the form!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                        {review.name}
                      </h4>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200 dark:text-gray-800"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission Form sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ReviewForm
              pageUrl={getEffectivePageUrl()}
              onSuccess={fetchReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
