"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toaster";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CouponInput from "@/components/ui/coupon-input";

interface PurchaseButtonProps {
  bookId: string;
  bookName: string;
  bookPrice: number;
  isLoggedIn: boolean;
}

export default function PurchaseButton({
  bookId,
  bookName,
  bookPrice,
  isLoggedIn,
}: PurchaseButtonProps) {
  const [paying, setPaying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(bookPrice);

  useEffect(() => {
    // Load Razorpay script
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
    setFinalPrice(bookPrice);
    setCouponCode("");
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to purchase this book/notes.",
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
          purchaseType: "BOOK",
          purchaseItemId: bookId,
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
          description: "🎉 The book has been unlocked for free!",
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
        description: bookName,
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
                description: "🎉 Payment verified! Your book is unlocked.",
                variant: "success",
              });
              router.refresh(); // Refresh Server Component state to show download button
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
        theme: { color: "#ea580c" }, // Orange theme matching BTech LEET
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
    <div className="space-y-4 w-full">
      {isLoggedIn && (
        <CouponInput
          itemId={bookId}
          itemPrice={bookPrice}
          onApply={handleApplyCoupon}
          onRemove={handleRemoveCoupon}
        />
      )}

      <button
        onClick={handlePurchase}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98]"
      >
        {paying ? (
          <>
            <Loader2 className="animate-spin text-white" size={18} />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard size={18} />
            Buy Now for ₹{finalPrice}
          </>
        )}
      </button>
    </div>
  );
}
