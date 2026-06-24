"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Merge,
  Mail,
  Phone,
  Eye,
  Check,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface DuplicateLead {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  collegeName: string | null;
  branch: string | null;
  status: string;
  createdAt: string;
}

interface DuplicateGroup {
  type: "email" | "mobile";
  value: string;
  leads: DuplicateLead[];
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  CONTACTED: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  INTERESTED: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400",
  CONVERTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  NOT_INTERESTED: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function DuplicateLeadsPage() {
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mergingGroup, setMergingGroup] = useState<number | null>(null);
  const [selectedPrimary, setSelectedPrimary] = useState<
    Record<number, string>
  >({});
  const { toast } = useToast();

  const fetchDuplicates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/leads/duplicates");
      if (!res.ok) throw new Error("Failed to fetch duplicates");
      const data = await res.json();
      if (data.success) {
        setGroups(data.data || []);
        // Pre-select first lead in each group as primary
        const defaults: Record<number, string> = {};
        (data.data || []).forEach((g: DuplicateGroup, i: number) => {
          if (g.leads.length > 0) {
            defaults[i] = g.leads[0].id;
          }
        });
        setSelectedPrimary(defaults);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load duplicates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleMerge = async (groupIndex: number) => {
    const group = groups[groupIndex];
    const primaryId = selectedPrimary[groupIndex];

    if (!primaryId) {
      toast({
        title: "Select Primary",
        description: "Please select which lead to keep as the primary.",
        variant: "destructive",
      });
      return;
    }

    const duplicateIds = group.leads
      .filter((l) => l.id !== primaryId)
      .map((l) => l.id);

    if (duplicateIds.length === 0) return;

    if (
      !confirm(
        `Merge ${duplicateIds.length} duplicate(s) into the selected primary lead? This action cannot be undone.`
      )
    )
      return;

    setMergingGroup(groupIndex);
    try {
      const res = await fetch("/api/admin/leads/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryId, duplicateIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Merge failed");

      // Remove merged group from the list
      setGroups(groups.filter((_, i) => i !== groupIndex));
      toast({
        title: "Merged Successfully",
        description: `${duplicateIds.length} duplicate lead(s) merged into the primary.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setMergingGroup(null);
    }
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

      {/* Header */}
      <div className="border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={24} />
          Duplicate Detection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">
          Leads with matching email addresses or mobile numbers are grouped
          below. Select a primary lead and merge to consolidate records.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-slate-500 dark:text-slate-400 shadow-sm max-w-lg mx-auto">
          <Check
            className="mx-auto text-emerald-400 mb-4"
            size={48}
          />
          <h3 className="font-bold text-gray-800 dark:text-slate-700 dark:text-slate-200">
            No Duplicates Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            All leads have unique email addresses and mobile numbers. Great!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
            Found {groups.length} duplicate group{groups.length > 1 ? "s" : ""}.
            Select the primary lead (the one to keep) in each group, then click
            Merge.
          </p>

          {groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 dark:bg-slate-100 dark:bg-slate-800/50 px-5 py-3 border-b border-gray-100 dark:border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {group.type === "email" ? (
                    <Mail size={14} className="text-blue-500" />
                  ) : (
                    <Phone size={14} className="text-green-500" />
                  )}
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-900 dark:text-white">
                    Matching {group.type}: {group.value}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {group.leads.length} leads
                  </span>
                </div>

                <button
                  onClick={() => handleMerge(gIdx)}
                  disabled={mergingGroup === gIdx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {mergingGroup === gIdx ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Merge size={12} />
                  )}{" "}
                  Merge
                </button>
              </div>

              {/* Leads in Group */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {group.leads.map((lead) => {
                  const isPrimary = selectedPrimary[gIdx] === lead.id;
                  return (
                    <div
                      key={lead.id}
                      className={`px-5 py-3 flex items-center gap-4 transition-colors cursor-pointer ${
                        isPrimary
                          ? "bg-violet-50/50 dark:bg-violet-950/20 border-l-4 border-violet-500"
                          : "hover:bg-gray-50/50 dark:hover:bg-slate-100 dark:hover:bg-slate-800/20 border-l-4 border-transparent"
                      }`}
                      onClick={() =>
                        setSelectedPrimary((prev) => ({
                          ...prev,
                          [gIdx]: lead.id,
                        }))
                      }
                    >
                      {/* Radio */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isPrimary
                            ? "border-violet-500 bg-violet-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isPrimary && (
                          <Check size={12} className="text-slate-900 dark:text-white" />
                        )}
                      </div>

                      {/* Lead Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-900 dark:text-white">
                            {lead.name || "—"}
                          </p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              statusColors[lead.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {lead.status}
                          </span>
                          {isPrimary && (
                            <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {lead.email && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                              <Mail size={9} /> {lead.email}
                            </p>
                          )}
                          {lead.mobile && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                              <Phone size={9} /> {lead.mobile}
                            </p>
                          )}
                          {lead.collegeName && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {lead.collegeName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date + View */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={9} />
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                        >
                          <Eye size={10} /> View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
