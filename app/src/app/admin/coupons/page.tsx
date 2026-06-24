"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Edit2, Trash2, Loader2, Save, X, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  applicableTo: string[];
  startDate: string;
  endDate: string;
  active: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [applicableToText, setApplicableToText] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);
  const [usageLimit, setUsageLimit] = useState<string>("");

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load coupons.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleStartEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setApplicableToText(coupon.applicableTo.join(", "));
    
    // Format dates for datetime-local inputs (YYYY-MM-DDTHH:MM)
    const start = new Date(coupon.startDate);
    const startFormatted = start.toISOString().slice(0, 16);
    const end = new Date(coupon.endDate);
    const endFormatted = end.toISOString().slice(0, 16);

    setStartDate(startFormatted);
    setEndDate(endFormatted);
    setActive(coupon.active);
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
  };

  const handleResetForm = () => {
    setEditingId(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue(0);
    setApplicableToText("ALL");
    setStartDate("");
    setEndDate("");
    setActive(true);
    setUsageLimit("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({ title: "Validation Error", description: "Coupon code is required", variant: "destructive" });
      return;
    }
    if (discountValue <= 0) {
      toast({ title: "Validation Error", description: "Discount value must be greater than 0", variant: "destructive" });
      return;
    }
    if (!startDate || !endDate) {
      toast({ title: "Validation Error", description: "Start and End dates are required", variant: "destructive" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      toast({ title: "Validation Error", description: "End date must be after start date", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const applicableTo = applicableToText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      applicableTo: applicableTo.length > 0 ? applicableTo : ["ALL"],
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      active,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
    };

    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save coupon");

      toast({
        title: "Success",
        description: editingId ? "Coupon updated successfully." : "Coupon created successfully.",
      });

      handleResetForm();
      fetchCoupons();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Operation failed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete coupon");

      setCoupons(coupons.filter((c) => c.id !== id));
      toast({
        title: "Success",
        description: "Coupon deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="text-orange-500" size={24} />
          Coupon Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">
          Create, edit, and monitor discount coupon codes for mock tests, courses, and premium notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2">
            {editingId ? "Edit Coupon" : "Create Coupon"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Coupon Code */}
            <div className="space-y-1">
              <label htmlFor="coupon-code" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Coupon Code
              </label>
              <input
                id="coupon-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SAVE50"
                disabled={isSubmitting}
                className="w-full text-sm font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="discount-type" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Discount Type
                </label>
                <select
                  id="discount-type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="discount-value" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Value ({discountType === "PERCENTAGE" ? "%" : "₹"})
                </label>
                <input
                  id="discount-value"
                  type="number"
                  required
                  min={0.01}
                  step="any"
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value))}
                  placeholder={discountType === "PERCENTAGE" ? "10" : "100"}
                  disabled={isSubmitting}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Applicable To */}
            <div className="space-y-1">
              <label htmlFor="applicable-to" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                Applicable To
              </label>
              <input
                id="applicable-to"
                type="text"
                value={applicableToText}
                onChange={(e) => setApplicableToText(e.target.value)}
                placeholder="ALL, course-123, paper-abc"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Enter &quot;ALL&quot; for all items or separate specific item IDs with commas.
              </span>
            </div>

            {/* Usage Limit */}
            <div className="space-y-1">
              <label htmlFor="usage-limit" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Usage Limit (Optional)
              </label>
              <input
                id="usage-limit"
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="100 (unlimited if blank)"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label htmlFor="start-date" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Start Date & Time
              </label>
              <input
                id="start-date"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label htmlFor="end-date" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                End Date & Time
              </label>
              <input
                id="end-date"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="active-toggle"
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="active-toggle" className="text-sm font-semibold text-gray-700 dark:text-slate-600 dark:text-slate-300">
                Active & Enabled
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingId ? (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create Coupon
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Coupons List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            Existing Coupons ({coupons.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={28} className="animate-spin text-orange-500" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500 dark:text-slate-400 shadow-sm">
              <Tag className="mx-auto text-slate-600 dark:text-slate-300 dark:text-gray-700 mb-4" size={48} />
              <h3 className="font-bold text-gray-850 dark:text-slate-700 dark:text-slate-200">No Coupons Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Start by creating your first coupon code on the left.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {coupons.map((coupon) => {
                const now = new Date();
                const start = new Date(coupon.startDate);
                const end = new Date(coupon.endDate);
                const isExpired = now > end;
                const isNotStarted = now < start;
                const limitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

                let statusBadgeText = "Active";
                let statusBadgeColor = "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/20";

                if (!coupon.active) {
                  statusBadgeText = "Disabled";
                  statusBadgeColor = "bg-gray-100 text-gray-800 dark:bg-slate-50 dark:bg-slate-950/30 dark:text-slate-500 dark:text-slate-400 border-gray-200 dark:border-gray-900/20";
                } else if (isExpired) {
                  statusBadgeText = "Expired";
                  statusBadgeColor = "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/20";
                } else if (isNotStarted) {
                  statusBadgeText = "Scheduled";
                  statusBadgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/20";
                } else if (limitReached) {
                  statusBadgeText = "Limit Reached";
                  statusBadgeColor = "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/20";
                }

                return (
                  <div
                    key={coupon.id}
                    className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-lg">
                          {coupon.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${statusBadgeColor}`}>
                          {statusBadgeText}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400">
                        <p>
                          Discount: <strong className="text-gray-850 dark:text-slate-900 dark:text-white">
                            {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                          </strong>
                        </p>
                        <p className="truncate">
                          Applies to: <span className="font-semibold text-gray-600 dark:text-slate-600 dark:text-slate-300">{coupon.applicableTo.join(", ")}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            {start.toLocaleDateString("en-IN")} to {end.toLocaleDateString("en-IN")}
                          </span>
                        </p>
                        <p>
                          Usage: <strong className="text-gray-700 dark:text-slate-600 dark:text-slate-300">
                            {coupon.usedCount}
                          </strong> / {coupon.usageLimit !== null ? coupon.usageLimit : "∞"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 border-gray-50 dark:border-slate-200 dark:border-slate-800/40 pt-3 sm:pt-0">
                      <button
                        onClick={() => handleStartEdit(coupon)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
