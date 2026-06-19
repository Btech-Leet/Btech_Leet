"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  CheckCircle2, PhoneCall, Users, GraduationCap, ArrowRight, 
  ShieldCheck, Clock, Download, AlertCircle, RefreshCw, Sparkles, Star 
} from "lucide-react";

export default function CounsellingPage() {
  const { user, loading: authLoading } = useAuth();
  
  // States
  const [price, setPrice] = useState<number>(999);
  const [priceLoading, setPriceLoading] = useState<boolean>(true);
  
  // Premium registration form
  const [premiumName, setPremiumName] = useState("");
  const [premiumMobile, setPremiumMobile] = useState("");
  const [premiumExam, setPremiumExam] = useState("");
  const [premiumRank, setPremiumRank] = useState("");
  const [premiumSubmitting, setPremiumSubmitting] = useState(false);
  const [premiumSuccess, setPremiumSuccess] = useState<{
    invoiceNumber: string;
    transactionId: string;
    free: boolean;
  } | null>(null);

  // Callback form
  const [callbackName, setCallbackName] = useState("");
  const [callbackMobile, setCallbackMobile] = useState("");
  const [callbackExam, setCallbackExam] = useState("");
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [callbackError, setCallbackError] = useState("");

  // Load Razorpay Script & Price
  useEffect(() => {
    // 1. Fetch current price
    fetch("/api/admin/counselling/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPrice(data.data.price);
        }
      })
      .catch((err) => console.error("Error loading counselling price:", err))
      .finally(() => setPriceLoading(false));

    // 2. Inject Razorpay Script if not present
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Prefill premium form if user is logged in
  useEffect(() => {
    if (user) {
      setPremiumName(user.name);
      setCallbackName(user.name);
    }
  }, [user]);

  // Handle Instant Premium Registration & Payment
  const handlePremiumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Please log in to register for premium counselling.");
      return;
    }

    if (!premiumName.trim() || !premiumMobile.trim() || !premiumExam.trim()) {
      setErrorMessage("Please fill in name, mobile number, and target exam.");
      return;
    }

    setPremiumSubmitting(true);

    try {
      const res = await fetch("/api/payment/counselling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: premiumName,
          mobile: premiumMobile,
          leetExam: premiumExam,
          rank: premiumRank,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.message || "Failed to initiate registration");
        setPremiumSubmitting(false);
        return;
      }

      // If price is 0 (Free)
      if (json.data.free) {
        setPremiumSuccess({
          invoiceNumber: json.data.invoiceNumber,
          transactionId: json.data.transactionId,
          free: true,
        });
        setPremiumSubmitting(false);
        return;
      }

      // Paid counselling with Razorpay
      const { orderId, amount, currency, transactionId, keyId } = json.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "BTech LEET",
        description: "Premium Counselling Registration",
        order_id: orderId,
        prefill: {
          name: premiumName,
          contact: premiumMobile,
          email: user.email,
        },
        handler: async (response: any) => {
          setPremiumSubmitting(true);
          try {
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
              setPremiumSuccess({
                invoiceNumber: verifyJson.data.invoiceNumber,
                transactionId: verifyJson.data.transactionId,
                free: false,
              });
            } else {
              setErrorMessage("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setErrorMessage("Payment verification error. Please contact support.");
          } finally {
            setPremiumSubmitting(false);
          }
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setPremiumSubmitting(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Payment gateway script is loading. Please click register again.");
        setPremiumSubmitting(false);
      }
    } catch (err: any) {
      console.error("Premium submit error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setPremiumSubmitting(false);
    }
  };

  // Handle Free Callback Submission
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackError("");

    if (!callbackName.trim() || !callbackMobile.trim() || !callbackExam.trim()) {
      setCallbackError("Please fill in all details for a callback.");
      return;
    }

    setCallbackSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callbackName,
          email: user?.email || "callback@btechleet.com",
          mobile: callbackMobile,
          subject: "LEET Counselling Callback Request",
          message: `Requesting a free consultation callback. Target Exam: ${callbackExam}.`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setCallbackSuccess(true);
        setCallbackName("");
        setCallbackMobile("");
        setCallbackExam("");
      } else {
        setCallbackError(json.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Callback submission error:", err);
      setCallbackError("An unexpected error occurred.");
    } finally {
      setCallbackSubmitting(false);
    }
  };

  return (
    <main className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Admissions Open 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
            Expert <span className="text-blue-600">Counselling</span> for LEET Admissions
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Get personalized guidance to secure your admission in top engineering colleges through lateral entry. We help you navigate the complex counselling process of HSTES, UPTU, IPU, and more.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#registration-section"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <PhoneCall size={18} />
              Book Counselling Assistance
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Students Placed", value: "500+" },
            { label: "Top Colleges", value: "50+" },
            { label: "Success Rate", value: "98%" },
            { label: "States Covered", value: "8+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Choice Filling Strategy</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We analyze your rank and preferences to create a perfectly optimized choice filling list that maximizes your chances of getting a top college.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Document Verification</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Never get rejected due to wrong documents. Our experts verify all your certificates, migration, and domicile documents before submission.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">24/7 Priority Support</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Counselling rounds happen fast. Get instant WhatsApp and call support during crucial choice locking and seat allotment windows.
            </p>
          </div>
        </div>

        {/* Dynamic Forms Container */}
        <div id="registration-section" className="grid lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Column 1: Premium Online Instant Registration (7 Columns) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 overflow-hidden flex flex-col justify-between p-8 relative shadow-sm">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-600 rounded-full blur-[80px] opacity-15" />
            
            {premiumSuccess ? (
              // Success Screen with Invoice and Point of Contact Details
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Successful!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-md">
                  Thank you for registering. You are now enrolled in the Premium LEET Counselling program.
                </p>

                {/* Point of Contact Box */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-left mb-8 max-w-md">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-blue-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-blue-600 dark:text-blue-400">Your Counselling Lead</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Nishant</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Lateral Entry Counselling Expert</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Call / WhatsApp</p>
                      <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">+91 7988316241</p>
                    </div>
                    <a
                      href="tel:+917988316241"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneCall size={12} /> Call Now
                    </a>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <a
                    href={`/api/invoice/${premiumSuccess.transactionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Download size={14} /> Download Invoice
                  </a>
                  <Link
                    href="/dashboard/billing"
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs text-center"
                  >
                    Go to Billing Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              // Form
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-500/10">
                      Option 1: Instant Premium Booking
                    </span>
                    {priceLoading ? (
                      <RefreshCw size={14} className="animate-spin text-slate-400" />
                    ) : (
                      <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                        {price <= 0 ? "FREE" : `₹${price.toLocaleString("en-IN")}`}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Register for Expert Counselling</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                    Book your premium package instantly. Access state-wise choice filling, verification checks, and 24/7 helpline access with Nishant.
                  </p>

                  <form onSubmit={handlePremiumSubmit} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3.5 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-500/20">
                        <AlertCircle size={14} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={premiumName}
                          onChange={(e) => setPremiumName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone / WhatsApp Number</label>
                        <input
                          type="tel"
                          required
                          value={premiumMobile}
                          onChange={(e) => setPremiumMobile(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target LEET Exam</label>
                        <input
                          type="text"
                          required
                          value={premiumExam}
                          onChange={(e) => setPremiumExam(e.target.value)}
                          placeholder="e.g. Haryana LEET, IPU LEET"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">LEET Rank (Optional)</label>
                        <input
                          type="text"
                          value={premiumRank}
                          onChange={(e) => setPremiumRank(e.target.value)}
                          placeholder="e.g. Rank 245 or Not Declared"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {!user ? (
                      <div className="pt-4">
                        <Link
                          href="/auth/login?redirect=/counselling"
                          className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          Login to Register <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={premiumSubmitting}
                        className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        {premiumSubmitting ? (
                          <><RefreshCw size={14} className="animate-spin" /> Processing Payment...</>
                        ) : (
                          <>Pay & Register Instantly <ArrowRight size={14} /></>
                        )}
                      </button>
                    )}
                  </form>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center gap-2 text-[10px] text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Secure checkout powered by Razorpay. Refund options apply per guidelines.</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Free Callback Consultation Form (5 Columns) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-8 flex flex-col justify-between shadow-sm">
            <div>
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-800 mb-4">
                Option 2: Request Call back
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Speak to a Counsellor</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                Not ready to pay? Drop your details and we will call you back within 24 hours to discuss your basic queries.
              </p>

              {callbackSuccess ? (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center py-10 my-4">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Callback Requested!</h4>
                  <p className="text-xs text-slate-500">Our support coordinators will contact you soon.</p>
                  <button
                    onClick={() => setCallbackSuccess(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 underline font-semibold mt-4"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  {callbackError && (
                    <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span>{callbackError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      placeholder="e.g. Amit Kumar"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={callbackMobile}
                      onChange={(e) => setCallbackMobile(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Which Exam are you targeting?</label>
                    <input
                      type="text"
                      required
                      value={callbackExam}
                      onChange={(e) => setCallbackExam(e.target.value)}
                      placeholder="e.g. Haryana LEET"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackSubmitting}
                    className="w-full py-3 bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    {callbackSubmitting ? (
                      <><RefreshCw size={14} className="animate-spin" /> Submitting...</>
                    ) : (
                      <>Request Callback <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
            
            <div className="text-[10px] text-slate-500 text-center mt-6">
              Our standard consultation is 100% free with no obligation to purchase premium features.
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
