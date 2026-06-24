"use client";

import { useEffect, useState, useRef } from "react";
import { FileText, Plus, Edit2, Loader2, Save, Trash2, Camera, Check, X, Eye, Globe } from "lucide-react";
import { useToast } from "@/components/ui/toaster";

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  keywords: string[];
  status: string;
}

export default function AdminCmsPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editing, setEditing] = useState<CmsPage | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/cms-pages");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "cms");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setFeaturedImage(data.data.url);
        toast({ title: "Success", description: "Image uploaded", variant: "success" });
      } else {
        toast({ title: "Upload Failed", description: data.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload", variant: "destructive" });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const isEdit = !!editing;
    const url = isEdit ? `/api/admin/cms-pages/${editing.id}` : "/api/admin/cms-pages";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          featuredImage: featuredImage || null,
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

  const handleEdit = (page: CmsPage) => {
    setEditing(page);
    setTitle(page.title);
    setContent(page.content);
    setFeaturedImage(page.featuredImage || null);
    setMetaTitle(page.metaTitle || "");
    setMetaDesc(page.metaDesc || "");
    setKeywords(page.keywords.join(", "));
    setStatus(page.status);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this CMS page?")) return;
    try {
      const res = await fetch(`/api/admin/cms-pages/${id}`, { method: "DELETE" });
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

  const toggleStatus = async (page: CmsPage) => {
    const newStatus = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/cms-pages/${page.id}`, {
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
    setTitle(""); setContent(""); setFeaturedImage(null); setMetaTitle("");
    setMetaDesc(""); setKeywords(""); setStatus("DRAFT");
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-pink-500" />
            CMS Pages
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create and manage custom content pages</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
          <Plus size={16} /> New Page
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editing ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
            {editing ? "Edit CMS Page" : "Create New Page"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Page Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="About Us"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="w-24 h-16 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                {imageUploading ? (
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                ) : featuredImage ? (
                  <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-gray-700" />
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                  <Camera size={14} /> {featuredImage ? "Change Image" : "Upload Featured Image"}
                </button>
                {featuredImage && (
                  <button type="button" onClick={() => setFeaturedImage(null)}
                    className="ml-2 text-xs text-red-400 hover:text-red-300">Remove</button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Content (HTML)</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="<h2>Welcome</h2><p>Your content here...</p>"
                rows={12}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none font-mono" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SEO Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Keywords</label>
                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)}
                  placeholder="about, btech leet, lateral entry"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Meta Description</label>
              <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} maxLength={160} rows={2}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 placeholder-gray-700 resize-none" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting}
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                Save Page
              </button>
              <button type="button" onClick={resetForm}
                className="px-5 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        {pages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-500 shadow-sm">
            No CMS pages created yet.
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {page.featuredImage && (
                  <div className="w-16 h-11 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0">
                    <img src={page.featuredImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{page.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      page.status === "PUBLISHED"
                        ? "bg-green-950/30 text-green-400 border-green-900/30"
                        : page.status === "ARCHIVED"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border-slate-300 dark:border-slate-700"
                        : "bg-amber-950/30 text-amber-400 border-amber-900/30"
                    }`}>
                      {page.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Globe size={11} /> /page/{page.slug}
                  </p>
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
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Edit">
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
