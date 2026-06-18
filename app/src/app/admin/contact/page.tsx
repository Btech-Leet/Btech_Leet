"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Search, Filter, Mail, Phone, Download, Check, RefreshCw, Trash2, Send, CornerDownRight, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED" | "REPLIED";
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();

  // Reply Draft State
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      let url = "/api/admin/contact";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch contact inquiries");
      const data = await res.json();
      if (data.success) {
        setInquiries(data.data || []);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load inquiries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, searchQuery]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setInquiries(inquiries.map((inq) => (inq.id === id ? { ...inq, status: status as any } : inq)));
      toast({
        title: "Status Updated",
        description: `Inquiry status changed to ${status.toLowerCase()}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please write a reply first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit reply");

      setInquiries(
        inquiries.map((inq) =>
          inq.id === id
            ? {
                ...inq,
                reply: replyText.trim(),
                status: "REPLIED",
                repliedAt: new Date().toISOString(),
              }
            : inq
        )
      );
      setActiveReplyId(null);
      setReplyText("");
      toast({
        title: "Reply Saved",
        description: "Reply recorded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact inquiry?")) return;

    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete inquiry");

      setInquiries(inquiries.filter((inq) => inq.id !== id));
      toast({
        title: "Deleted",
        description: "Inquiry deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    window.open("/api/admin/contact/export", "_blank");
  };

  const statusColors = {
    NEW: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/20",
    READ: "bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-400 border-gray-200 dark:border-gray-900/20",
    RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20",
    REPLIED: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/20",
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={24} />
            Contact Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            View student messages, draft responses, mark resolutions, and export logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>

        {/* Status dropdown filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 shadow-sm self-start sm:self-auto">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-transparent border-none text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Messages</option>
            <option value="READ">Read Messages</option>
            <option value="RESOLVED">Resolved Only</option>
            <option value="REPLIED">Replied Only</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-16 text-center text-gray-400 shadow-sm max-w-lg mx-auto">
          <MessageSquare className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
          <h3 className="font-bold text-gray-800 dark:text-gray-200">No Inquiries Found</h3>
          <p className="text-xs text-gray-500 mt-1">There are no contact messages matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => {
            const isReplying = activeReplyId === inq.id;

            return (
              <div
                key={inq.id}
                onClick={() => {
                  if (inq.status === "NEW") {
                    handleStatusUpdate(inq.id, "READ");
                  }
                }}
                className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4 ${
                  inq.status === "NEW" ? "border-blue-400 dark:border-blue-500/50" : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                      {inq.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {inq.email}
                      </span>
                      {inq.mobile && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {inq.mobile}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[inq.status]}`}>
                      {inq.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Message Box */}
                <div className="space-y-1 bg-gray-50/50 dark:bg-gray-950/20 p-4 rounded-xl border border-gray-100 dark:border-gray-850/50">
                  <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">
                    Subject: {inq.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mt-2">
                    {inq.message}
                  </p>
                </div>

                {/* Reply display */}
                {inq.reply && (
                  <div className="flex gap-2.5 items-start pl-4 sm:pl-6 text-xs sm:text-sm border-l-2 border-purple-500/40">
                    <CornerDownRight size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-600 dark:text-purple-400">Response Recorded</span>
                        {inq.repliedAt && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            on {new Date(inq.repliedAt).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap italic">
                        &quot;{inq.reply}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {/* Reply Composer inline */}
                {isReplying && (
                  <div className="pl-4 sm:pl-6 border-l-2 border-blue-500 space-y-2">
                    <label className="text-xs font-bold text-gray-450 uppercase tracking-wider block">
                      Draft Reply Remarks
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Write response notes or actions taken..."
                      disabled={isSubmittingReply}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendReply(inq.id)}
                        disabled={isSubmittingReply}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSubmittingReply ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Send size={12} />
                        )}{" "}
                        Submit Reply
                      </button>
                      <button
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText("");
                        }}
                        disabled={isSubmittingReply}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-850/40">
                  {!inq.reply && !isReplying && (
                    <button
                      onClick={() => {
                        setActiveReplyId(inq.id);
                        setReplyText("");
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                    >
                      <Send size={12} /> Reply / Log Response
                    </button>
                  )}
                  {inq.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleStatusUpdate(inq.id, "RESOLVED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                    >
                      <Check size={12} /> Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(inq.id)}
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
  );
}
