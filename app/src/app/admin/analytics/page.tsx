"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Crown, MessageSquare, Tag, Send, Mail, RefreshCw, 
  Download, Calendar, BarChart3, PieChart as PieIcon, 
  MapPin, GraduationCap, Building2, BookOpen, AlertTriangle,
  TrendingUp, FileText, ClipboardList
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e", "#06b6d4", "#ec4899", "#14b8a6"];

interface OverviewData {
  totalUsers: number;
  premiumUsers: number;
  recentRegistrations: number;
  monthlyRegistrations: number;
  totalReviews: number;
  pendingReviews: number;
  activeCoupons: number;
  totalContacts: number;
  newContacts: number;
  totalBooks: number;
  totalToppers: number;
  totalExperts: number;
  totalBlogPosts: number;
  totalMockTests: number;
  totalLeads: number;
  totalPremiumGrants: number;
  emailCampaignsSent: number;
}

interface TrendItem {
  label: string;
  count: number;
}

interface UserSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface UsersTrendData {
  trend: TrendItem[];
  summary: UserSummary;
}

interface SimpleStat {
  collegeName?: string;
  branch?: string;
  state?: string;
  target?: string;
  count: number;
}

interface ReportData {
  summary: {
    newUsers: number;
    premiumGranted: number;
    contactInquiries: number;
    reviewsSubmitted: number;
    leadsCreated: number;
    campaignsSent: number;
  };
  breakdown: Array<{
    date: string;
    users: number;
    leads: number;
    premium: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "demographics" | "reports">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Analytics data
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [usersTrend, setUsersTrend] = useState<UsersTrendData | null>(null);
  const [userTrendRange, setUserTrendRange] = useState<"7days" | "30days" | "12months">("30days");
  
  // Demographics state
  const [colleges, setColleges] = useState<SimpleStat[]>([]);
  const [branches, setBranches] = useState<SimpleStat[]>([]);
  const [states, setStates] = useState<SimpleStat[]>([]);
  const [examTargets, setExamTargets] = useState<SimpleStat[]>([]);

  // Reports state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchOverview();
    fetchUsersTrend(userTrendRange);
  }, []);

  useEffect(() => {
    fetchUsersTrend(userTrendRange);
  }, [userTrendRange]);

  useEffect(() => {
    if (activeTab === "demographics") {
      fetchDemographics();
    }
  }, [activeTab]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics/overview");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch overview statistics");
      setOverview(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersTrend = async (range: string) => {
    try {
      const res = await fetch(`/api/admin/analytics/users?range=${range}`);
      const data = await res.json();
      if (res.ok) {
        setUsersTrend(data.data);
      }
    } catch (err) {
      console.error("Failed to load user trends:", err);
    }
  };

  const fetchDemographics = async () => {
    try {
      setLoading(true);
      const [colRes, brRes, stRes, exRes] = await Promise.all([
        fetch("/api/admin/analytics/college?limit=8"),
        fetch("/api/admin/analytics/branch?limit=8"),
        fetch("/api/admin/analytics/state?limit=8"),
        fetch("/api/admin/analytics/exam-target"),
      ]);

      const [col, br, st, ex] = await Promise.all([
        colRes.json(),
        brRes.json(),
        stRes.json(),
        exRes.json(),
      ]);

      setColleges(col.data || []);
      setBranches(br.data || []);
      setStates(st.data || []);
      setExamTargets(ex.data || []);
    } catch (err) {
      console.error("Failed to load demographics:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setReportLoading(true);
      const res = await fetch(`/api/admin/analytics/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate report");
      setReportData(data.data);
    } catch (err: any) {
      alert(err.message || "Something went wrong while generating the report.");
    } finally {
      setReportLoading(false);
    }
  };

  const exportReportCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "BTech LEET Custom Analytics Report\n";
    csvContent += `Period: ${startDate} to ${endDate}\n\n`;
    
    // Summary
    csvContent += "Metric,Value\n";
    csvContent += `New Registrations,${reportData.summary.newUsers}\n`;
    csvContent += `Premium Access Granted,${reportData.summary.premiumGranted}\n`;
    csvContent += `Leads Created,${reportData.summary.leadsCreated}\n`;
    csvContent += `Contact Inquiries,${reportData.summary.contactInquiries}\n`;
    csvContent += `Reviews Submitted,${reportData.summary.reviewsSubmitted}\n`;
    csvContent += `Campaigns Sent,${reportData.summary.campaignsSent}\n\n`;

    // Daily Breakdown
    csvContent += "Date,New Users,Leads Created,Premium Access\n";
    reportData.breakdown.forEach((row) => {
      csvContent += `${row.date},${row.users},${row.leads},${row.premium}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BTech_LEET_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={36} />
        <p className="text-gray-400">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={24} />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Detailed growth statistics, demographics, and report generators.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              fetchOverview();
              fetchUsersTrend(userTrendRange);
              if (activeTab === "demographics") fetchDemographics();
            }}
            className="border-gray-800 text-gray-300 hover:text-white"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "demographics", label: "User Demographics", icon: PieIcon },
          { id: "reports", label: "Reports Generator", icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all -mb-px ${
                isActive 
                  ? "border-blue-500 text-blue-400" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-red-400">Error Loading Analytics</p>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      )}

      {/* ─── TAB 1: OVERVIEW ─── */}
      {activeTab === "overview" && overview && (
        <div className="space-y-6 animate-fadeIn">
          {/* Card Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Registered Users</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-blue-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span>+{overview.recentRegistrations}</span> this week
                  </p>
                </div>
                <div className="p-2.5 bg-blue-950/50 rounded-lg border border-blue-900/30">
                  <Users size={18} className="text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Premium Access Users</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.premiumUsers.toLocaleString()}</p>
                  <p className="text-xs text-purple-400 mt-1.5 font-medium">
                    {overview.totalUsers > 0 ? ((overview.premiumUsers / overview.totalUsers) * 100).toFixed(1) : 0}% Conversion Rate
                  </p>
                </div>
                <div className="p-2.5 bg-purple-950/50 rounded-lg border border-purple-900/30">
                  <Crown size={18} className="text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total CRM Leads</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.totalLeads.toLocaleString()}</p>
                  <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                    Follow-ups pending
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-950/50 rounded-lg border border-emerald-900/30">
                  <TrendingUp size={18} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pending Reviews</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.pendingReviews.toLocaleString()}</p>
                  <p className="text-xs text-amber-400 mt-1.5 font-medium">
                    {overview.totalReviews} total reviews
                  </p>
                </div>
                <div className="p-2.5 bg-amber-950/50 rounded-lg border border-amber-900/30">
                  <MessageSquare size={18} className="text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Active Coupon Codes</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.activeCoupons.toLocaleString()}</p>
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">
                    Promotional offers active
                  </p>
                </div>
                <div className="p-2.5 bg-rose-950/50 rounded-lg border border-rose-900/30">
                  <Tag size={18} className="text-rose-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Contact Inquiries</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.totalContacts.toLocaleString()}</p>
                  <p className="text-xs text-cyan-400 mt-1.5 font-medium">
                    {overview.newContacts} new / unresolved
                  </p>
                </div>
                <div className="p-2.5 bg-cyan-950/50 rounded-lg border border-cyan-900/30">
                  <Mail size={18} className="text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">E-books & Notes</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.totalBooks.toLocaleString()}</p>
                  <p className="text-xs text-indigo-400 mt-1.5 font-medium">
                    Active on platform
                  </p>
                </div>
                <div className="p-2.5 bg-indigo-950/50 rounded-lg border border-indigo-900/30">
                  <BookOpen size={18} className="text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email Campaigns</p>
                  <p className="text-2xl font-bold text-white mt-1">{overview.emailCampaignsSent.toLocaleString()}</p>
                  <p className="text-xs text-teal-400 mt-1.5 font-medium">
                    Campaigns completed
                  </p>
                </div>
                <div className="p-2.5 bg-teal-950/50 rounded-lg border border-teal-900/30">
                  <Send size={18} className="text-teal-400" />
                </div>
              </div>
            </div>
          </div>

          {/* User Registration Trend Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
              <div>
                <CardTitle className="text-white">User Growth Analysis</CardTitle>
                <CardDescription className="text-gray-400">Track registration spikes and steady user onboarding</CardDescription>
              </div>
              <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800 self-start">
                {(["7days", "30days", "12months"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserTrendRange(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      userTrendRange === r 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {r === "7days" ? "7 Days" : r === "30days" ? "30 Days" : "12 Months"}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {usersTrend ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usersTrend.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#fff" }}
                        labelClassName="font-semibold text-blue-400 text-xs"
                      />
                      <Area type="monotone" dataKey="count" name="New Users" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-500">
                  <RefreshCw className="animate-spin text-gray-600 mr-2" size={16} />
                  Loading trend data...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick breakdown metrics of other sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Content Assets</CardTitle>
                <CardDescription className="text-xs">Summary of resources uploaded</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Mock Tests</span>
                  <span className="text-sm font-semibold text-white">{overview.totalMockTests} tests</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Blog Posts</span>
                  <span className="text-sm font-semibold text-white">{overview.totalBlogPosts} posts</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Successful Toppers</span>
                  <span className="text-sm font-semibold text-white">{overview.totalToppers} entries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Subject Experts</span>
                  <span className="text-sm font-semibold text-white">{overview.totalExperts} experts</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Growth & Conversions</CardTitle>
                <CardDescription className="text-xs">Leads & premium upgrades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Premium Access Grants</span>
                  <span className="text-sm font-semibold text-purple-400">{overview.totalPremiumGrants} grants</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Total Leads Ingested</span>
                  <span className="text-sm font-semibold text-emerald-400">{overview.totalLeads} leads</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">New Registration Rate</span>
                  <span className="text-sm font-semibold text-blue-400">{overview.recentRegistrations} users / wk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Monthly Registration Rate</span>
                  <span className="text-sm font-semibold text-cyan-400">{overview.monthlyRegistrations} users / mo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Inquiries & Feedback</CardTitle>
                <CardDescription className="text-xs">Response queue status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Unanswered Inquiries</span>
                  <span className={`text-sm font-semibold ${overview.newContacts > 0 ? "text-amber-400" : "text-gray-300"}`}>
                    {overview.newContacts} unresolved
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Total Inquiries</span>
                  <span className="text-sm font-semibold text-white">{overview.totalContacts} received</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-sm text-gray-400">Pending Review Audits</span>
                  <span className={`text-sm font-semibold ${overview.pendingReviews > 0 ? "text-amber-400" : "text-gray-300"}`}>
                    {overview.pendingReviews} pending
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total User Reviews</span>
                  <span className="text-sm font-semibold text-white">{overview.totalReviews} reviews</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DEMOGRAPHICS ─── */}
      {activeTab === "demographics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Colleges Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="text-blue-500" size={18} />
                Student Distribution by College
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">Top colleges where LEET students are registered</CardDescription>
            </CardHeader>
            <CardContent>
              {colleges.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={colleges} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="collegeName" stroke="#9ca3af" fontSize={11} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                      <Bar dataKey="count" name="Students" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-10">No college registration details recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Branches Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GraduationCap className="text-purple-500" size={18} />
                Student Distribution by Academic Branch
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">Branch selection of registered engineering students</CardDescription>
            </CardHeader>
            <CardContent>
              {branches.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branches} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="branch" stroke="#9ca3af" fontSize={11} width={80} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                      <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-10">No academic branch details recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* States Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="text-emerald-500" size={18} />
                Geographical Distribution (States)
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">States where registered students reside</CardDescription>
            </CardHeader>
            <CardContent>
              {states.length > 0 ? (
                <div className="h-[280px] flex justify-center items-center">
                  <div className="w-[60%] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={states}
                          dataKey="count"
                          nameKey="state"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          fill="#8884d8"
                        >
                          {states.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-[40%] flex flex-col gap-2 justify-center pr-2">
                    {states.map((item, index) => (
                      <div key={item.state} className="flex items-center gap-2 text-xs">
                        <span 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300 truncate max-w-[80px]">{item.state}</span>
                        <span className="text-gray-500 font-semibold ml-auto">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-10">No geographical details recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Exam Targets Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="text-amber-500" size={18} />
                User Distribution by Exam Target
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">Exam targets checked by users in their profile settings</CardDescription>
            </CardHeader>
            <CardContent>
              {examTargets.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examTargets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="target" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151" }} />
                      <Bar dataKey="count" name="Students" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-10">No exam targets chosen by users yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: REPORTS GENERATOR ─── */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Setup controls */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Generate Period Growth Report</CardTitle>
              <CardDescription className="text-gray-400 text-xs">Specify a custom timeframe to fetch audit details and download CSV reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-end gap-4 max-w-2xl">
                <div className="flex-1 space-y-1.5 w-full">
                  <label htmlFor="startDate" className="text-xs font-semibold text-gray-400">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  <label htmlFor="endDate" className="text-xs font-semibold text-gray-400">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-800 bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <Button 
                  onClick={generateReport} 
                  loading={reportLoading}
                  className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-semibold w-full sm:w-auto"
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Display */}
          {reportData ? (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { title: "New Users", value: reportData.summary.newUsers, color: "text-blue-400", bg: "bg-blue-950/20 border-blue-900/30" },
                  { title: "Premium Access Granted", value: reportData.summary.premiumGranted, color: "text-purple-400", bg: "bg-purple-950/20 border-purple-900/30" },
                  { title: "CRM Leads Created", value: reportData.summary.leadsCreated, color: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/30" },
                  { title: "Contact Inquiries", value: reportData.summary.contactInquiries, color: "text-cyan-400", bg: "bg-cyan-950/20 border-cyan-900/30" },
                  { title: "Reviews Submitted", value: reportData.summary.reviewsSubmitted, color: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/30" },
                  { title: "Campaigns Completed", value: reportData.summary.campaignsSent, color: "text-teal-400", bg: "bg-teal-950/20 border-teal-900/30" },
                ].map((stat) => (
                  <div key={stat.title} className={`border rounded-xl p-4 flex flex-col justify-between ${stat.bg}`}>
                    <span className="text-xs text-gray-400 font-medium">{stat.title}</span>
                    <span className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Table breakdown & Export button */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-white">Daily breakdown stats</CardTitle>
                    <CardDescription className="text-gray-400 text-xs">Chronological representation of user onboarding and lead logs</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportReportCSV}
                    className="border-gray-800 text-gray-300 hover:text-white"
                  >
                    <Download size={14} className="mr-1.5" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  {reportData.breakdown.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-10">No daily logs registered in this timeframe.</p>
                  ) : (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-y border-gray-800 bg-gray-950 text-gray-400">
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">New Users</th>
                          <th className="p-4 font-semibold">Leads Created</th>
                          <th className="p-4 font-semibold">Premium Upgrades</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.breakdown.map((row) => (
                          <tr key={row.date} className="border-b border-gray-800 hover:bg-gray-850/50">
                            <td className="p-4 text-white font-medium">{row.date}</td>
                            <td className="p-4 text-blue-400 font-semibold">{row.users}</td>
                            <td className="p-4 text-emerald-400 font-semibold">{row.leads}</td>
                            <td className="p-4 text-purple-400 font-semibold">{row.premium}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-gray-900/50 border-gray-800 border-dashed py-16 flex flex-col items-center justify-center text-center">
              <Calendar className="text-gray-600 mb-3" size={36} />
              <h3 className="text-gray-300 font-semibold">No report generated</h3>
              <p className="text-gray-500 text-xs max-w-xs mt-1">Select date ranges above and click 'Generate Report' to visualize details.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
