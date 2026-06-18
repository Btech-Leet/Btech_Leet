"use client";

import { useState } from "react";
import { Tag, Loader2, Check, AlertCircle, X, Percent } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface CouponInputProps {
  itemId?: string;
  itemPrice: number;
  onApply: (discountAmount: number, finalPrice: number, code: string) => void;
  onRemove?: () => void;
}

export default function CouponInput({ itemId, itemPrice, onApply, onRemove }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!code.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
          itemId: itemId || null,
          itemPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply coupon");
      }

      const resData = data.data;
      setAppliedCode(resData.code);
      setDiscountAmount(resData.discountAmount);
      setFinalPrice(resData.finalPrice);
      
      onApply(resData.discountAmount, resData.finalPrice, resData.code);
      
      toast({
        title: "Coupon Applied",
        description: `Code "${resData.code}" applied. You saved ₹${resData.discountAmount}!`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to validate coupon");
      toast({
        title: "Coupon Failed",
        description: err.message || "Invalid or expired coupon code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCode(null);
    setDiscountAmount(null);
    setFinalPrice(null);
    setCode("");
    setError(null);
    setIsExpanded(false);
    if (onRemove) onRemove();
    toast({
      title: "Coupon Removed",
      description: "Coupon code has been removed.",
    });
  };

  // Applied state — compact success chip
  if (appliedCode) {
    return (
      <div className="space-y-2.5">
        {/* Applied coupon chip */}
        <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-green-500/8 dark:bg-green-500/10 border border-green-500/20 dark:border-green-500/15">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/15 dark:bg-green-500/20 flex items-center justify-center">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-green-700 dark:text-green-300 truncate">
                {appliedCode}
              </span>
              <span className="block text-[10px] text-green-600/70 dark:text-green-400/60 font-medium">
                You save ₹{discountAmount}
              </span>
            </div>
          </div>
          <button
            onClick={handleRemove}
            aria-label="Remove coupon"
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Price breakdown */}
        {discountAmount !== null && finalPrice !== null && (
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-xs px-1">
            <span className="text-gray-500 dark:text-gray-400">Original</span>
            <span className="text-right text-gray-500 dark:text-gray-400 font-medium">₹{itemPrice}</span>
            
            <span className="text-green-600 dark:text-green-400 font-medium">Discount</span>
            <span className="text-right text-green-600 dark:text-green-400 font-semibold">-₹{discountAmount}</span>
            
            <span className="text-gray-900 dark:text-white font-bold pt-1 border-t border-gray-200 dark:border-gray-800">Total</span>
            <span className="text-right text-gray-900 dark:text-white font-extrabold pt-1 border-t border-gray-200 dark:border-gray-800">₹{finalPrice}</span>
          </div>
        )}
      </div>
    );
  }

  // Default state — collapsible toggle
  return (
    <div className="space-y-2">
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 w-full text-left text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 py-1.5 transition-colors group"
        >
          <Tag size={13} className="text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors" />
          <span>Have a coupon code?</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Percent size={12} className="text-orange-500" />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Apply Coupon
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setError(null);
                setCode("");
              }}
              aria-label="Close coupon input"
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleApply} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="ENTER CODE"
                disabled={isLoading}
                autoFocus
                className="w-full text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              {isLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </form>

          {error && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-500 dark:text-red-400 px-0.5">
              <AlertCircle size={11} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
