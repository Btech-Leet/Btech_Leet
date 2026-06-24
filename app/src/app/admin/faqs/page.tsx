"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Plus, Edit2, ToggleLeft, ToggleRight, Loader2, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  pageUrl: string;
  order: number;
  active: boolean;
}

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  const { toast } = useToast();

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editingFaq;
    const url = isEdit ? `/api/admin/faqs/${editingFaq.id}` : "/api/admin/faqs";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          pageUrl,
          order: Number(order),
          active,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: isEdit ? "FAQ updated successfully" : "FAQ created successfully",
          variant: "success",
        });
        resetForm();
        fetchFaqs();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save FAQ",
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
      setSubmitting(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setPageUrl(faq.pageUrl);
    setOrder(faq.order);
    setActive(faq.active);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Success",
          description: "FAQ deleted successfully",
          variant: "success",
        });
        fetchFaqs();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete FAQ",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const res = await fetch(`/api/admin/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !faq.active }),
      });

      if (res.ok) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === faq.id ? { ...f, active: !f.active } : f))
        );
        toast({
          title: "Success",
          description: "FAQ visibility toggled",
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setPageUrl("");
    setOrder(0);
    setActive(true);
  };

  // Group FAQs by page URL for easier management
  const groupedFaqs = faqs.reduce<Record<string, FAQ[]>>((acc, faq) => {
    if (!acc[faq.pageUrl]) acc[faq.pageUrl] = [];
    acc[faq.pageUrl].push(faq);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={24} className="text-blue-500" />
            Manage FAQs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add, edit and organize FAQs across site pages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FAQ Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-fit shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            {editingFaq ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editingFaq ? "Edit FAQ" : "Add New FAQ"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Page URL</label>
              <input
                type="text"
                required
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="/exams/haryana-leet"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-500">
                E.g. `/`, `/exams`, `/papers` or any custom dynamic URL slug.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Question</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is Haryana LEET eligibility?"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Answer</label>
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Candidates must have passed Diploma in Engineering..."
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sort Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold py-2"
                >
                  {active ? (
                    <ToggleRight className="text-green-500 w-8 h-8" />
                  ) : (
                    <ToggleLeft className="text-gray-600 w-8 h-8" />
                  )}
                  <span>{active ? "Visible" : "Hidden"}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save FAQ
              </button>

              {editingFaq && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* FAQs List grouped by Page URL */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(groupedFaqs).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
              No FAQs created yet. Use the form on the left to add one!
            </div>
          ) : (
            Object.entries(groupedFaqs).map(([url, urlFaqs]) => (
              <div key={url} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                
                {/* Group Header */}
                <div className="bg-slate-50 dark:bg-slate-950/60 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-blue-400 font-mono">{url}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500 font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    {urlFaqs.length} FAQs
                  </span>
                </div>

                {/* FAQ List */}
                <div className="divide-y divide-gray-850">
                  {urlFaqs.map((faq) => (
                    <div key={faq.id} className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 dark:bg-slate-800/20 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold font-mono">
                            Order {faq.order}
                          </span>
                          {faq.question}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-14 md:pl-0">{faq.answer}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleToggleActive(faq)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            faq.active
                              ? "text-green-400 border-green-950 hover:bg-green-950/20"
                              : "text-gray-600 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                          title={faq.active ? "Click to Hide" : "Click to Show"}
                        >
                          {faq.active ? "Visible" : "Hidden"}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(faq)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
