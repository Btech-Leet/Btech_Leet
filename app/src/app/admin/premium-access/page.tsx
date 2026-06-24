"use client";

import { useEffect, useState, useRef } from "react";
import { Crown, Plus, Edit2, Trash2, Loader2, Save, X, Search, Calendar, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface PremiumAccess {
  id: string;
  userId: string;
  userName: string;
  email: string;
  mobile: string | null;
  planName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  grantedBy: string | null;
  notes: string | null;
  createdAt: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
}

export default function AdminPremiumAccessPage() {
  const [grants, setGrants] = useState<PremiumAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Search User State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [planName, setPlanName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "EXPIRED" | "REVOKED">("ACTIVE");
  const [notes, setNotes] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGrants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/premium-access");
      if (!res.ok) throw new Error("Failed to fetch premium access logs");
      const data = await res.json();
      if (data.success) {
        setGrants(data.data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load premium access logs.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  // Debounced user search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSearchResults(data.data || []);
          }
        }
      } catch (err) {
        console.error("User search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setPlanName("");
    setStartDate("");
    setEndDate("");
    setStatus("ACTIVE");
    setNotes("");
  };

  const handleStartEdit = (grant: PremiumAccess) => {
    setEditingId(grant.id);
    setSelectedUser({
      id: grant.userId,
      name: grant.userName,
      email: grant.email,
      mobile: grant.mobile,
    });
    setPlanName(grant.planName);
    
    // Format dates (YYYY-MM-DDTHH:MM)
    const start = new Date(grant.startDate);
    const startFormatted = start.toISOString().slice(0, 16);
    const end = new Date(grant.endDate);
    const endFormatted = end.toISOString().slice(0, 16);

    setStartDate(startFormatted);
    setEndDate(endFormatted);
    setStatus(grant.status);
    setNotes(grant.notes || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast({ title: "Validation Error", description: "Please select a user first.", variant: "destructive" });
      return;
    }
    if (!planName.trim()) {
      toast({ title: "Validation Error", description: "Plan name is required.", variant: "destructive" });
      return;
    }
    if (!startDate || !endDate) {
      toast({ title: "Validation Error", description: "Start and End dates are required.", variant: "destructive" });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      toast({ title: "Validation Error", description: "End date must be after start date.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      userId: selectedUser.id,
      userName: selectedUser.name,
      email: selectedUser.email,
      mobile: selectedUser.mobile,
      planName: planName.trim(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status,
      notes: notes.trim() || null,
    };

    try {
      const url = editingId ? `/api/admin/premium-access/${editingId}` : "/api/admin/premium-access";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to grant premium access");

      toast({
        title: "Success",
        description: editingId ? "Premium grant updated successfully." : "Premium access granted successfully.",
      });

      handleResetForm();
      fetchGrants();
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
    if (!confirm("Are you sure you want to delete this premium access grant? This will recalculate user premium status.")) return;

    try {
      const res = await fetch(`/api/admin/premium-access/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete premium access");

      setGrants(grants.filter((g) => g.id !== id));
      toast({
        title: "Success",
        description: "Premium access grant deleted successfully.",
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
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/20",
    EXPIRED: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/20",
    REVOKED: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/20",
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
          <Crown className="text-amber-500" size={24} />
          Premium User Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">
          Manually grant or revoke full premium status and mock test access to students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2">
            {editingId ? "Edit Access Grant" : "Grant Premium Access"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Search & Display */}
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Select User
              </label>
              
              {selectedUser ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-250 bg-emerald-50/20 dark:border-emerald-900/30 text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="text-emerald-500 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-950 dark:text-slate-900 dark:text-white truncate">{selectedUser.name}</p>
                      <p className="text-[10px] text-gray-450 dark:text-slate-500 dark:text-slate-500 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  {!editingId && (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-slate-500 dark:text-slate-400 hover:text-red-500 font-bold"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Search Results Dropdown */}
                  {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-850">
                      {isSearching ? (
                        <div className="flex justify-center items-center py-4 text-xs text-gray-450">
                          <Loader2 size={14} className="animate-spin text-amber-500 mr-2" /> Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                          No users found.
                        </div>
                      ) : (
                        searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-between transition-colors text-xs font-semibold"
                          >
                            <div className="min-w-0 pr-4">
                              <p className="text-gray-900 dark:text-slate-900 dark:text-white truncate">{user.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
                            </div>
                            <span className="text-[10px] text-blue-500 font-bold uppercase">Select</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Plan Name */}
            <div className="space-y-1">
              <label htmlFor="plan-name" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Plan Name
              </label>
              <input
                id="plan-name"
                type="text"
                required
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Full Access Premium Pass"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Status (For Editing) */}
            <div className="space-y-1">
              <label htmlFor="grant-status" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Status
              </label>
              <select
                id="grant-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REVOKED">REVOKED</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label htmlFor="start-date" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Start Date
              </label>
              <input
                id="start-date"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label htmlFor="end-date" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                End Date
              </label>
              <input
                id="end-date"
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label htmlFor="grant-notes" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Notes / Remarks
              </label>
              <textarea
                id="grant-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Granted for student coupon feedback / manual cash payment."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : editingId ? (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Grant Access
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

        {/* Grants List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-900 dark:text-white border-b border-gray-55 dark:border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
            Premium Access Grants ({grants.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={28} className="animate-spin text-amber-500" />
            </div>
          ) : grants.length === 0 ? (
            <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500 dark:text-slate-400 shadow-sm">
              <Crown className="mx-auto text-slate-600 dark:text-slate-300 dark:text-gray-700 mb-4" size={48} />
              <h3 className="font-bold text-gray-800 dark:text-slate-700 dark:text-slate-200">No Premium Grants</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">No manual premium access grants have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {grants.map((grant) => {
                const start = new Date(grant.startDate);
                const end = new Date(grant.endDate);

                return (
                  <div
                    key={grant.id}
                    className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow duration-300"
                  >
                    {/* Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-gray-900 dark:text-slate-900 dark:text-white">
                          {grant.userName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${statusColors[grant.status]}`}>
                          {grant.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400">
                        <p>
                          Email: <strong className="text-gray-700 dark:text-slate-600 dark:text-slate-300">{grant.email}</strong>
                          {grant.mobile && ` | Mobile: ${grant.mobile}`}
                        </p>
                        <p>
                          Plan: <span className="font-bold text-amber-600 dark:text-amber-400">{grant.planName}</span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            {start.toLocaleDateString("en-IN")} to {end.toLocaleDateString("en-IN")}
                          </span>
                        </p>
                        {grant.grantedBy && (
                          <p>
                            Granted By: <span className="font-medium text-gray-650 dark:text-gray-350">{grant.grantedBy}</span>
                          </p>
                        )}
                        {grant.notes && (
                          <p className="italic text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-50 dark:bg-slate-950 p-2 rounded border border-gray-100 dark:border-slate-200 dark:border-slate-800/50 mt-1">
                            Note: {grant.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 border-gray-50 dark:border-slate-200 dark:border-slate-800/40 pt-3 sm:pt-0">
                      <button
                        onClick={() => handleStartEdit(grant)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(grant.id)}
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
