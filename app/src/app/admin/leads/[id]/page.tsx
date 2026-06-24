"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  StickyNote,
  Send,
  Tag,
  ExternalLink,
  Crown,
  BarChart3,
  Save,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface LeadNote {
  id: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

interface LeadDetail {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  collegeName: string | null;
  branch: string | null;
  sourcePage: string | null;
  sourceUrl: string | null;
  landingPage: string | null;
  referrerPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  status: string;
  remarks: string | null;
  userId: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileComplete: number;
    premiumStatus: boolean;
    mobile: string | null;
    state: string | null;
    collegeName: string | null;
    branch: string | null;
  } | null;
  notes: LeadNote[];
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
  CONTACTED:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
  INTERESTED:
    "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900/30",
  CONVERTED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
  NOT_INTERESTED:
    "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/30",
};

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksValue, setRemarksValue] = useState("");
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  const fetchLead = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      if (!res.ok) throw new Error("Failed to fetch lead");
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
        setRemarksValue(data.data.remarks || "");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load lead details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      setLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast({ title: "Status Updated" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveRemarks = async () => {
    setIsSavingRemarks(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: remarksValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save remarks");
      setLead((prev) => (prev ? { ...prev, remarks: remarksValue } : null));
      setEditingRemarks(false);
      toast({ title: "Remarks Saved" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingRemarks(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSendingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add note");

      setLead((prev) =>
        prev ? { ...prev, notes: [data.data, ...prev.notes] } : null
      );
      setNewNote("");
      toast({ title: "Note Added" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-32 text-slate-500 dark:text-slate-400">
        <Target className="mx-auto mb-4 text-slate-600 dark:text-slate-300" size={48} />
        <h3 className="font-bold text-gray-800 dark:text-slate-700 dark:text-slate-200">
          Lead Not Found
        </h3>
        <Link
          href="/admin/leads"
          className="text-violet-500 hover:underline text-sm mt-2 inline-block"
        >
          ← Back to Leads
        </Link>
      </div>
    );
  }

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    isLink,
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
    isLink?: boolean;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 dark:border-slate-200 dark:border-slate-800/50 last:border-0">
        <Icon
          size={14}
          className="text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-0.5">
            {label}
          </p>
          {isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1 break-all"
            >
              {value} <ExternalLink size={10} />
            </a>
          ) : (
            <p className="text-sm text-gray-900 dark:text-slate-900 dark:text-white break-all">
              {value}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-violet-500 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Leads
      </Link>

      {/* Header Card */}
      <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white text-xl font-bold flex-shrink-0">
              {(lead.name || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-900 dark:text-white">
                {lead.name || "Unknown Lead"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Created{" "}
                {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Status Changer */}
          <div className="flex items-center gap-3">
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className={`text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer focus:outline-none ${
                statusColors[lead.status] || "bg-gray-100 text-gray-600"
              } ${updatingStatus ? "opacity-50" : ""}`}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="CONVERTED">Converted</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & College Info */}
          <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={14} className="text-violet-500" />
              Contact Information
            </h2>
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow icon={Phone} label="Mobile" value={lead.mobile} />
            <InfoRow icon={Building2} label="College" value={lead.collegeName} />
            <InfoRow icon={Tag} label="Branch" value={lead.branch} />
          </div>

          {/* Source Tracking */}
          <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe size={14} className="text-cyan-500" />
              Source & Tracking
            </h2>
            <InfoRow icon={Globe} label="Source Page" value={lead.sourcePage} />
            <InfoRow
              icon={ExternalLink}
              label="Source URL"
              value={lead.sourceUrl}
              isLink
            />
            <InfoRow
              icon={Globe}
              label="Landing Page"
              value={lead.landingPage}
            />
            <InfoRow
              icon={ExternalLink}
              label="Referrer"
              value={lead.referrerPage}
              isLink
            />
            <InfoRow icon={Tag} label="UTM Source" value={lead.utmSource} />
            <InfoRow icon={Tag} label="UTM Medium" value={lead.utmMedium} />
            <InfoRow icon={Tag} label="UTM Campaign" value={lead.utmCampaign} />
          </div>

          {/* Remarks */}
          <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                <StickyNote size={14} className="text-amber-500" />
                Remarks
              </h2>
              {!editingRemarks ? (
                <button
                  onClick={() => setEditingRemarks(true)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveRemarks}
                    disabled={isSavingRemarks}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:underline disabled:opacity-50"
                  >
                    <Save size={10} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingRemarks(false);
                      setRemarksValue(lead.remarks || "");
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:underline"
                  >
                    <X size={10} /> Cancel
                  </button>
                </div>
              )}
            </div>
            {editingRemarks ? (
              <textarea
                value={remarksValue}
                onChange={(e) => setRemarksValue(e.target.value)}
                rows={3}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                placeholder="Add remarks about this lead..."
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {lead.remarks || (
                  <span className="text-slate-500 dark:text-slate-400 italic">No remarks yet.</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Right column - Notes & Linked User */}
        <div className="space-y-6">
          {/* Linked User */}
          {lead.user && (
            <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <User size={14} className="text-blue-500" />
                Linked User Account
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-slate-900 dark:text-white text-sm font-bold">
                    {lead.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white">
                      {lead.user.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {lead.user.email}
                    </p>
                  </div>
                </div>

                {/* Profile Completion */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Profile Completion
                    </p>
                    <p className="text-xs font-bold text-gray-600 dark:text-slate-600 dark:text-slate-300">
                      {lead.user.profileComplete}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-violet-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${lead.user.profileComplete}%`,
                      }}
                    />
                  </div>
                </div>

                {lead.user.premiumStatus && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <Crown size={12} /> Premium Member
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <StickyNote size={14} className="text-violet-500" />
              Notes ({lead.notes.length})
            </h2>

            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                placeholder="Add a note about this lead..."
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-200 dark:border-slate-800 bg-transparent text-gray-900 dark:text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none mb-2"
              />
              <button
                onClick={handleAddNote}
                disabled={isSendingNote || !newNote.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {isSendingNote ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}{" "}
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {lead.notes.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center py-4">
                  No notes yet.
                </p>
              ) : (
                lead.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 dark:bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 space-y-1"
                  >
                    <p className="text-sm text-gray-800 dark:text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                        {note.createdBy || "Admin"}
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
