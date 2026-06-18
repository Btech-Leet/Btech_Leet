"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toaster";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CouponInput from "@/components/ui/coupon-input";

interface ResourcePurchaseButtonProps {
  resourceId: string;
  resourceTitle: string;
  price: number;
  isLoggedIn: boolean;
}

export default function ResourcePurchaseButton({
  resourceId,
  resourceTitle,
  price,
  isLoggedIn,
}: ResourcePurchaseButtonProps) {
  const [paying, setPaying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(price);

  useEffect(() => {
    // Load Razorpay script if not already present
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleApplyCoupon = (discount: number, final: number, code: string) => {
    setDiscountAmount(discount);
    setFinalPrice(final);
    setCouponCode(code);
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setFinalPrice(price);
    setCouponCode("");
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to purchase this study resource.",
        variant: "destructive",
      });
      router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType: "RESOURCE",
          purchaseItemId: resourceId,
          couponCode: couponCode || undefined,
        }),
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast({
          title: "Order Failed",
          description: json.message || "Failed to initiate payment",
          variant: "destructive",
        });
        return;
      }

      // Check if order was fully discounted (free)
      if (json.data.free) {
        toast({
          title: "Unlocked Successfully",
          description: "🎉 The study resource has been unlocked for free!",
          variant: "success",
        });
        router.refresh();
        return;
      }

      const { orderId, amount, currency, keyId } = json.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "BTech LEET",
        description: resourceTitle,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyRes.ok && verifyJson.success) {
              toast({
                title: "Success",
                description: "🎉 Payment verified! Your study resource is unlocked.",
                variant: "success",
              });
              router.refresh(); // Refresh Server Component to unlock download
            } else {
              toast({
                title: "Verification Failed",
                description: "Failed to verify payment. Please contact support.",
                variant: "destructive",
              });
            }
          } catch {
            toast({
              title: "Error",
              description: "Network error during verification.",
              variant: "destructive",
            });
          }
        },
        theme: { color: "#3b82f6" }, // Blue theme matching Resources section
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast({
          title: "Gateway Offline",
          description: "Razorpay script is loading. Please try again in a moment.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {isLoggedIn && (
        <CouponInput
          itemId={resourceId}
          itemPrice={price}
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
        />
      )}

      <button
        onClick={handlePurchase}
        disabled={paying}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
      >
        {paying ? (
          <>
            <Loader2 className="animate-spin text-white" size={16} />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={16} />
            Unlock for ₹{finalPrice}
          </>
        )}
      </button>
    </div>
  );
}
