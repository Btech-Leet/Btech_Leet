"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  CreditCard, Crown, Check, RefreshCw, AlertCircle, Download,
  Sparkles, Shield, Clock, Star, ArrowRight, X, Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CouponInput from "@/components/ui/coupon-input";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
}

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  purchaseType: string;
  purchaseName: string;
  refundStatus: string;
  invoiceNumber: string | null;
  createdAt: string;
}

const PLAN_HIGHLIGHTS: Record<string, { color: string; badge: string; popular: boolean }> = {
  "1": { color: "border-blue-500/30 from-blue-500/5 to-blue-600/5", badge: "Starter", popular: false },
  "3": { color: "border-purple-500/30 from-purple-500/5 to-indigo-500/5", badge: "Value", popular: true },
  "6": { color: "border-emerald-500/30 from-emerald-500/5 to-teal-500/5", badge: "Pro", popular: false },
  "12": { color: "border-amber-500/30 from-amber-500/5 to-yellow-500/5", badge: "Ultimate", popular: false },
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Record<string, { code: string; discountAmount: number; finalPrice: number }>>({});

  useEffect(() => {
    fetchData();
    // Load Razorpay script
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, txRes] = await Promise.all([
        fetch("/api/payment/plans"),
        fetch("/api/dashboard/performance"), // For transaction history, we'll use a separate endpoint
      ]);
      const plansJson = await plansRes.json();
      if (plansJson.success) setPlans(plansJson.data.filter((p: Plan) => p.active));
      
      // Fetch user transactions
      const txnRes = await fetch("/api/payment/history");
      if (txnRes.ok) {
        const txnJson = await txnRes.json();
        if (txnJson.success) setTransactions(txnJson.data || []);
      }
    } catch (err) {
      console.error("Billing data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: Plan) => {
    setPaying(plan.id);
    const planCoupon = coupons[plan.id];
    try {
      const res = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseType: "PLAN",
          purchaseItemId: plan.id,
          couponCode: planCoupon ? planCoupon.code : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || "Failed to create order");
        return;
      }

      // Check if plan was unlocked for free via coupon
      if (json.data.free) {
        alert("🎉 Premium plan activated successfully for free!");
        fetchData();
        return;
      }

      const { orderId, amount, currency, keyId } = json.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "BTech LEET",
        description: plan.name,
        order_id: orderId,
        handler: async (response: any) => {
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
          if (verifyJson.success) {
            alert("🎉 Payment successful! Premium activated.");
            fetchData();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setPaying(null) },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Payment gateway is loading. Please try again.");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Failed to initiate payment");
    } finally {
      setPaying(null);
    }
  };

  const handleRefundRequest = async (txId: string) => {
    setRefunding(txId);
    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action: "REQUEST", reason: refundReason }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Refund request submitted.");
        setShowRefundModal(null);
        setRefundReason("");
        fetchData();
      } else {
        alert(json.message || "Failed to request refund");
      }
    } catch (err) {
      console.error("Refund request error:", err);
    } finally {
      setRefunding(null);
    }
  };

  const getPlanVisuals = (plan: Plan) => {
    const months = Math.round(plan.duration / 30);
    const key = String(months);
    return PLAN_HIGHLIGHTS[key] || PLAN_HIGHLIGHTS["1"];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin text-indigo-500 mb-4" size={36} />
        <p className="text-sm">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-900 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-3">
                <Crown size={12} />
                Premium Membership
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-400">
                Membership & Billing
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Unlock premium features, manage subscriptions, and view purchase history.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-900 gap-4 mb-8">
            {[
              { id: "plans", label: "Premium Plans", icon: Crown },
              { id: "history", label: "Purchase History", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 -mb-px transition-all ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ─── PLANS TAB ─── */}
          {activeTab === "plans" && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {plans.map((plan) => {
                  const visuals = getPlanVisuals(plan);
                  const months = Math.round(plan.duration / 30);
                  const planCoupon = coupons[plan.id];
                  const finalPrice = planCoupon ? planCoupon.finalPrice : plan.price;
                  const monthlyPrice = Math.round(finalPrice / months);
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-gradient-to-b ${visuals.color} border rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 ${
                        visuals.popular ? "ring-2 ring-purple-500/50" : ""
                      }`}
                    >
                      {visuals.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-[10px] font-bold text-white rounded-full uppercase tracking-wider">
                          Most Popular
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={14} className="text-indigo-400" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{visuals.badge}</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-white mb-1">{plan.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-black text-white">₹{finalPrice.toLocaleString("en-IN")}</span>
                          <span className="text-xs text-gray-400 ml-1">/ {months} {months === 1 ? "month" : "months"}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-4">₹{monthlyPrice}/month</p>
                        
                        <div className="space-y-2 mb-6">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-300">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <CouponInput
                          itemId={plan.id}
                          itemPrice={plan.price}
                          onApply={(discount, final, code) => {
                            setCoupons(prev => ({
                              ...prev,
                              [plan.id]: { code, discountAmount: discount, finalPrice: final }
                            }));
                          }}
                          onRemove={() => {
                            setCoupons(prev => {
                              const updated = { ...prev };
                              delete updated[plan.id];
                              return updated;
                            });
                          }}
                        />
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(plan)}
                        disabled={paying === plan.id}
                        className={`w-full font-bold rounded-xl ${
                          visuals.popular
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        }`}
                      >
                        {paying === plan.id ? (
                          <><RefreshCw size={14} className="mr-1.5 animate-spin" /> Processing...</>
                        ) : (
                          <>Get {visuals.badge} <ArrowRight size={14} className="ml-1.5" /></>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {plans.length === 0 && (
                <div className="text-center py-16">
                  <Shield className="text-gray-600 mx-auto mb-4" size={48} />
                  <h3 className="text-lg font-bold text-gray-400">No Plans Available</h3>
                  <p className="text-sm text-gray-500 mt-1">Premium plans will be listed here once configured by admin.</p>
                </div>
              )}

              {/* Features Highlight */}
              <Card className="bg-gray-900 border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Zap className="text-amber-500" size={18} />
                    What&apos;s Included in Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: "📚", label: "All Mock Tests", desc: "Unlimited test access" },
                      { icon: "📖", label: "Study Materials", desc: "Premium notes & books" },
                      { icon: "📊", label: "Advanced Analytics", desc: "In-depth performance" },
                      { icon: "🏆", label: "Priority Support", desc: "24/7 expert guidance" },
                    ].map((f) => (
                      <div key={f.label} className="p-4 bg-gray-950 rounded-xl border border-gray-850 text-center">
                        <div className="text-2xl mb-2">{f.icon}</div>
                        <p className="text-xs font-bold text-white">{f.label}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── HISTORY TAB ─── */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fadeIn">
              <Card className="bg-gray-900 border-gray-800 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-base">Purchase History</CardTitle>
                  <CardDescription className="text-gray-400 text-xs">All your transactions, invoices, and refund requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {transactions.length === 0 ? (
                    <div className="text-center py-16">
                      <CreditCard className="text-gray-600 mx-auto mb-4" size={48} />
                      <h3 className="text-lg font-bold text-gray-400">No Transactions Yet</h3>
                      <p className="text-sm text-gray-500 mt-1">Your purchase history will appear here.</p>
                      <Button onClick={() => setActiveTab("plans")} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                        Browse Plans
                      </Button>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-y border-gray-850 bg-gray-950 text-gray-400">
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Item</th>
                          <th className="p-4 font-semibold text-center">Amount</th>
                          <th className="p-4 font-semibold text-center">Status</th>
                          <th className="p-4 font-semibold text-center">Refund</th>
                          <th className="p-4 font-semibold text-center">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-850 hover:bg-gray-850/20">
                            <td className="p-4 text-gray-400">
                              {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="p-4 text-white font-medium">{tx.purchaseName}</td>
                            <td className="p-4 text-center text-blue-400 font-bold">₹{tx.amount.toLocaleString("en-IN")}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                tx.status === "SUCCESSFUL" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                tx.status === "FAILED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                tx.status === "REFUNDED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {tx.status === "SUCCESSFUL" && tx.refundStatus === "NONE" ? (
                                <button
                                  onClick={() => setShowRefundModal(tx.id)}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold"
                                >
                                  Request
                                </button>
                              ) : tx.refundStatus !== "NONE" ? (
                                <span className={`text-[10px] font-semibold ${
                                  tx.refundStatus === "APPROVED" ? "text-green-400" :
                                  tx.refundStatus === "REJECTED" ? "text-red-400" :
                                  "text-amber-400"
                                }`}>
                                  {tx.refundStatus}
                                </span>
                              ) : (
                                <span className="text-gray-600 text-[10px]">—</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {tx.invoiceNumber ? (
                                <a
                                  href={`/api/invoice/${tx.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                                >
                                  <Download size={10} />
                                  {tx.invoiceNumber}
                                </a>
                              ) : (
                                <span className="text-gray-600 text-[10px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Request Refund</h3>
                <p className="text-xs text-gray-400 mt-1">Please provide a reason for your refund request.</p>
              </div>
              <button onClick={() => setShowRefundModal(null)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why you want a refund..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-800 bg-gray-950 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRefundModal(null)}
                  className="flex-1 border-gray-700 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRefundRequest(showRefundModal)}
                  disabled={refunding === showRefundModal}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {refunding === showRefundModal ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
