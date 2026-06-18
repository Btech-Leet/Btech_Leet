"use client";

import { useEffect, useState } from "react";
import { Star, Check, X, Edit2, Trash2, Loader2, Save, MessageSquare, Filter } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Review {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  text: string;
  pageUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: { name: string; email: string } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const url = filter === "ALL" ? "/api/admin/reviews" : `/api/admin/reviews?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load reviews.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update review status");

      setReviews(reviews.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      toast({
        title: "Success",
        description: `Review is now ${newStatus.toLowerCase()}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingId(review.id);
    setEditName(review.name);
    setEditRating(review.rating);
    setEditText(review.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (editText.trim().length < 10) {
      toast({ title: "Review text must be at least 10 chars", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          rating: editRating,
          text: editText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to edit review");

      setReviews(reviews.map((r) => (r.id === id ? { ...r, name: editName, rating: editRating, text: editText } : r)));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Review details updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete review");

      setReviews(reviews.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Review deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
    REJECTED: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-500" size={24} />
            Reviews Moderation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Moderate, edit, and delete student ratings and comments across the site.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 shadow-sm">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold bg-transparent border-none text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-16 text-center text-gray-400 shadow-sm max-w-lg mx-auto">
          <MessageSquare className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <h3 className="font-bold text-gray-800 dark:text-gray-200">No Reviews Found</h3>
          <p className="text-xs text-gray-500 mt-1">There are no reviews matching the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => {
            const isEditing = editingId === review.id;

            return (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4"
              >
                {/* Meta details row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm font-bold px-2 py-1 border border-gray-200 dark:border-gray-800 bg-transparent rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      ) : (
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                          {review.name}{" "}
                          {review.email && (
                            <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">
                              ({review.email})
                            </span>
                          )}
                        </h4>
                      )}

                      {/* Display Page Url */}
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Page URL: <span className="font-semibold">{review.pageUrl || "Global"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[review.status]}`}>
                      {review.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating & Content */}
                <div className="space-y-2">
                  <div className="flex gap-0.5 items-center">
                    {isEditing ? (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setEditRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              size={16}
                              className={
                                star <= editRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200 dark:text-gray-800"
                              }
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200 dark:text-gray-850"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50/55 dark:bg-gray-950/30 p-3 rounded-xl border border-gray-100 dark:border-gray-850/50">
                      {review.text}
                    </p>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-850/40">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(review.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {review.status !== "APPROVED" && (
                        <button
                          onClick={() => handleStatusUpdate(review.id, "APPROVED")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                        >
                          <Check size={12} /> Approve
                        </button>
                      )}
                      {review.status !== "REJECTED" && (
                        <button
                          onClick={() => handleStatusUpdate(review.id, "REJECTED")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                        >
                          <X size={12} /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(review)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
