"use client";

import React, { useState, useEffect } from "react";
import { 
  PhoneCall, Users, DollarSign, Edit3, Save, CheckCircle2, 
  Clock, Download, RefreshCw, AlertCircle, Search, Info 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Registration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  leetExam: string;
  rank: string | null;
  status: string;
  amountPaid: number;
  invoiceNumber: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    mobile: string;
  };
}

export default function AdminCounsellingPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [price, setPrice] = useState<number>(999);
  const [inputPrice, setInputPrice] = useState<string>("999");
  
  const [loading, setLoading] = useState(true);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [regRes, priceRes] = await Promise.all([
        fetch("/api/admin/counselling/registrations"),
        fetch("/api/admin/counselling/settings"),
      ]);

      const regJson = await regRes.json();
      const priceJson = await priceRes.json();

      if (regJson.success) {
        setRegistrations(regJson.data || []);
      } else {
        setErrorMsg("Failed to load registrations.");
      }

      if (priceJson.success && priceJson.data) {
        setPrice(priceJson.data.price);
        setInputPrice(String(priceJson.data.price));
      }
    } catch (err) {
      console.error("Error fetching admin counselling data:", err);
      setErrorMsg("Failed to fetch counselling settings and registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPrice(true);
    setPriceSuccess(false);
    setErrorMsg("");

    const numericPrice = Number(inputPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setErrorMsg("Price must be a valid number greater than or equal to 0.");
      setUpdatingPrice(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/counselling/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: numericPrice }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPrice(numericPrice);
        setPriceSuccess(true);
        setTimeout(() => setPriceSuccess(false), 3000);
      } else {
        setErrorMsg(json.message || "Failed to update price.");
      }
    } catch (err) {
      console.error("Price update error:", err);
      setErrorMsg("Failed to update pricing setting.");
    } finally {
      setUpdatingPrice(false);
    }
  };

  // Stats calculation
  const totalRegistrations = registrations.length;
  const successfulRegistrations = registrations.filter(r => r.status === "SUCCESSFUL");
  const paidRegistrations = successfulRegistrations.filter(r => r.amountPaid > 0);
  const totalRevenue = successfulRegistrations.reduce((sum, r) => sum + r.amountPaid, 0);

  // Filtered registrations
  const filteredRegs = registrations.filter((reg) => {
    const term = searchQuery.toLowerCase();
    return (
      reg.name.toLowerCase().includes(term) ||
      reg.email.toLowerCase().includes(term) ||
      reg.mobile.toLowerCase().includes(term) ||
      reg.leetExam.toLowerCase().includes(term) ||
      (reg.invoiceNumber && reg.invoiceNumber.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <RefreshCw className="animate-spin text-blue-500 mb-4" size={36} />
        <p className="text-sm">Loading counselling management dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-white max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="text-blue-500" size={28} />
            Counselling Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage premium counselling pricing, view registered students, and access invoices.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
          <RefreshCw size={14} className="mr-2" /> Refresh Data
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pricing and Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Price Config Card (5 Columns) */}
        <div className="lg:col-span-5">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Edit3 className="text-blue-400" size={16} />
                Pricing Configuration
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                Set active fee for the premium lateral entry counselling service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdatePrice} className="space-y-4">
                <div>
                  <label htmlFor="counselling-price" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Counselling Service Price (INR)</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-500 text-sm">
                      ₹
                    </div>
                    <input
                      id="counselling-price"
                      type="number"
                      required
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      placeholder="0 for free"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                  <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-normal">
                    {price <= 0 ? (
                      <span className="text-emerald-400 font-bold">Currently FREE: </span>
                    ) : (
                      <span>Current Price is <strong>₹{price}</strong>. </span>
                    )}
                    If set to 0, users will be registered for free instantly without loading the payment gateway.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={updatingPrice} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs"
                >
                  {updatingPrice ? (
                    <><RefreshCw size={14} className="animate-spin mr-1.5" /> Saving...</>
                  ) : priceSuccess ? (
                    <><CheckCircle2 size={14} className="mr-1.5 text-emerald-400" /> Price Updated!</>
                  ) : (
                    <><Save size={14} className="mr-1.5" /> Update Price</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid (7 Columns) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="text-blue-400" size={24} />
                <span className="text-3xl font-black text-slate-900 dark:text-white">{totalRegistrations}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Paid & pending combined</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Paid & Active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={24} />
                <span className="text-3xl font-black text-slate-900 dark:text-white">{successfulRegistrations.length}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">{paidRegistrations.length} paid, {successfulRegistrations.length - paidRegistrations.length} free registrations</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-2">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Total Revenue Generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="text-amber-500" size={24} />
                <span className="text-3xl font-black text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">Total earnings from counselling fees</p>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Registrations List */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900 dark:text-white text-base">Registered Students</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Students enrolled for lateral entry guidance program.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, exam, invoice..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredRegs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-500">
              <Users className="mx-auto mb-3" size={40} />
              <p className="text-sm font-bold">No Registrations Found</p>
              <p className="text-xs text-gray-600 mt-0.5">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Student Name</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Exam & Rank</th>
                  <th className="p-4 font-semibold text-center">Amount Paid</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg) => (
                  <tr key={reg.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/20">
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {reg.name}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-200">{reg.email}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{reg.mobile}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 dark:text-slate-200">{reg.leetExam}</div>
                      {reg.rank && <div className="text-blue-400 font-medium mt-0.5">Rank: {reg.rank}</div>}
                    </td>
                    <td className="p-4 text-center text-blue-400 font-bold">
                      ₹{reg.amountPaid.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        reg.status === "SUCCESSFUL" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {reg.status === "SUCCESSFUL" && reg.invoiceNumber ? (
                        <a
                          href={`/api/invoice/${reg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          <Download size={12} />
                          {reg.invoiceNumber}
                        </a>
                      ) : (
                        <span className="text-gray-600">—</span>
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
  );
}
