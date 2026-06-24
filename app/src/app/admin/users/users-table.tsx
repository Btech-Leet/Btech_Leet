"use client";

import { useState } from "react";
import { Search, Shield, Mail, Phone, MapPin, Building, GitBranch, Calendar, Trophy, Star, X, Check, Eye } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatar?: string | null;
  mobile?: string | null;
  state?: string | null;
  collegeName?: string | null;
  branch?: string | null;
  passingYear?: number | null;
  examTargets: string[];
  profileComplete: number;
  premiumStatus: boolean;
  approvalStatus: string;
  createdAt: string;
}

interface UsersTableProps {
  initialUsers: User[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedPremium, setSelectedPremium] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Extract unique states for filters
  const states = Array.from(new Set(initialUsers.map(u => u.state).filter(Boolean))) as string[];

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.mobile && user.mobile.includes(searchTerm)) ||
      (user.collegeName && user.collegeName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesState = !selectedState || user.state === selectedState;
    
    const matchesPremium =
      !selectedPremium ||
      (selectedPremium === "premium" && user.premiumStatus) ||
      (selectedPremium === "regular" && !user.premiumStatus);

    const matchesTarget = !selectedTarget || user.examTargets.includes(selectedTarget);

    return matchesSearch && matchesState && matchesPremium && matchesTarget;
  });

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch("/api/admin/premium-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: currentStatus ? "REVOKE" : "GRANT",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Success",
          description: currentStatus ? "Premium access revoked" : "Premium access granted",
          variant: "success",
        });
        setUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, premiumStatus: !currentStatus } : u)
        );
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, premiumStatus: !currentStatus } : null);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update premium status",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 gap-4 flex flex-col md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, mobile or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All States</option>
          {states.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Premium Filter */}
        <select
          value={selectedPremium}
          onChange={(e) => setSelectedPremium(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="premium">Premium Users</option>
          <option value="regular">Regular Users</option>
        </select>

        {/* Exam Target Filter */}
        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Exam Targets</option>
          <option value="HARYANA_LEET">Haryana LEET</option>
          <option value="ALL_INDIA_LEET">All India LEET</option>
          <option value="PUNJAB_LEET">Punjab LEET</option>
          <option value="CHANDIGARH_LEET">Chandigarh LEET</option>
          <option value="B_PHARMACY_LEET">B.Pharmacy LEET</option>
          <option value="OTHER_LEET">Other LEET</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User Details</th>
                <th className="px-5 py-3.5 font-semibold">Contact & State</th>
                <th className="px-5 py-3.5 font-semibold">College & Branch</th>
                <th className="px-5 py-3.5 font-semibold">Exam Targets</th>
                <th className="px-5 py-3.5 font-semibold text-center">Premium</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 dark:text-slate-500">
                    No users match the search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    
                    {/* User Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-800/50 flex items-center justify-center text-blue-400 font-bold overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            {user.name}
                            {user.role === 'ADMIN' && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 text-[10px] font-bold border border-purple-800/30">
                                ADMIN
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact & State */}
                    <td className="px-5 py-4">
                      <p className="text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1">
                        <Phone size={12} className="text-slate-500 dark:text-slate-500" /> {user.mobile || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gray-600" /> {user.state || "N/A"}
                      </p>
                    </td>

                    {/* College & Branch */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="text-slate-600 dark:text-slate-300 font-medium text-xs truncate flex items-center gap-1" title={user.collegeName || ""}>
                        <Building size={12} className="text-slate-500 dark:text-slate-500" /> {user.collegeName || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 truncate flex items-center gap-1 mt-1" title={user.branch || ""}>
                        <GitBranch size={12} className="text-gray-600" /> {user.branch || "N/A"}
                      </p>
                    </td>

                    {/* Exam Targets */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {user.examTargets && user.examTargets.length > 0 ? (
                          user.examTargets.map((target) => (
                            <span key={target} className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded">
                              {target.replace(/_LEET/g, "")}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-600 text-xs italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Premium Status */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => togglePremium(user.id, user.premiumStatus)}
                        disabled={updatingUser === user.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                          user.premiumStatus
                            ? "bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/40"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        <Star size={12} className={user.premiumStatus ? "fill-amber-400" : ""} />
                        {user.premiumStatus ? "Premium" : "Regular"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                        title="View User Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={20} className="text-blue-500" /> User Profile Information
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-900/30 border border-blue-800/40 flex items-center justify-center text-blue-400 text-2xl font-bold overflow-hidden flex-shrink-0">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.premiumStatus && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                        PREMIUM
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Joined on {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mobile */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">Mobile</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                    <Phone size={14} className="text-blue-500" />
                    {selectedUser.mobile || <span className="text-gray-600 font-normal italic">Not Filled</span>}
                  </p>
                </div>

                {/* State */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">State</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                    <MapPin size={14} className="text-blue-500" />
                    {selectedUser.state || <span className="text-gray-600 font-normal italic">Not Filled</span>}
                  </p>
                </div>

                {/* College */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">College</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                    <Building size={14} className="text-blue-500" />
                    {selectedUser.collegeName || <span className="text-gray-600 font-normal italic">Not Filled</span>}
                  </p>
                </div>

                {/* Branch */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">Branch</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                    <GitBranch size={14} className="text-blue-500" />
                    {selectedUser.branch || <span className="text-gray-600 font-normal italic">Not Filled</span>}
                  </p>
                </div>

                {/* Passing Year */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">Passing Year</span>
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                    <Calendar size={14} className="text-blue-500" />
                    {selectedUser.passingYear || <span className="text-gray-600 font-normal italic">Not Filled</span>}
                  </p>
                </div>

                {/* Profile Completion */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block mb-1">Profile Completion</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedUser.profileComplete}%` }} />
                    </div>
                    <span className="text-xs font-bold text-blue-400">{selectedUser.profileComplete}%</span>
                  </div>
                </div>

              </div>

              {/* Exam Targets */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide block">Target Exams</span>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.examTargets && selectedUser.examTargets.length > 0 ? (
                    selectedUser.examTargets.map((target) => (
                      <span key={target} className="px-2.5 py-1 text-xs font-bold uppercase bg-blue-900/20 text-blue-400 border border-blue-800/30 rounded-lg flex items-center gap-1.5">
                        <Trophy size={12} />
                        {target.replace(/_/g, " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 dark:text-slate-500 text-xs italic">No exam targets set yet</span>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-3">
              <button
                onClick={() => togglePremium(selectedUser.id, selectedUser.premiumStatus)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  selectedUser.premiumStatus
                    ? "bg-red-950/40 text-red-400 border-red-900/30 hover:bg-red-900/40"
                    : "bg-amber-950/40 text-amber-400 border-amber-900/30 hover:bg-amber-900/40"
                }`}
              >
                <Star size={12} className={selectedUser.premiumStatus ? "" : "fill-amber-400"} />
                {selectedUser.premiumStatus ? "Revoke Premium" : "Grant Premium"}
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
