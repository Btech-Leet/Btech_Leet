"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, CreditCard, AlertTriangle, RefreshCw,
  Check, X, ChevronDown, Eye, BarChart3, ArrowUpRight, Percent,
  Package, Wallet, ShieldAlert
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

interface Stats {
  revenueToday: number;
  ordersToday: number;
  revenueMonth: number;
  ordersMonth: number;
  revenueTotal: number;
  ordersTotal: number;
  conversionRate: number;
  failedCount: number;
  pendingRefunds: number;
}

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string | null;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: string;
  purchaseType: string;
  purchaseName: string;
  refundStatus: string;
  refundReason: string | null;
  failureReason: string | null;
  invoiceNumber: string | null;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  active: boolean;
}

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "plans" | "refunds">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  // Plan form
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planDuration, setPlanDuration] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [txRes, plansRes] = await Promise.all([
        fetch(`/api/admin/transactions${statusFilter ? `?status=${statusFilter}` : ""}`),
        fetch("/api/admin/plans"),
      ]);
      
      const txJson = await txRes.json();
      if (txJson.success) {
        setStats(txJson.data.stats);
        setMonthlyTrend(txJson.data.monthlyTrend);
        setTransactions(txJson.data.transactions);
      }
      
      const plansJson = await plansRes.json();
      if (plansJson.success) setPlans(plansJson.data);
    } catch (err) {
      console.error("Admin billing load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundAction = async (txId: string, action: "APPROVE" | "REJECT") => {
    setProcessing(txId);
    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action, remarks: `${action} by admin` }),
      });
      const json = await res.json();
      if (json.success) fetchAll();
      else alert(json.message);
    } catch (err) {
      console.error("Refund action error:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleSavePlan = async () => {
    try {
      const payload = {
        ...(editPlan && { id: editPlan.id }),
        name: planName,
        price: planPrice,
        duration: planDuration,
        features: planFeatures.split("\n").filter(Boolean),
      };
      const method = editPlan ? "PUT" : "POST";
      const res = await fetch("/api/admin/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        resetPlanForm();
        fetchAll();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error("Plan save error:", err);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Deactivate this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) fetchAll();
    } catch (err) {
      console.error("Plan delete error:", err);
    }
  };

  const openEditPlan = (plan: Plan) => {
    setEditPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(String(plan.price));
    setPlanDuration(String(plan.duration));
    setPlanFeatures(plan.features.join("\n"));
    setShowPlanForm(true);
  };

  const resetPlanForm = () => {
    setEditPlan(null);
    setPlanName("");
    setPlanPrice("");
    setPlanDuration("");
    setPlanFeatures("");
    setShowPlanForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <RefreshCw className="animate-spin text-indigo-500 mr-3" size={24} />
        <span className="text-slate-500 dark:text-slate-400">Loading billing analytics...</span>
      </div>
    );
  }

  const refundRequests = transactions.filter((t) => t.refundStatus === "REQUESTED");

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Billing Command Centre</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Revenue analytics, plan management, refund approvals, and transaction logs.</p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={14} />
          Refresh Data
        </button>
      </div>

      {/* Revenue Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Today's Revenue", value: `₹${(stats.revenueToday || 0).toLocaleString("en-IN")}`, sub: `${stats.ordersToday} orders`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/30" },
            { label: "Monthly Revenue", value: `₹${(stats.revenueMonth || 0).toLocaleString("en-IN")}`, sub: `${stats.ordersMonth} orders`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-950/20 border-blue-900/30" },
            { label: "Total Revenue", value: `₹${(stats.revenueTotal || 0).toLocaleString("en-IN")}`, sub: `${stats.ordersTotal} total orders`, icon: Wallet, color: "text-purple-400", bg: "bg-purple-950/20 border-purple-900/30" },
            { label: "Conversion Rate", value: `${stats.conversionRate}%`, sub: `${stats.failedCount} failed`, icon: Percent, color: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/30" },
            { label: "Pending Refunds", value: stats.pendingRefunds, sub: "Awaiting approval", icon: ShieldAlert, color: stats.pendingRefunds > 0 ? "text-red-400" : "text-slate-500 dark:text-slate-400", bg: stats.pendingRefunds > 0 ? "bg-red-950/20 border-red-900/30" : "bg-slate-50 dark:bg-slate-950/20 border-gray-900/30" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`border rounded-2xl p-4 ${stat.bg}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{stat.label}</span>
                  <Icon size={14} className={stat.color} />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium">{stat.sub}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-900 gap-4">
        {[
          { id: "overview", label: "Revenue Trends" },
          { id: "transactions", label: "All Transactions" },
          { id: "plans", label: "Plan Management" },
          { id: "refunds", label: `Refund Queue (${refundRequests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 text-xs font-bold border-b-2 -mb-px transition-all ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-400" />
            Monthly Revenue Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── TRANSACTIONS TAB ─── */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <label htmlFor="billing-filter" className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Filter:</label>
            <select
              id="billing-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            >
              <option value="">All</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button onClick={fetchAll} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold ml-auto">
              Apply Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Item</th>
                  <th className="p-4 font-semibold text-center">Amount</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Refund</th>
                  <th className="p-4 font-semibold">Order ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/20">
                    <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 dark:text-white font-medium truncate max-w-[140px]">{tx.userName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-500">{tx.userEmail}</div>
                    </td>
                    <td className="p-4 text-slate-900 dark:text-white">{tx.purchaseName}</td>
                    <td className="p-4 text-center text-blue-400 font-bold">₹{tx.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        tx.status === "SUCCESSFUL" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        tx.status === "FAILED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        tx.status === "REFUNDED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-gray-500/10 text-slate-500 dark:text-slate-400 border border-gray-500/20"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-semibold ${
                        tx.refundStatus === "APPROVED" ? "text-green-400" :
                        tx.refundStatus === "REJECTED" ? "text-red-400" :
                        tx.refundStatus === "REQUESTED" ? "text-amber-400" :
                        "text-gray-600"
                      }`}>
                        {tx.refundStatus}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-500 text-[10px] font-mono truncate max-w-[120px]">{tx.orderId}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-500">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PLANS TAB ─── */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Plans</h3>
            <button
              onClick={() => { resetPlanForm(); setShowPlanForm(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-xl transition-all"
            >
              + New Plan
            </button>
          </div>

          {showPlanForm && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{editPlan ? "Edit Plan" : "Create New Plan"}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="plan-name" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Plan Name</label>
                  <input id="plan-name" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. 3 Months Premium" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="plan-price" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Price (₹)</label>
                  <input id="plan-price" type="number" value={planPrice} onChange={(e) => setPlanPrice(e.target.value)} placeholder="699" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="plan-duration" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Duration (Days)</label>
                  <input id="plan-duration" type="number" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} placeholder="90" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="plan-features" className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Features (one per line)</label>
                <textarea
                  id="plan-features"
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  rows={4}
                  placeholder="Unlimited Mock Tests&#10;Premium Study Material&#10;Advanced Analytics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={resetPlanForm} className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={handleSavePlan} className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-xl">{editPlan ? "Update Plan" : "Create Plan"}</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className={`p-5 border rounded-2xl ${plan.active ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" : "bg-slate-50 dark:bg-slate-950 border-gray-900 opacity-50"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</h4>
                    <p className="text-lg font-black text-indigo-400 mt-1">₹{plan.price.toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${plan.active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {plan.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 mb-3">{plan.duration} days</p>
                <div className="space-y-1 mb-4">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Check size={10} className="text-emerald-500 mt-0.5" />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditPlan(plan)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">Edit</button>
                  {plan.active && <button onClick={() => handleDeletePlan(plan.id)} className="text-[10px] text-red-400 hover:text-red-300 font-semibold">Deactivate</button>}
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-4 text-center py-12 text-slate-500 dark:text-slate-500 text-sm">
                No plans created yet. Click &quot;New Plan&quot; to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── REFUNDS TAB ─── */}
      {activeTab === "refunds" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Item</th>
                  <th className="p-4 font-semibold text-center">Amount</th>
                  <th className="p-4 font-semibold">Reason</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {refundRequests.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-800">
                    <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 dark:text-white font-medium">{tx.userName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-500">{tx.userEmail}</div>
                    </td>
                    <td className="p-4 text-slate-900 dark:text-white">{tx.purchaseName}</td>
                    <td className="p-4 text-center text-blue-400 font-bold">₹{tx.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{tx.refundReason || "—"}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRefundAction(tx.id, "APPROVE")}
                          disabled={processing === tx.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                          <Check size={10} /> Approve
                        </button>
                        <button
                          onClick={() => handleRefundAction(tx.id, "REJECT")}
                          disabled={processing === tx.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <X size={10} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {refundRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-500">
                      No pending refund requests. 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
