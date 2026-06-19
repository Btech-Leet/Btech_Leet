"use client";

import { useEffect, useState } from "react";
import { Sparkles, Plus, Edit2, Loader2, Save, Trash2, Check, X, Eye, Globe } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface BestAnswerPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  faqSection?: any;
  internalLinks?: any;
  metaTitle?: string | null;
  metaDesc?: string | null;
  keywords: string[];
  status: string;
  views: number;
}

export default function AdminBestAnswersPage() {
  const [pages, setPages] = useState<BestAnswerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<BestAnswerPage | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/best-answers");
      if (res.ok) {
        const data = await res.json();
        setPages(data.data);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editing;
    const url = isEdit ? `/api/admin/best-answers/${editing.id}` : "/api/admin/best-answers";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          metaTitle: metaTitle || null,
          metaDesc: metaDesc || null,
          keywords: keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : [],
          status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: isEdit ? "Page updated" : "Page created", variant: "success" });
        resetForm();
        fetchPages();
      } else {
        toast({ title: "Error", description: data.message || "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (page: BestAnswerPage) => {
    setEditing(page);
    setTitle(page.title);
    setContent(page.content);
    setMetaTitle(page.metaTitle || "");
    setMetaDesc(page.metaDesc || "");
    setKeywords(page.keywords.join(", "));
    setStatus(page.status);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    try {
      const res = await fetch(`/api/admin/best-answers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Success", description: "Page deleted", variant: "success" });
        fetchPages();
      } else {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const toggleStatus = async (page: BestAnswerPage) => {
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/best-answers/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, status: newStatus } : p));
        toast({ title: "Success", description: "Status updated", variant: "success" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setTitle(""); setContent(""); setMetaTitle(""); setMetaDesc("");
    setKeywords(""); setStatus("DRAFT");
    setShowForm(false);
  };

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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={24} className="text-cyan-500" />
            Best Answer Pages
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create SEO-optimized best answer content pages</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Page
        </button>
      </div>

      {/* Form (shown conditionally) */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {editing ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editing ? "Edit Page" : "Create New Best Answer Page"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Page Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="What is BTech LEET? Complete Guide 2026"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Content (HTML or Markdown)</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full answer content here..."
                rows={10}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none font-mono" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">SEO Title (max 70 chars)</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70}
                  placeholder="BTech LEET - Full Guide"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Keywords (comma-separated)</label>
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                  placeholder="leet, btech lateral entry, engineering"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase">Meta Description (max 160 chars)</label>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} maxLength={160} rows={2}
                placeholder="Comprehensive guide about BTech Lateral Entry..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting}
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                Save Page
              </button>
              <button type="button" onClick={resetForm}
                className="px-5 py-2 text-sm font-bold rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        {pages.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 shadow-sm">
            No best answer pages created yet.
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-200 text-sm truncate">{page.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    page.status === "PUBLISHED"
                      ? "bg-green-950/30 text-green-400 border-green-900/30"
                      : page.status === "ARCHIVED"
                      ? "bg-gray-800 text-gray-500 border-gray-700"
                      : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                  }`}>
                    {page.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Globe size={11} /> /answers/{page.slug}</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {page.views} views</span>
                  {page.keywords.length > 0 && (
                    <span className="truncate max-w-[200px]">{page.keywords.join(", ")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleStatus(page)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
                    page.status === "PUBLISHED"
                      ? "bg-green-950/30 text-green-400 border-green-900/30 hover:bg-green-900/40"
                      : "bg-amber-950/30 text-amber-400 border-amber-900/30 hover:bg-amber-900/40"
                  }`}>
                  {page.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => handleEdit(page)}
                  className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Edit">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(page.id)}
                  className="p-1.5 rounded-lg border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/40 transition-colors" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
